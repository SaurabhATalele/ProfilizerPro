# Implementation Plan: JD Question Generator

## Overview

This plan implements the JD Question Generator (available to all authenticated users) as a thin wizard over a small set of API routes, following the existing ProfilizePro layering: route handlers (`app/api/v1/jd-generator/*`) → controllers (`Utils/api/Controllers/*`) → models (`Utils/api/Models/*`) + a shared `LLMClient` (`Utils/api/llm/*`), with client wrappers in `Utils/Apicalls/`, shared types in `Utils/types/`, and Zod schemas in `Utils/validation/`.

It reuses what already exists rather than building parallel machinery: `getAuthUser()` from `@/Utils/api/auth`, `connectdb()` from `@/Utils/api/db/connectDB`, the markdown-fence-strip + Zod-validate + bounded-retry convention from `GenerateTestController`, and the existing `Assignment` + `Question` documents as the published "Test". The `Question` schema gains only additive optional fields (`kind`, `skillTag`, `testCases`) so the test-attempt flow is untouched.

The design defines 16 correctness properties; each is covered by its own property-based test sub-task using **fast-check** with the LLM mocked, ≥100 iterations. Property test sub-tasks and other tests are marked optional with `*`.

## Tasks

- [x] 1. Foundations: types, schemas, models, test harness
  - [x] 1.1 Define shared types and Zod schemas
    - Add `Utils/types/JDGenerator.ts`: `ParsedSignal`, `GeneratedQuestion`, `Mix`, `GenerationInput`, `ApproveMeta`, controller result unions, error literals.
    - Add `Utils/validation/jdGeneratorSchemas.ts`: `ParsedSignalSchema` (seniority enum `intern|junior|mid|senior|lead`), `GeneratedSetSchema` (difficulty enum `easy|medium|hard|mixed`; coding question requires ≥3 test cases with ≥1 hidden), and the `PATCH /set/[id]` discriminated-union body schema.
    - _Requirements: 3.2, 5.2, 5.7_

  - [x] 1.2 Add staging models and additive Question fields
    - Add `Utils/api/Models/JobDescription.ts` and `Utils/api/Models/GeneratedQuestionSet.ts` per the Data Models section, following the existing Mongoose model/`models.X || model(...)` pattern.
    - Add optional `kind`, `skillTag`, `testCases` fields to the existing `Utils/api/Models/Question.ts` schema (optional so strict mode keeps them and existing consumers are unaffected).
    - _Requirements: 6.1, 6.2, 6.4, 9.3_

  - [x] 1.3 Set up the test harness
    - Add Vitest + fast-check as devDependencies and a `test` script; add minimal `vitest.config.ts` resolving the `@/` alias. No other config or scaffolding.
    - _Requirements: (enables property/unit tests below)_

- [x] 2. LLM client wrapper
  - [x] 2.1 Implement `Utils/api/llm/LLMClient.ts`
    - Single typed wrapper around the Anthropic Messages API exposing `callLLM({ system, user, timeoutMs })` returning `{ text, model }`.
    - Enforce `LLM_REQUEST_TIMEOUT_MS`; throw typed `LLMTimeoutError` on expiry instead of blocking. Reuse the markdown-fence-strip + JSON-parse convention from `GenerateTestController`.
    - _Requirements: 10.3_

- [ ] 3. Stage 1: JD parsing (`Utils/api/Controllers/JDParserController.ts`)
  - [ ] 3.1 Implement `parseJD`
    - Pure helpers (exported for tests): word-count length gate against `Minimum_JD_Length` (50), source typing (`paste` vs `upload`), unsupported-upload handling (reject if sole input; ignore if valid paste present), and `ParsedSignalSchema` validation.
    - Orchestration: extract text, enforce length gate (no LLM call below 50 words), `callLLM` once, validate; on invalid JSON retry once with a stricter JSON-only instruction then fail `parse_failed`; return `not_a_job_description` when the parse indicates non-JD. Persist `Job_Description` (with deterministic `jdHash`) and return its id + parsed signal.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.2 Property test: JD minimum-length gate
    - **Property 1: JD minimum-length gate**
    - **Validates: Requirements 2.5**

  - [ ] 3.3 Property test: input source typing
    - **Property 2: Input source typing**
    - **Validates: Requirements 2.1, 2.2**

  - [ ] 3.4 Property test: unsupported-upload handling depends on paste presence
    - **Property 3: Unsupported-upload handling depends on paste presence**
    - **Validates: Requirements 2.3, 2.4**

  - [ ] 3.5 Property test: parser output validation and seniority enum
    - **Property 4: Parser output validation and seniority enum**
    - **Validates: Requirements 3.2**

  - [ ] 3.6 Unit tests: parser retry + not-a-JD
    - Mocked LLM: malformed→retry→success; malformed twice→`parse_failed` (400); non-JD parse→`not_a_job_description` and generation not reached.
    - _Requirements: 3.3, 3.4, 3.5_

- [ ] 4. Stage 2: generation + single-question regeneration (`Utils/api/Controllers/QuestionGeneratorController.ts`)
  - [ ] 4.1 Implement `generateQuestionSet` and `regenerateQuestion`
    - Pure helpers (exported for tests): generation-payload composition (parsed skills − removed + added, plus edited role/seniority), target-difficulty enum check, `GeneratedSetSchema` validation, `skillTag ∈ mustHave ∪ niceToHave` enforcement, coding test-case invariant, mix shortfall accounting, and deterministic `jdHash`.
    - `generateQuestionSet`: `callLLM` once, validate (retry once on failure, then `generation_failed` with no partial persist), persist `Generated_Question_Set` with `generatedFrom { jdHash, model, promptVersion }` and `createdBy`; return set + shortfall.
    - `regenerateQuestion`: cooldown check against `lastRegenerationAt` (reject `rate_limited` without calling the LLM if within `Regenerate_Cooldown`); replace only the question at the given index, preserving all others including edited ones.
    - Record `promptVersion` as a versioned constant.
    - _Requirements: 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.9, 6.2, 6.3, 6.4, 8.1, 8.2, 8.3_

  - [ ] 4.2 Property test: generation payload composition
    - **Property 5: Generation payload composition**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**

  - [ ] 4.3 Property test: target difficulty enum
    - **Property 6: Target difficulty enum**
    - **Validates: Requirements 5.2**

  - [ ] 4.4 Property test: generation output validation with no partial persistence
    - **Property 7: Generation output validation with no partial persistence**
    - **Validates: Requirements 5.3, 5.5**

  - [ ] 4.5 Property test: skillTag membership
    - **Property 8: skillTag membership**
    - **Validates: Requirements 5.6**

  - [ ] 4.6 Property test: coding question test-case invariant
    - **Property 9: Coding question test-case invariant**
    - **Validates: Requirements 5.7**

  - [ ] 4.7 Property test: mix shortfall accounting
    - **Property 10: Mix shortfall accounting**
    - **Validates: Requirements 5.9**

  - [ ] 4.8 Property test: provenance, authorship, and jdHash determinism
    - **Property 11: Provenance, authorship, and jdHash determinism**
    - **Validates: Requirements 6.2, 6.4**

  - [ ] 4.9 Property test: single-question regeneration isolation
    - **Property 13: Single-question regeneration isolation**
    - **Validates: Requirements 8.1, 8.2**

  - [ ] 4.10 Property test: regenerate cooldown
    - **Property 14: Regenerate cooldown**
    - **Validates: Requirements 8.3**

  - [ ] 4.11 Unit tests: generation retry + no-partial-persist
    - Mocked LLM: invalid→retry→success; invalid twice→`generation_failed` (422) with no `Generated_Question_Set` persisted.
    - _Requirements: 5.4, 5.5_

- [ ] 5. Review edits and approval (`Utils/api/Controllers/JDGeneratorController.ts`)
  - [ ] 5.1 Implement `editQuestion`/`deleteQuestion`/`addQuestion` and `approveAsTest`
    - Set mutations: edit at index replaces only that question's content and sets `edited = true`; delete yields length n−1; add yields length n+1 with the new question (`manuallyAdded = true`).
    - `approveAsTest`: pure mapper `GeneratedQuestion → Question` (text/options/answer/kind preserved, `level` from difficulty 1/2/3); validate `passingScore ∈ [0,100]` (else `invalid_score`, create nothing); create one `Assignment` (`name=title`, `difficulty`, `owner=userId`, `isCustom=true`) + one `Question` per approved question; record `testId` on the set; idempotent guard against an existing `testId`.
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 5.2 Property test: question-set editing operations
    - **Property 12: Question-set editing operations**
    - **Validates: Requirements 7.2, 7.3, 7.4**

  - [ ] 5.3 Property test: passing-score range validation
    - **Property 15: Passing-score range validation**
    - **Validates: Requirements 9.2**

  - [ ] 5.4 Property test: question mapping coverage
    - **Property 16: Question mapping coverage**
    - **Validates: Requirements 9.3**

  - [ ] 5.5 Unit tests: no-publish-before-approval + idempotent approval
    - Run parse/generate/edit/regenerate and assert no `Assignment`/`Question` created; second approve does not create a duplicate Test.
    - _Requirements: 7.5, 9.4_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. API routes (`app/api/v1/jd-generator/*`)
  - [ ] 7.1 Wire the five route handlers
    - `parse/route.ts` (POST, paste JSON + multipart upload), `generate/route.ts` (POST), `set/[id]/route.ts` (PATCH), `regenerate/route.ts` (POST), `approve/route.ts` (POST).
    - Each: `getAuthUser()` from `@/Utils/api/auth` first (returns `null` → 401 for no/invalid session, return before any LLM call or DB write; no admin-role check, no 403 path) → `connectdb()` → parse body → delegate to controller → map typed result to status (`400/422/429/504/500`). The caller identity (`user.email` / `user.userId`) always comes from the JWT, never the body.
    - _Requirements: 1.1, 1.3, 2.x, 3.x, 5.x, 6.x, 7.2, 7.3, 7.4, 8.x, 9.x, 10.3_

  - [ ] 7.2 Tests: auth gating + LLM timeout mapping
    - No/invalid session→401; valid authenticated session→proceeds (no admin-role check); assert mocked LLM never called when unauthenticated. `LLMTimeoutError`→504.
    - _Requirements: 1.1, 1.2, 1.3, 10.3_

- [ ] 8. Client wrappers and Review UI
  - [ ] 8.1 Implement `Utils/Apicalls/JDGenerator.ts`
    - Typed `fetch`/`axios` wrappers: `parseJD`, `generateQuestions`, `editQuestion`, `deleteQuestion`, `addQuestion`, `regenerateQuestion`, `approveAsTest`, following the existing `Utils/Apicalls` convention.
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ] 8.2 Build the Review wizard UI and authenticated page
    - `Components/JDGenerator/`: `ReviewWizard`, `JDInputStep` (paste + upload, client length hint), `ParseConfirmStep` (editable role/seniority/skill chips), `MixConfigStep` (counts, difficulty, languages), `QuestionReviewStep` + `QuestionCard` (grouped by kind with difficulty/skillTag badges; edit/delete/add/regenerate with per-action loading + inline errors), `SaveTestStep` (title/duration/passing score → approve).
    - Top-level authenticated page `app/jd-question-generator/page.tsx` (alongside `app/dashboard`, `app/profile`, `app/explore`). Gate client-side via `localStorage` `token` + `getUser()`, redirecting to `/login` when unauthenticated, with no `isAdmin` check (any authenticated user reaches the wizard). Use `"use client"`, `FC` typing, `@/` alias, `useTheme()`, and `Toast`.
    - _Requirements: 4.1, 7.1, 10.1, 10.2_

  - [ ] 8.3 UI component tests
    - Editable parse form, grouped question rendering, per-action loading indicators, descriptive error messages.
    - _Requirements: 4.1, 7.1, 10.1, 10.2_

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional (tests) and can be skipped for a faster MVP; the 16 property tests cover the design's correctness properties and are the recommended minimum to keep.
- Each property test mocks `LLMClient`, runs ≥100 iterations, and is tagged `// Feature: jd-question-generator, Property {n}: ...`.
- Pure logic (length gate, source typing, payload composition, schema validation, shortfall, set mutations, mapper, jdHash) is extracted as exported functions so property tests run without the DB or LLM.
- Property 5.8 (skill→non-coding fallback) is LLM-judgement and is handled via the generator prompt + permissive schema, verified by spot-check rather than a property test.
- Each task references specific requirement clauses for traceability; the "Test" is the existing `Assignment` + `Question` documents.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3", "2.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["3.1", "4.1", "5.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9", "4.10", "4.11", "5.2", "5.3", "5.4", "5.5", "7.1", "8.1"] },
    { "id": 4, "tasks": ["7.2", "8.2"] },
    { "id": 5, "tasks": ["8.3"] }
  ]
}
```
