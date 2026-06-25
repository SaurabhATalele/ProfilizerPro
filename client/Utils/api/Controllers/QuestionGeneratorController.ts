import connectdb from "@/Utils/api/db/connectDB";
import GeneratedQuestionSetModel from "@/Utils/api/Models/GeneratedQuestionSet";
import JobDescriptionModel from "@/Utils/api/Models/JobDescription";
import { callLLM, parseJsonResponse } from "@/Utils/api/llm/LLMClient";
// One shared jdHash implementation so JD_Parser (Stage 1) and the
// Question_Generator (Stage 2) hash identically (design Property 11). Task 3.1
// is expected to re-export / reuse this same helper from JDParserController so
// there is a single implementation across both controllers.
import { jdHash } from "@/Utils/api/jdHash";
import {
  GeneratedSetSchema,
  GeneratedQuestionSchema,
  TARGET_DIFFICULTY_VALUES,
  type GeneratedSetInput,
  type GeneratedQuestionInput,
} from "@/Utils/validation/jdGeneratorSchemas";
import type {
  GenerationInput,
  GeneratedQuestion,
  GenerateResult,
  Mix,
  ParsedSignal,
  QuestionKind,
  RegenerateResult,
  Seniority,
  TargetDifficulty,
} from "@/Utils/types/JDGenerator";

// ---------------------------------------------------------------------------
// Versioned constants (recorded as provenance / used for rate limiting).
// ---------------------------------------------------------------------------

/**
 * Prompt version recorded on every generated set's provenance
 * (`generatedFrom.promptVersion`). Bump this whenever the generation prompt
 * changes so older sets remain auditable against the prompt that produced them
 * (Requirement 6.3).
 */
export const PROMPT_VERSION = "v1" as const;

/**
 * Minimum interval a user must wait between single-question regeneration
 * requests on the same set (the `Regenerate_Cooldown`). Requests within this
 * window are rejected with `rate_limited` and never reach the LLM
 * (Requirement 8.3).
 */
export const REGENERATE_COOLDOWN_MS = 30_000;

// The kinds we account for in a Mix, in a stable order.
const MIX_KINDS: readonly QuestionKind[] = ["mcq", "coding", "aptitude"];

// ===========================================================================
// Pure helpers (exported for property/unit tests — no DB, no LLM).
// ===========================================================================

/** Edits a user applies to a parsed signal before generation. */
export interface GenerationPayloadEdits {
  /** Skills the user removed from the parsed set. */
  removedSkills?: string[];
  /** Skills the user added to the parsed set. */
  addedSkills?: string[];
  /** Edited role, if the user changed it. */
  role?: string;
  /** Edited seniority, if the user changed it. */
  seniority?: Seniority;
}

/**
 * Compose the signal sent to the Question_Generator from the parsed signal and
 * the user's edits: the resulting `skills` equals the parsed skills minus the
 * removed skills plus the added skills (de-duplicated, order preserved), and
 * the payload carries the edited `role` / `seniority` when provided.
 *
 * Pure. Validates Property 5 (Requirements 4.2, 4.3, 4.4, 4.5).
 */
export const composeGenerationPayload = (
  parsed: ParsedSignal,
  edits: GenerationPayloadEdits = {},
): ParsedSignal => {
  const removed = new Set(edits.removedSkills ?? []);
  const kept = parsed.skills.filter((skill) => !removed.has(skill));

  const seen = new Set(kept);
  const skills = [...kept];
  for (const added of edits.addedSkills ?? []) {
    if (!seen.has(added)) {
      seen.add(added);
      skills.push(added);
    }
  }

  return {
    role: edits.role ?? parsed.role,
    seniority: edits.seniority ?? parsed.seniority,
    skills,
    mustHave: parsed.mustHave,
    niceToHave: parsed.niceToHave,
  };
};

/**
 * Target-difficulty enum guard. Accepts a value iff it is one of
 * `easy | medium | hard | mixed`.
 *
 * Pure. Validates Property 6 (Requirement 5.2).
 */
export const isValidTargetDifficulty = (
  value: unknown,
): value is TargetDifficulty =>
  typeof value === "string" &&
  (TARGET_DIFFICULTY_VALUES as readonly string[]).includes(value);

/**
 * Validate a candidate Question_Generator output against `GeneratedSetSchema`.
 * Returns the parsed set on success, or the validation error message on
 * failure — never throws. The schema also enforces the coding test-case
 * invariant (>=3 cases, >=1 hidden, Requirement 5.7).
 *
 * Pure. Validates Property 7 (Requirements 5.3, 5.5) and Property 9 (5.7).
 */
export const validateGeneratedSet = (
  candidate: unknown,
):
  | { ok: true; value: GeneratedSetInput }
  | { ok: false; error: string } => {
  const result = GeneratedSetSchema.safeParse(candidate);
  if (result.success) {
    return { ok: true, value: result.data };
  }
  return { ok: false, error: result.error.message };
};

/**
 * The set of skills a question's `skillTag` may legitimately reference:
 * `mustHave ∪ niceToHave`.
 */
export const allowedSkillTags = (signal: {
  mustHave: string[];
  niceToHave: string[];
}): Set<string> => new Set([...signal.mustHave, ...signal.niceToHave]);

/**
 * Drop any MCQ or coding question whose `skillTag` is not drawn from
 * `mustHave ∪ niceToHave`. Aptitude questions are unaffected (they carry no
 * required skillTag). Order is preserved.
 *
 * Pure. Validates Property 8 (Requirement 5.6).
 */
export const enforceSkillTagMembership = <
  T extends { kind: QuestionKind; skillTag?: string },
>(
  questions: T[],
  allowed: Set<string>,
): T[] =>
  questions.filter((q) => {
    if (q.kind === "mcq" || q.kind === "coding") {
      return q.skillTag !== undefined && allowed.has(q.skillTag);
    }
    return true;
  });

/** Count questions per kind. Pure. */
export const countByKind = (
  questions: { kind: QuestionKind }[],
): Mix => {
  const mix: Mix = { mcq: 0, coding: 0, aptitude: 0 };
  for (const q of questions) {
    mix[q.kind] += 1;
  }
  return mix;
};

/**
 * Trim a question list so the produced count for each kind never exceeds the
 * requested count. Excess questions of a kind are dropped (order preserved).
 *
 * Pure. Supports Property 10 (Requirement 5.9).
 */
export const capToRequestedMix = <T extends { kind: QuestionKind }>(
  questions: T[],
  requested: Mix,
): T[] => {
  const used: Mix = { mcq: 0, coding: 0, aptitude: 0 };
  return questions.filter((q) => {
    if (used[q.kind] < requested[q.kind]) {
      used[q.kind] += 1;
      return true;
    }
    return false;
  });
};

/**
 * Per-kind shortfall: `requested - produced`, clamped at 0 so it is never
 * negative (the cap guarantees produced <= requested).
 *
 * Pure. Validates Property 10 (Requirement 5.9).
 */
export const computeShortfall = (requested: Mix, produced: Mix): Mix => {
  const shortfall: Mix = { mcq: 0, coding: 0, aptitude: 0 };
  for (const kind of MIX_KINDS) {
    shortfall[kind] = Math.max(0, requested[kind] - produced[kind]);
  }
  return shortfall;
};

/**
 * Reconcile a produced question list against the requested Mix: cap excess per
 * kind, then report produced counts and the shortfall. Together these
 * guarantee `produced <= requested` and `shortfall = requested - produced`.
 *
 * Pure. Validates Property 10 (Requirement 5.9).
 */
export const reconcileMix = <T extends { kind: QuestionKind }>(
  questions: T[],
  requested: Mix,
): { questions: T[]; produced: Mix; shortfall: Mix } => {
  const capped = capToRequestedMix(questions, requested);
  const produced = countByKind(capped);
  const shortfall = computeShortfall(requested, produced);
  return { questions: capped, produced, shortfall };
};

// Re-export the shared deterministic JD hash so callers/tests can reach it
// through this controller without depending on the hashing internals.
export { jdHash };

// ===========================================================================
// Prompt construction
// ===========================================================================

const GENERATION_SYSTEM = [
  "You are an assessment question generator for a technical hiring platform.",
  "Given a confirmed hiring signal, produce a set of assessment questions as STRICT JSON.",
  "",
  "Output shape (return ONLY this JSON object, no markdown, no prose):",
  "{",
  '  "difficulty": "easy" | "medium" | "hard" | "mixed",',
  '  "questions": [',
  "    {",
  '      "kind": "mcq" | "coding" | "aptitude",',
  '      "text": string,',
  '      "options"?: string[],            // required for mcq',
  '      "answer"?: string,               // required for mcq/aptitude (must match an option for mcq)',
  '      "testCases"?: [ { "input": string, "expectedOutput": string, "hidden": boolean } ], // coding only',
  '      "skillTag"?: string,             // required for mcq/coding; MUST be one of the provided skills',
  '      "language"?: string,             // coding only',
  '      "difficulty": "easy" | "medium" | "hard"',
  "    }",
  "  ]",
  "}",
  "",
  "Rules:",
  "- Every mcq and coding question MUST set skillTag to one of the mustHave or niceToHave skills provided.",
  "- Every coding question MUST include at least 3 test cases, with at least one marked \"hidden\": true.",
  "- If a skill has no realistic coding equivalent, produce mcq or aptitude questions for it instead of coding.",
  "- Per-question difficulty is one of easy, medium, hard (never \"mixed\").",
  "- Generate at most the requested number of questions for each kind.",
].join("\n");

const STRICT_SUFFIX =
  "\n\nIMPORTANT: Your previous output was invalid. Return ONLY a single JSON object matching the shape exactly. No markdown fences, no commentary, no trailing text.";

const buildGenerationUser = (input: GenerationInput): string => {
  const { confirmedSignal, mix, difficulty, preferredLanguages } = input;
  const languages =
    preferredLanguages && preferredLanguages.length > 0
      ? preferredLanguages.join(", ")
      : "any";
  return [
    `Role: ${confirmedSignal.role}`,
    `Seniority: ${confirmedSignal.seniority}`,
    `Skills: ${confirmedSignal.skills.join(", ") || "(none)"}`,
    `Must-have skills: ${confirmedSignal.mustHave.join(", ") || "(none)"}`,
    `Nice-to-have skills: ${confirmedSignal.niceToHave.join(", ") || "(none)"}`,
    `Target difficulty: ${difficulty}`,
    `Preferred coding languages: ${languages}`,
    "Requested question mix:",
    `- mcq: ${mix.mcq}`,
    `- coding: ${mix.coding}`,
    `- aptitude: ${mix.aptitude}`,
  ].join("\n");
};

const buildRegenerationUser = (existing: GeneratedQuestion): string => {
  const constraints = [
    `Kind: ${existing.kind}`,
    `Difficulty: ${existing.difficulty}`,
    existing.skillTag ? `Skill tag: ${existing.skillTag}` : undefined,
    existing.language ? `Language: ${existing.language}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "Regenerate a SINGLE replacement question that fits the constraints below.",
    "It must be meaningfully different from the current question text.",
    "Return ONLY a single JSON question object (the element shape, not the set).",
    "",
    constraints,
    "",
    `Current question text (do not repeat): ${existing.text}`,
  ].join("\n");
};

// ===========================================================================
// Orchestration: generateQuestionSet
// ===========================================================================

/**
 * Call the LLM (with one stricter retry) and return a schema-valid set, or
 * `null` if validation ultimately fails. Used to guarantee "no partial
 * persist" (Requirement 5.5): callers only persist when this resolves
 * non-null.
 */
const generateValidatedSet = async (
  input: GenerationInput,
): Promise<{ value: GeneratedSetInput; model: string } | null> => {
  const user = buildGenerationUser(input);

  const attempt = async (
    system: string,
  ): Promise<{ value: GeneratedSetInput; model: string } | null> => {
    try {
      const { text, model } = await callLLM({ system, user });
      const parsed = parseJsonResponse<unknown>(text);
      const validated = validateGeneratedSet(parsed);
      if (validated.ok) {
        return { value: validated.value, model };
      }
    } catch {
      // malformed JSON / transient call failure -> fall through to retry policy
    }
    return null;
  };

  const first = await attempt(GENERATION_SYSTEM);
  if (first) return first;
  // Single stricter retry (Requirement 5.4), then give up (5.5).
  return attempt(GENERATION_SYSTEM + STRICT_SUFFIX);
};

/**
 * Stage 2: generate a question set from a confirmed signal, validate it, and
 * persist a `Generated_Question_Set` with provenance.
 *
 * - Calls the LLM once, validates against `GeneratedSetSchema`; on failure
 *   retries once with a stricter instruction, then fails with
 *   `generation_failed` and persists NOTHING (Requirements 5.4, 5.5).
 * - Enforces `skillTag ∈ mustHave ∪ niceToHave` (5.6) and caps produced counts
 *   to the requested Mix, reporting the shortfall (5.9).
 * - Records provenance `{ jdHash, model, promptVersion }` and `createdBy`
 *   (Requirements 6.2, 6.3, 6.4).
 */
export const generateQuestionSet = async (
  input: GenerationInput,
  userId: string,
): Promise<GenerateResult> => {
  await connectdb();

  // Need the raw JD text to compute the deterministic provenance hash.
  const jd = await JobDescriptionModel.findById(input.jobDescriptionId);
  if (!jd) {
    return { ok: false, error: "generation_failed" };
  }

  const generated = await generateValidatedSet(input);
  if (!generated) {
    // No partial persistence on terminal validation failure (Req 5.5).
    return { ok: false, error: "generation_failed" };
  }

  const allowed = allowedSkillTags(input.confirmedSignal);
  const conforming = enforceSkillTagMembership(generated.value.questions, allowed);
  const { questions, shortfall } = reconcileMix(conforming, input.mix);

  // Normalize to the persisted GeneratedQuestion shape (default review flags).
  const finalQuestions: GeneratedQuestion[] = questions.map((q) => ({
    ...q,
    edited: q.edited ?? false,
  }));

  const doc = new GeneratedQuestionSetModel({
    jobDescriptionId: input.jobDescriptionId,
    requestedMix: input.mix,
    difficulty: input.difficulty,
    preferredLanguages: input.preferredLanguages ?? [],
    questions: finalQuestions,
    shortfall,
    generatedFrom: {
      jdHash: jdHash(jd.rawText),
      model: generated.model,
      promptVersion: PROMPT_VERSION,
    },
    createdBy: userId,
  });

  const saved = await doc.save();
  return { ok: true, set: saved, shortfall };
};

// ===========================================================================
// Orchestration: regenerateQuestion
// ===========================================================================

/**
 * Generate a single replacement question for the given slot, validated against
 * `GeneratedQuestionSchema` with one stricter retry. The replacement reuses the
 * slot's `kind`, `skillTag`, `language`, and `difficulty` so it stays within
 * the same constraints (preserving skillTag membership). Returns `null` if
 * validation ultimately fails.
 */
const regenerateValidatedQuestion = async (
  existing: GeneratedQuestion,
): Promise<GeneratedQuestion | null> => {
  const system =
    "You regenerate a single assessment question. " +
    "Return ONLY a single JSON object matching the question element shape, no markdown, no prose.";
  const user = buildRegenerationUser(existing);

  const attempt = async (sys: string): Promise<GeneratedQuestion | null> => {
    try {
      const { text } = await callLLM({ system: sys, user });
      const parsed = parseJsonResponse<unknown>(text);
      const result = GeneratedQuestionSchema.safeParse(parsed);
      if (result.success) {
        const next: GeneratedQuestionInput = result.data;
        // Lock slot-defining fields so regeneration stays isolated & valid.
        return {
          ...next,
          kind: existing.kind,
          skillTag: existing.skillTag,
          language: existing.language ?? next.language,
          difficulty: existing.difficulty,
          edited: false,
          manuallyAdded: false,
        };
      }
    } catch {
      // fall through to stricter retry
    }
    return null;
  };

  const first = await attempt(system);
  if (first) return first;
  return attempt(system + STRICT_SUFFIX);
};

/**
 * Regenerate exactly one question of a set by index, leaving every other
 * question — including ones the user has edited — untouched.
 *
 * - Rejects `not_found` when the set does not exist.
 * - Rejects `rate_limited` WITHOUT calling the LLM when the previous
 *   regeneration was within `REGENERATE_COOLDOWN_MS` (Requirement 8.3).
 * - Rejects `bad_index` when the index is out of range.
 * - On success replaces only `questions[index]` and bumps `lastRegenerationAt`
 *   (Requirements 8.1, 8.2).
 */
export const regenerateQuestion = async (
  setId: string,
  index: number,
  userId: string,
): Promise<RegenerateResult> => {
  await connectdb();

  const set = await GeneratedQuestionSetModel.findById(setId);
  if (!set) {
    return { ok: false, error: "not_found" };
  }

  // Cooldown gate first: never spend an LLM call within the cooldown window.
  if (set.lastRegenerationAt) {
    const elapsed = Date.now() - new Date(set.lastRegenerationAt).getTime();
    if (elapsed < REGENERATE_COOLDOWN_MS) {
      return { ok: false, error: "rate_limited" };
    }
  }

  if (!Number.isInteger(index) || index < 0 || index >= set.questions.length) {
    return { ok: false, error: "bad_index" };
  }

  const existing = set.questions[index] as GeneratedQuestion;
  const replacement = await regenerateValidatedQuestion(existing);
  if (!replacement) {
    // RegenerateError does not model a generation failure; surface it as an
    // unexpected error so the route maps it to 500 rather than silently
    // leaving the slot unchanged.
    throw new Error("regeneration_failed");
  }

  // Replace ONLY the target slot; all other questions are left untouched.
  set.questions[index] = replacement;
  set.markModified("questions");
  set.lastRegenerationAt = new Date();
  set.updatedAt = new Date();
  // Authorship is owner-scoped; record who triggered the change is implicit via
  // createdBy on the set. `userId` is accepted for parity with the route layer.
  void userId;

  const saved = await set.save();
  return { ok: true, set: saved };
};
