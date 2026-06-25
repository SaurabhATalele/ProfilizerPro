# Requirements Document

## Introduction

This feature adds a capability to ProfilizePro available to all authenticated users: an authenticated user pastes or uploads a job description (JD), and the platform produces a tailored, editable set of assessment questions (MCQ, coding, and aptitude). The authenticated user reviews and edits the generated set before anything is persisted as a reusable Test in the existing test-attempt flow. Login is still required so that anonymous visitors cannot consume LLM resources. Generation uses a two-stage LLM pipeline (extract structured hiring signal, then generate questions), and every generated set records provenance so generated content remains auditable.

Scope is intentionally tight: only what is needed to take a JD to an editable, savable Test. No auto-publishing, no cross-set similarity detection, no new state-management library, UI kit, or HTTP client beyond what the platform already uses.

## Glossary

- **JD_Generator**: The overall feature subsystem that turns a job description into an editable question set and a saved Test.
- **JD_Parser**: The Stage 1 component that calls the LLM once to extract role, seniority, and skills from raw JD text.
- **Question_Generator**: The Stage 2 component that calls the LLM to produce a structured question set from a confirmed parse.
- **LLM_Client**: The wrapper around the Anthropic Messages API used by JD_Parser and Question_Generator.
- **Review_UI**: The user-facing wizard for input, parse confirmation, mix configuration, and question review.
- **Job_Description**: A persisted staging document holding raw JD text, source type, and parsed fields.
- **Generated_Question_Set**: A persisted staging document holding the generated questions, requested mix, and provenance.
- **Generated_Question**: A single question object of kind `mcq`, `coding`, or `aptitude` within a Generated_Question_Set.
- **Test**: The platform's existing Test document used by the test-attempt flow.
- **Provenance**: The `generatedFrom` record `{ jdHash, model, promptVersion }` stored on each Generated_Question_Set.
- **Mix**: The requested counts of `{ mcq, coding, aptitude }` questions.
- **User**: Any authenticated user with a valid session, identified by the user identifier carried in the JWT.
- **Minimum_JD_Length**: The lower bound on JD input length below which input is rejected (50 words).
- **Regenerate_Cooldown**: The minimum time interval a User must wait between single-question regeneration requests.

## Requirements

### Requirement 1: Authenticated User Access

**User Story:** As a platform owner, I want JD-based question generation restricted to authenticated users, so that anonymous visitors cannot spend LLM resources and create Tests.

#### Acceptance Criteria

1. IF a request to any JD_Generator route is made without a valid authenticated session, THEN THE JD_Generator SHALL reject the request with an authorization error and SHALL NOT call the LLM_Client.
2. WHERE a request is unauthenticated, THE JD_Generator SHALL deny access to the Review_UI.
3. WHEN a User with a valid session accesses a JD_Generator route, THE JD_Generator SHALL authorize the request using the existing authentication middleware pattern (`getAuthUser`/`requireAuth`).

### Requirement 2: JD Input by Paste or Upload

**User Story:** As a User, I want to paste JD text or upload a file, so that I can start generation from whatever source I have.

#### Acceptance Criteria

1. WHEN a User submits pasted JD text, THE JD_Generator SHALL accept the text and record the source type as `paste`.
2. WHEN a User uploads a `.txt`, `.pdf`, or `.docx` file, THE JD_Generator SHALL extract the text content and record the source type as `upload`.
3. IF an uploaded file is not a `.txt`, `.pdf`, or `.docx` file, THEN THE JD_Generator SHALL reject the upload with a descriptive error.
4. IF a User submits pasted text together with an unsupported file upload, THEN THE JD_Generator SHALL process the pasted text and ignore the unsupported upload.
5. IF JD input contains fewer than Minimum_JD_Length words, THEN THE JD_Generator SHALL reject the input with a descriptive error and SHALL NOT call the LLM_Client.

### Requirement 3: JD Parsing (Stage 1)

**User Story:** As a User, I want the system to extract role, seniority, and skills from the JD, so that question generation targets the right competencies.

#### Acceptance Criteria

1. WHEN a User requests JD parsing for valid JD input, THE JD_Parser SHALL call the LLM_Client once and return `role`, `seniority`, `skills`, `mustHave`, and `niceToHave`.
2. THE JD_Parser SHALL constrain `seniority` to one of `intern`, `junior`, `mid`, `senior`, or `lead`.
3. IF the LLM_Client returns malformed or schema-invalid JSON, THEN THE JD_Parser SHALL retry once with a stricter JSON-only instruction.
4. IF the LLM_Client returns malformed or schema-invalid JSON after one retry, THEN THE JD_Parser SHALL immediately return a parse error with HTTP status 400 and SHALL NOT attempt further processing.
5. IF the parsing result indicates the input is not a job description, THEN THE JD_Parser SHALL return a `not_a_job_description` error and SHALL NOT proceed to generation.

### Requirement 4: Confirm and Edit Parsed Signal

**User Story:** As a User, I want to confirm and edit the extracted role, seniority, and skills, so that bad extractions do not propagate into the question set.

#### Acceptance Criteria

1. WHEN parsing completes, THE Review_UI SHALL display the parsed `role`, `seniority`, and `skills` in an editable form.
2. WHEN a User removes a skill from the parsed set, THE Review_UI SHALL exclude that skill from the data sent to the Question_Generator.
3. WHEN a User adds a skill to the parsed set, THE Review_UI SHALL include that skill in the data sent to the Question_Generator.
4. WHEN a User edits the role or seniority, THE Review_UI SHALL send the edited values to the Question_Generator.
5. THE JD_Generator SHALL validate that skills removed by a User are excluded from the payload sent to the Question_Generator before initiating generation.

### Requirement 5: Question Set Generation (Stage 2)

**User Story:** As a User, I want a structured question set generated from the confirmed signal, so that I get questions matched to the role's skills and my requested mix.

#### Acceptance Criteria

1. WHEN a User submits a confirmed parse with a Mix, a target difficulty, and optional preferred languages, THE Question_Generator SHALL call the LLM_Client and return a question set.
2. THE Question_Generator SHALL constrain target difficulty to one of `easy`, `medium`, `hard`, or `mixed`.
3. THE Question_Generator SHALL validate the LLM_Client output against a schema before returning the question set.
4. IF the LLM_Client output fails schema validation, THEN THE Question_Generator SHALL retry once with a stricter instruction.
5. IF the LLM_Client output fails schema validation after one retry, THEN THE Question_Generator SHALL return a generation error and SHALL NOT persist a partial set.
6. THE Question_Generator SHALL assign each generated MCQ and coding question a `skillTag` drawn from the confirmed `mustHave` or `niceToHave` skills.
7. THE Question_Generator SHALL assign each generated coding question at least three test cases with at least one marked hidden.
8. WHERE a skill has no realistic coding-question equivalent, THE Question_Generator SHALL produce questions for that skill as MCQ or aptitude rather than coding.
9. IF the requested Mix counts cannot be filled for the confirmed skills, THEN THE Question_Generator SHALL generate the questions it can and report the shortfall in the response.

### Requirement 6: Persist Generated Set with Provenance

**User Story:** As a platform owner, I want each generated set persisted with provenance, so that generated content is auditable and not mistaken for hand-authored work.

#### Acceptance Criteria

1. WHEN a question set is generated, THE JD_Generator SHALL persist a Job_Description document and a Generated_Question_Set document and return their identifiers.
2. THE JD_Generator SHALL store Provenance `{ jdHash, model, promptVersion }` on each Generated_Question_Set.
3. THE JD_Generator SHALL record the prompt version as a versioned constant value at the time of generation.
4. THE JD_Generator SHALL record the creating User identifier, taken from the JWT, on the Job_Description and the Generated_Question_Set.

### Requirement 7: Review and Edit Questions

**User Story:** As a User, I want to review and edit every generated question before saving, so that nothing is published without my approval.

#### Acceptance Criteria

1. WHEN generation completes, THE Review_UI SHALL display the generated questions grouped by kind with difficulty and skillTag indicators.
2. WHEN a User edits a question's content, THE JD_Generator SHALL save the edited content and mark that question as edited.
3. WHEN a User deletes a question, THE JD_Generator SHALL remove that question from the Generated_Question_Set.
4. WHEN a User adds a question manually, THE JD_Generator SHALL include that question in the Generated_Question_Set.
5. THE JD_Generator SHALL NOT publish or persist any question set as a Test until a User explicitly approves it.

### Requirement 8: Regenerate a Single Question

**User Story:** As a User, I want to regenerate one question without affecting the others, so that I can fix a single weak question cheaply.

#### Acceptance Criteria

1. WHEN a User requests regeneration of a question at a given index, THE Question_Generator SHALL replace only the question at that index.
2. THE Question_Generator SHALL preserve all questions a User has edited when regenerating a different question.
3. IF a User requests regeneration before the Regenerate_Cooldown has elapsed since the previous regeneration request, THEN THE JD_Generator SHALL reject the request with a rate-limit error and SHALL NOT call the LLM_Client.

### Requirement 9: Save Approved Set as a Test

**User Story:** As a User, I want to save the approved set as a real Test, so that candidates can attempt it through the existing flow.

#### Acceptance Criteria

1. WHEN a User approves a Generated_Question_Set with a title, duration, and passing score, THE JD_Generator SHALL create a Test document using the existing Test schema.
2. IF the supplied passing score is outside the range 0 to 100, THEN THE JD_Generator SHALL reject the approval with a validation error and SHALL NOT create a Test.
3. THE JD_Generator SHALL map each approved Generated_Question into the existing Question schema used by the test-attempt flow.
4. WHEN a Test is created from a Generated_Question_Set, THE JD_Generator SHALL record the created Test identifier on the Generated_Question_Set.
5. WHEN a Test is created from a Generated_Question_Set, THE JD_Generator SHALL make the Test immediately usable in the existing test-attempt flow without a separate code path.

### Requirement 10: Loading and Error Feedback

**User Story:** As a User, I want clear feedback during slow LLM calls and on failures, so that I am never left with a blank or silent screen.

#### Acceptance Criteria

1. WHILE an LLM-backed action is in progress, THE Review_UI SHALL display a loading indicator for that action.
2. IF an LLM-backed action fails, THEN THE Review_UI SHALL display a descriptive error message as soon as the failure is detected, even if the action has not fully completed.
3. IF an LLM_Client call exceeds the configured request timeout, THEN THE LLM_Client SHALL return a typed timeout error rather than blocking indefinitely.
