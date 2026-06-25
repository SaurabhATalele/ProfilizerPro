# Build Prompt: Auto-Generate Question Sets from a Job Description

> Copy everything below this line into Claude Code (or any coding agent) inside the ProfilizePro repo. It assumes `agents.md` is already in context / in the repo root — reference it explicitly when you paste this in.

---

## Context

You are working in **ProfilizePro**, a Next.js 14 App Router assessment platform. Follow every convention in `agents.md` exactly: TypeScript strict mode, `FC` typing, `@/` path aliases, the `Utils/Apicalls` → `Utils/api/Controllers` → `Utils/api/Models` layering, Tailwind with `dark:` support, and the existing Context API pattern (`ThemeContext`, `UserContext`, `TestContext`).

Do not introduce a new state management library, a new UI kit, or a new HTTP client. Reuse Axios/Fetch exactly as the existing Apicalls files do.

## Feature Goal

Build a feature available to **every logged-in user, not just admins**: **paste or upload a job description → get a tailored, editable question set (MCQ + coding + aptitude)**. What happens to that set next differs by role:

- **Any logged-in user** can generate a set and immediately self-attempt it as a **personal practice test** — useful for a candidate prepping for a specific JD they're targeting (ties directly into your existing resume-tailoring workflow: tailor the resume, then practice for the role with the same JD).
- **Admins** additionally get the option to **publish** an approved set as a real, official `Test` document that other candidates can be assigned or can discover/attempt on the platform.

This is the key behavioral split to implement correctly: generation and editing are identical for everyone; *publishing as an official test* is admin-only.

### Success criteria
- Any logged-in user pastes a JD (or uploads a `.txt`/`.pdf`/`.docx`) and selects a few generation parameters.
- System extracts role, seniority, and required skills from the JD.
- LLM generates a structured question set matching those skills, with a sensible mix across MCQ / coding / aptitude.
- The user reviews the generated set in an editable UI before anything is persisted — nothing auto-publishes, regardless of role.
- The user can regenerate individual questions, adjust difficulty, or delete/add questions before saving.
- A non-admin user's saved set becomes a **personal practice test** they can attempt themselves, visible only to them.
- An admin's saved set can additionally be published as a real `Test` document reusable in the existing test-attempt flow, visible to whoever Tests are normally visible to.
- Per-user generation is rate-limited/quota-capped, since this now scales with the whole user base, not a handful of admins.
- Track provenance (`generatedFrom: { jdHash, model, promptVersion }`) so generated content is auditable and not silently treated as hand-authored.

---

## 0. Roles & Permissions (read this before touching auth middleware)

| Action | Regular user | Admin |
|---|---|---|
| Parse a JD | ✅ | ✅ |
| Generate / edit / regenerate questions | ✅ | ✅ |
| Self-attempt own generated set as practice | ✅ | ✅ |
| View/manage own past generated sets | ✅ (own only) | ✅ (own only) |
| Publish a set as an official `Test` | ❌ | ✅ |
| View/manage *other users'* generated sets | ❌ | ✅ (for moderation, if needed) |

Implementation notes:
- Change all routes in Section 5 from "require admin auth" to **require any authenticated user**, then add a *separate*, explicit admin check only inside the `approve`/publish route. Don't gate the whole feature behind `user.isAdmin` — gate just the one action that needs it.
- Every `GeneratedQuestionSet` is scoped to `createdBy`. Regular users can only fetch/edit/delete their own; enforce this in the controller, not just by hiding UI — an API route that trusts the client to only ask for its own data is not actually scoped.
- **Quota / cost control is now a first-class concern.** Add a `dailyGenerationCount` (or similar) check per user before calling the LLM — e.g., N full generations/day and M single-question regenerations/day for non-admins, with a higher or unlimited ceiling for admins. Store this as a simple counter on the `User` model or a lightweight `UsageLog` collection, reset daily. Surface the remaining quota in the UI so users aren't surprised by a sudden block.
- Practice attempts (regular users attempting their own generated set) should **not** go through whatever "assignment" or "explore/enroll" logic existing official Tests use — a user attempting their own practice set should be able to start immediately, no admin assignment step required.

---



### `JobDescription.ts`
```typescript
import { Schema, model, models, Document } from "mongoose";

export interface IJobDescription extends Document {
  rawText: string;
  sourceType: "paste" | "upload";
  parsedRole?: string;
  parsedSeniority?: "intern" | "junior" | "mid" | "senior" | "lead";
  parsedSkills?: string[];
  createdBy: Schema.Types.ObjectId; // ref User — any logged-in user, not just admin
  createdAt: Date;
}

const JobDescriptionSchema = new Schema<IJobDescription>({
  rawText: { type: String, required: true },
  sourceType: { type: String, enum: ["paste", "upload"], required: true },
  parsedRole: String,
  parsedSeniority: { type: String, enum: ["intern", "junior", "mid", "senior", "lead"] },
  parsedSkills: [String],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.JobDescription || model<IJobDescription>("JobDescription", JobDescriptionSchema);
```

### `GeneratedQuestionSet.ts`
```typescript
import { Schema, model, models, Document } from "mongoose";

export type QuestionKind = "mcq" | "coding" | "aptitude";
export type QuestionStatus = "generated" | "edited" | "approved" | "rejected";

export interface IGeneratedQuestion {
  kind: QuestionKind;
  prompt: string;
  options?: string[];        // mcq only
  correctOptionIndex?: number; // mcq only
  starterCode?: string;       // coding only
  testCases?: { input: string; expectedOutput: string; hidden: boolean }[]; // coding only
  language?: string;          // coding only
  difficulty: "easy" | "medium" | "hard";
  skillTag: string;
  status: QuestionStatus;
  editedByAdmin: boolean;
}

export interface IGeneratedQuestionSet extends Document {
  jobDescriptionId: Schema.Types.ObjectId;
  title: string;
  questions: IGeneratedQuestion[];
  mix: { mcq: number; coding: number; aptitude: number }; // counts requested
  generatedFrom: { jdHash: string; model: string; promptVersion: string };
  savedAsTestId?: Schema.Types.ObjectId; // set once admin converts to a real Test
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
}

// ...schema definition mirroring the interface, following existing Model file conventions
```

> Reuse the existing `Test` / `Question` models for the final saved artifact — `GeneratedQuestionSet` is a *staging* collection, not a replacement. On "Save as Test," map `IGeneratedQuestion[]` into whatever your current `Question` schema expects.

---

## 2. Types — `Utils/types/JobDescriptionGenerator.ts`

Define shared request/response interfaces here, exported and imported on both client and server — do not redefine inline in components or controllers:

```typescript
export interface GenerateQuestionSetRequest {
  jdText: string;
  mix: { mcq: number; coding: number; aptitude: number };
  targetDifficulty: "easy" | "medium" | "hard" | "mixed";
  preferredLanguages?: string[]; // for coding questions, e.g. ["javascript", "python"]
}

export interface GenerateQuestionSetResponse {
  jobDescriptionId: string;
  questionSetId: string;
  parsedRole: string;
  parsedSeniority: string;
  parsedSkills: string[];
  questions: IGeneratedQuestion[]; // import from Model types
}
```

---

## 3. Backend — Controller + LLM Service

### `Utils/api/Controllers/QuestionGenerationController.ts`

Responsibilities (keep each as a separate exported function, matching existing controller granularity):
1. `parseJobDescription(rawText: string)` — calls the LLM once to extract `{ role, seniority, skills[] }` as strict JSON. Validate the shape before trusting it; if parsing fails, retry once with a stricter "return ONLY valid JSON" instruction, then fall back to a 400 error rather than silently guessing.
2. `generateQuestionSet(parsed, mix, targetDifficulty, preferredLanguages)` — calls the LLM with the prompt template in Section 4. Validate output against a Zod schema (add `zod` if not already a dependency) before returning. Reject and retry once on schema mismatch.
3. `persistGeneratedSet(...)` — writes `JobDescription` + `GeneratedQuestionSet` documents, returns IDs.
4. `regenerateSingleQuestion(questionSetId, questionIndex, instructions?)` — regenerates one question in place (cheaper than full regen; useful when the admin just dislikes one question).
5. `convertToTest(questionSetId)` — maps approved `IGeneratedQuestion[]` into your existing `Test`/`Question` schema and creates a real, immediately-usable Test document. Mark `savedAsTestId` on the set.

### LLM call wrapper

Create `Utils/api/llm/anthropicClient.ts` (or reuse one if it exists from your MCP server work) — a thin wrapper around the Anthropic Messages API. Key constraints:
- Model: use the current default model string from your account/config — do not hardcode a version that may go stale.
- Always request JSON-only output for structured steps; strip markdown fences defensively before `JSON.parse`.
- Wrap every call in try/catch; on failure return a typed error object, never throw raw to the API route.
- Add a request timeout (10–15s) — JD parsing and question generation are user-facing, blocking calls.

---

## 4. The Actual Generation Prompt (this is the prompt-within-the-feature — get this right, it's the core IP)

Use a two-stage LLM call, not one. One call to extract structured signal from messy JD text, a second to generate questions from that clean structure — this dramatically reduces hallucinated skills and irrelevant questions versus a single mega-prompt.

### Stage 1 — JD parsing system prompt
```
You are extracting structured hiring signal from a raw job description.
Return ONLY valid JSON, no preamble, no markdown fences.

Schema:
{
  "role": string,              // e.g. "Backend Engineer"
  "seniority": "intern" | "junior" | "mid" | "senior" | "lead",
  "skills": string[],          // 5-12 concrete, testable skills/technologies, no soft skills
  "mustHave": string[],        // subset of skills explicitly required
  "niceToHave": string[]       // subset of skills marked as a plus / preferred
}

Rules:
- Only include skills that can reasonably be turned into a technical question (no "good communicator", no "team player").
- If seniority isn't stated, infer conservatively from years-of-experience language.
- If the JD is not actually a job description, return {"error": "not_a_job_description"} instead of guessing.
```

### Stage 2 — Question generation system prompt
```
You generate technical assessment questions for a hiring platform.
Return ONLY a valid JSON array, no preamble, no markdown fences.

Input you will receive:
- role, seniority, mustHave skills, niceToHave skills
- requested mix: counts of mcq / coding / aptitude questions
- target difficulty: easy | medium | hard | mixed
- preferred coding languages (if any)

Output: an array of question objects matching this exact shape per kind:

MCQ:
{ "kind": "mcq", "prompt": string, "options": string[4], "correctOptionIndex": number,
  "difficulty": "easy"|"medium"|"hard", "skillTag": string }

Coding:
{ "kind": "coding", "prompt": string, "starterCode": string, "language": string,
  "testCases": [{ "input": string, "expectedOutput": string, "hidden": boolean }],
  "difficulty": "easy"|"medium"|"hard", "skillTag": string }

Aptitude:
{ "kind": "aptitude", "prompt": string, "options": string[4], "correctOptionIndex": number,
  "difficulty": "easy"|"medium"|"hard", "skillTag": "logical-reasoning"|"quantitative"|"verbal" }

Rules:
- Every question's skillTag must come from the provided mustHave/niceToHave list (aptitude tags excepted).
- Weight mustHave skills roughly 2x more frequently than niceToHave skills across the set.
- Coding questions must include at least 3 test cases, at least 1 hidden.
- Never generate a question whose answer depends on outdated library APIs without naming the version.
- Vary phrasing and scenario across questions — do not produce near-duplicate questions for the same skill.
- Match difficulty to seniority: junior skews easy/medium, senior skews medium/hard, unless target difficulty overrides this.
- If requested counts can't be sensibly filled (e.g., 10 coding questions for a role with 1 mustHave language), generate what's reasonable and note the shortfall in a trailing object: {"kind": "meta", "shortfall": "..."}.
```

Store both prompt strings as versioned constants (`PROMPT_VERSION = "v1"`) in `Utils/api/llm/prompts.ts` — bump the version string any time you edit wording, since `generatedFrom.promptVersion` is what makes regenerated sets auditable later.

---

## 5. API Routes — `app/api/v1/question-generation/`

| Route | Method | Purpose |
|---|---|---|
| `/api/v1/question-generation/parse-jd` | POST | Stage 1 only — returns parsed role/seniority/skills for admin to confirm/edit before spending tokens on full generation |
| `/api/v1/question-generation/generate` | POST | Stage 2 — takes confirmed parse + mix/difficulty, returns full question set, persists as `GeneratedQuestionSet` |
| `/api/v1/question-generation/[setId]/regenerate-question/[index]` | POST | Regenerate a single question |
| `/api/v1/question-generation/[setId]/approve` | POST | Convert approved set to a real Test |

All routes: validate `req.body` against the Zod schemas before touching the LLM, return typed errors, and require admin auth (reuse existing middleware pattern from `middleware.js`).

---

## 6. Apicalls — `Utils/Apicalls/QuestionGeneration.ts`

Mirror the existing pattern exactly (see `Login.ts`/`User.ts` for the shape):
```typescript
export const parseJobDescription = async (jdText: string): Promise<Response | false> => { ... }
export const generateQuestionSet = async (data: GenerateQuestionSetRequest): Promise<Response | false> => { ... }
export const regenerateQuestion = async (setId: string, index: number, instructions?: string): Promise<Response | false> => { ... }
export const approveQuestionSet = async (setId: string): Promise<Response | false> => { ... }
```

---

## 7. Frontend — `Components/Admin/QuestionGenerator/`

Build as a multi-step wizard, each step its own component:

1. **`JDInput.tsx`** — textarea for paste, plus a file upload (`.txt`/`.pdf`/`.docx`) that extracts text client-side or via a small server route before parsing. Show a "Parse JD" button.
2. **`ParsedSummary.tsx`** — shows extracted role/seniority/skills as editable chips (admin can remove a misidentified skill or add one the LLM missed) before generation. This editability matters — it's the main guardrail against bad extractions silently propagating into the question set.
3. **`MixConfigurator.tsx`** — sliders or number inputs for MCQ/coding/aptitude counts, a difficulty selector, and a language multi-select (shown only if coding count > 0).
4. **`GeneratedSetReview.tsx`** — the main review surface:
   - List of generated questions grouped by kind, each with inline edit (textarea for prompt, inputs for options/answer, code editor for starter code — reuse any existing code-input component from the test-attempt flow if one exists).
   - Per-question "Regenerate" button calling `regenerateQuestion`.
   - Per-question delete + an "Add question manually" affordance.
   - Difficulty/skillTag badges, color-coded consistent with existing badge patterns elsewhere in the admin dashboard.
5. **`SaveAsTestModal.tsx`** — final step: name the test, set duration/passing score (reuse existing Test-creation fields), call `approveQuestionSet`.

State: a local `useReducer` inside a `QuestionGeneratorWizard.tsx` parent is enough — don't add a new global Context for this, it's a contained flow.

All components: `"use client"`, `FC` typed, full dark mode support, loading states on every LLM-backed action (these calls take 3–10s — show a skeleton or spinner, not a blank screen).

---

## 8. Validation & Edge Cases to Handle Explicitly

- Empty or garbage JD input → reject before calling the LLM (min length check, e.g., 50 words).
- LLM returns malformed JSON → one retry with a stricter instruction, then a clear error toast, never a silent empty state.
- JD requests skills with no realistic coding-question equivalent (e.g., "Figma") → those should land as MCQ/aptitude-adjacent questions, not forced into the coding bucket.
- Admin edits a question, then hits "Regenerate" on a *different* question — edited questions must not be overwritten; only regenerate the targeted index.
- Duplicate or near-duplicate questions across multiple sets generated from similar JDs — out of scope for v1, but leave a `skillTag` + `prompt` index in place so a future similarity check is easy to add.
- Rate limiting: an admin spamming "Regenerate" should be throttled (basic per-user cooldown) to control LLM cost.

---

## 9. Implementation Order (suggested)

1. Types + Mongoose models (Section 1–2)
2. LLM client wrapper + prompts file (Section 4)
3. Controller stage 1 (parse-jd) + its route + Apicall — test end-to-end with a real JD before building stage 2
4. Controller stage 2 (generate) + route + Apicall
5. `JDInput` + `ParsedSummary` components, wired to stage 1
6. `MixConfigurator` + `GeneratedSetReview`, wired to stage 2
7. Regenerate-single-question route + UI action
8. `convertToTest` controller + `SaveAsTestModal`
9. Update `agents.md` per its own stated rule — add this feature's conventions (new Model, new route group, new component folder) to the doc before considering the feature done.

---

## 10. Definition of Done

- [ ] Pasting a real JD produces a parsed role/seniority/skills summary the admin can edit
- [ ] Generated set respects requested MCQ/coding/aptitude counts (or clearly reports shortfall)
- [ ] Every question is editable and individually regeneratable before save
- [ ] Approved set creates a real, attemptable Test using existing test-attempt flow — no separate code path
- [ ] All new files follow `agents.md` naming/typing/import conventions exactly
- [ ] `agents.md` updated with the new Model, routes, and component folder