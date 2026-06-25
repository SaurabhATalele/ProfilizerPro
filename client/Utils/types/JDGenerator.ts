// Shared TypeScript types for the JD Question Generator feature.
// See .kiro/specs/jd-question-generator/design.md ("Data Models") for the
// authoritative shapes these mirror.

// ---------------------------------------------------------------------------
// Enums / literal unions
// ---------------------------------------------------------------------------

/** Allowed seniority levels extracted by Stage 1 (JD_Parser). */
export type Seniority = "intern" | "junior" | "mid" | "senior" | "lead";

/** Requested target difficulty for a generated set (Stage 2). */
export type TargetDifficulty = "easy" | "medium" | "hard" | "mixed";

/** Per-question difficulty (no "mixed" at the individual-question level). */
export type QuestionDifficulty = "easy" | "medium" | "hard";

/** Kind of a single generated question. */
export type QuestionKind = "mcq" | "coding" | "aptitude";

/** Where the JD text originated. */
export type SourceType = "paste" | "upload";

// ---------------------------------------------------------------------------
// Core data shapes
// ---------------------------------------------------------------------------

/** Structured hiring signal extracted from a job description (Stage 1 output). */
export interface ParsedSignal {
  role: string;
  seniority: Seniority;
  skills: string[];
  mustHave: string[];
  niceToHave: string[];
}

/** A single coding-question test case. */
export interface TestCase {
  input: string;
  expectedOutput: string;
  hidden: boolean;
}

/** A single generated question (embedded subdocument of a question set). */
export interface GeneratedQuestion {
  kind: QuestionKind;
  text: string;
  /** Present for mcq questions. */
  options?: string[];
  /** Present for mcq / aptitude questions. */
  answer?: string;
  /** Present for coding questions (>=3 cases, >=1 hidden). */
  testCases?: TestCase[];
  /** Drawn from mustHave ∪ niceToHave for mcq / coding questions. */
  skillTag?: string;
  /** Present for coding questions. */
  language?: string;
  difficulty: QuestionDifficulty;
  /** Set true when an Admin edits the question's content. */
  edited: boolean;
  /** Set true when an Admin adds the question manually. */
  manuallyAdded?: boolean;
}

/** Requested / produced counts per question kind. */
export interface Mix {
  mcq: number;
  coding: number;
  aptitude: number;
}

/** Provenance recorded on each generated set so content stays auditable. */
export interface Provenance {
  jdHash: string;
  model: string;
  promptVersion: string;
}

/** Persisted staging document holding the generated questions and provenance. */
export interface GeneratedQuestionSet {
  _id?: string;
  jobDescriptionId: string;
  requestedMix: Mix;
  difficulty: TargetDifficulty;
  preferredLanguages: string[];
  questions: GeneratedQuestion[];
  shortfall: Mix;
  generatedFrom: Provenance;
  createdBy: string;
  /** Set on approval (references the created Assignment). */
  testId?: string;
  /** Cooldown anchor for single-question regeneration. */
  lastRegenerationAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ---------------------------------------------------------------------------
// Controller input shapes
// ---------------------------------------------------------------------------

/** Input to Stage 2 generation: confirmed signal + mix + difficulty + languages. */
export interface GenerationInput {
  jobDescriptionId: string;
  confirmedSignal: ParsedSignal;
  mix: Mix;
  difficulty: TargetDifficulty;
  preferredLanguages?: string[];
}

/** Metadata supplied by an Admin when approving a set as a Test. */
export interface ApproveMeta {
  title: string;
  duration: number;
  passingScore: number;
}

// ---------------------------------------------------------------------------
// Error literals
// ---------------------------------------------------------------------------

export type ParseError = "too_short" | "parse_failed" | "not_a_job_description";
export type GenerateError = "generation_failed";
export type RegenerateError = "rate_limited" | "not_found" | "bad_index";
export type ApproveError = "invalid_score" | "not_found";

/** Union of every typed error literal surfaced by the JD_Generator controllers. */
export type JDGeneratorError =
  | ParseError
  | GenerateError
  | RegenerateError
  | ApproveError;

// ---------------------------------------------------------------------------
// Controller result unions (discriminated on `ok`)
// ---------------------------------------------------------------------------

export type ParseResult =
  | { ok: true; jobDescriptionId: string; parsed: ParsedSignal }
  | { ok: false; error: ParseError };

export type GenerateResult =
  | { ok: true; set: GeneratedQuestionSet; shortfall: Mix }
  | { ok: false; error: GenerateError };

export type RegenerateResult =
  | { ok: true; set: GeneratedQuestionSet }
  | { ok: false; error: RegenerateError };

export type ApproveResult =
  | { ok: true; testId: string }
  | { ok: false; error: ApproveError };

// ---------------------------------------------------------------------------
// PATCH /set/[id] request body (discriminated union on `op`)
// ---------------------------------------------------------------------------

export type SetPatchBody =
  | { op: "edit"; index: number; question: GeneratedQuestion }
  | { op: "delete"; index: number }
  | { op: "add"; question: GeneratedQuestion };
