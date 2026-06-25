import { createHash } from "crypto";
import connectdb from "@/Utils/api/db/connectDB";
import JobDescription from "@/Utils/api/Models/JobDescription";
import { callLLM, parseJsonResponse } from "@/Utils/api/llm/LLMClient";
import { ParsedSignalSchema } from "@/Utils/validation/jdGeneratorSchemas";
import type {
  ParsedSignal,
  ParseResult,
  SourceType,
} from "@/Utils/types/JDGenerator";

// JDParserController — Stage 1 of the JD Question Generator.
//
// Responsibilities:
//   - PURE helpers (exported for property/unit tests; no DB or LLM):
//       * word-count length gate against `Minimum_JD_Length` (50 words)
//       * input source typing (`paste` vs `upload`) and unsupported-upload
//         handling (reject when it is the sole input; ignore when a valid
//         paste is present)
//       * `ParsedSignalSchema` validation
//       * deterministic `jdHash` (sha256 of normalized rawText) — exported so
//         the generator controller hashes identically (Property 11).
//   - Orchestration `parseJD(...)`: enforce the length gate (no LLM call below
//     50 words), call the LLM once, validate, retry once on invalid JSON, then
//     fail `parse_failed`; surface `not_a_job_description`; persist a
//     `Job_Description` and return its id + parsed signal.
//
// See .kiro/specs/jd-question-generator/design.md ("Components and Interfaces",
// "Data Models", "Error Handling").

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Lower bound on JD input length, in words, below which input is rejected. */
export const MINIMUM_JD_LENGTH = 50;

/** File extensions accepted on the upload path (Requirement 2.2). */
export const SUPPORTED_UPLOAD_EXTENSIONS = [".txt", ".pdf", ".docx"] as const;

// ---------------------------------------------------------------------------
// Pure helpers — length gate (Property 1, Requirement 2.5)
// ---------------------------------------------------------------------------

/**
 * Count whitespace-delimited words in `text`. Leading/trailing whitespace and
 * runs of whitespace collapse so the count reflects actual words.
 */
export const countWords = (text: string): number => {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
};

/**
 * True when `text` has at least `Minimum_JD_Length` words. The orchestrator
 * uses this to gate the LLM call: input below the bound never reaches the LLM.
 */
export const meetsMinimumLength = (text: string): boolean =>
  countWords(text) >= MINIMUM_JD_LENGTH;

// ---------------------------------------------------------------------------
// Pure helpers — input source typing + unsupported-upload handling
// (Properties 2 & 3, Requirements 2.1, 2.2, 2.3, 2.4)
// ---------------------------------------------------------------------------

/** A single uploaded file reduced to the fields the parser needs. */
export interface UploadCandidate {
  /** Original file name; used only to classify the extension. */
  filename: string;
  /** Already-extracted text content of the file. */
  text: string;
}

/** Raw input to the parser before a single source has been resolved. */
export interface JDInputCandidate {
  /** Pasted text, if the User provided any. */
  pasteText?: string;
  /** Uploaded file, if the User provided one. */
  upload?: UploadCandidate;
}

/** Outcome of resolving the raw input down to one source of JD text. */
export type ResolvedJDInput =
  | { ok: true; rawText: string; sourceType: SourceType }
  | { ok: false; error: "unsupported_file" | "no_input" };

/**
 * True when `filename` ends with a supported upload extension
 * (`.txt`/`.pdf`/`.docx`), matched case-insensitively (Requirement 2.2).
 */
export const isSupportedUploadType = (filename: string): boolean => {
  const lower = filename.toLowerCase();
  return SUPPORTED_UPLOAD_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

/** A paste counts as present only when it has non-whitespace content. */
const hasValidPaste = (pasteText?: string): pasteText is string =>
  typeof pasteText === "string" && pasteText.trim().length > 0;

/**
 * Resolve the raw submission to a single JD text + source type.
 *
 * Precedence (Requirements 2.1–2.4):
 *   1. A valid (non-empty) paste is always processed as `paste`; any
 *      accompanying upload — supported or not — is ignored.
 *   2. Otherwise a supported upload is processed as `upload`.
 *   3. An unsupported upload that is the sole input is rejected
 *      (`unsupported_file`).
 *   4. With neither a valid paste nor any upload, there is `no_input`.
 */
export const resolveJDInput = (input: JDInputCandidate): ResolvedJDInput => {
  if (hasValidPaste(input.pasteText)) {
    // Pasted text wins and an unsupported upload is silently ignored (2.4).
    return { ok: true, rawText: input.pasteText, sourceType: "paste" };
  }

  if (input.upload) {
    if (isSupportedUploadType(input.upload.filename)) {
      return { ok: true, rawText: input.upload.text, sourceType: "upload" };
    }
    // Unsupported upload with no paste to fall back on (2.3).
    return { ok: false, error: "unsupported_file" };
  }

  return { ok: false, error: "no_input" };
};

// ---------------------------------------------------------------------------
// Pure helpers — parsed-signal validation (Property 4, Requirement 3.2)
// ---------------------------------------------------------------------------

/**
 * Validate a candidate parser output against `ParsedSignalSchema`. Returns the
 * typed `ParsedSignal` when valid (with `seniority` in the allowed enum) and
 * `null` otherwise, so a failed validation is never returned as a parse.
 */
export const validateParsedSignal = (candidate: unknown): ParsedSignal | null => {
  const result = ParsedSignalSchema.safeParse(candidate);
  return result.success ? result.data : null;
};

// ---------------------------------------------------------------------------
// Pure helpers — deterministic jdHash (Property 11, Requirement 6.2)
// ---------------------------------------------------------------------------

/**
 * Normalize JD text so hashing is stable across incidental formatting: trim,
 * collapse internal whitespace to single spaces, and lowercase. Shared with the
 * generator controller so the same JD text always yields the same `jdHash`.
 */
export const normalizeJDText = (rawText: string): string =>
  rawText.trim().replace(/\s+/g, " ").toLowerCase();

/**
 * Deterministic sha256 of the normalized raw JD text. The same JD text always
 * produces the same hash; recorded on the `Job_Description` and reused as
 * provenance on the `Generated_Question_Set`.
 */
export const jdHash = (rawText: string): string =>
  createHash("sha256").update(normalizeJDText(rawText)).digest("hex");

// ---------------------------------------------------------------------------
// LLM prompts
// ---------------------------------------------------------------------------

const PARSER_SYSTEM_PROMPT = `You are JD_Parser, a component that extracts structured hiring signal from a job description.

Return ONLY a JSON object with exactly these fields:
{
  "role": string,
  "seniority": "intern" | "junior" | "mid" | "senior" | "lead",
  "skills": string[],
  "mustHave": string[],
  "niceToHave": string[]
}

Rules:
- "seniority" MUST be exactly one of: intern, junior, mid, senior, lead.
- "skills" lists all relevant skills; "mustHave" and "niceToHave" partition the required vs. preferred skills.
- If the provided text is NOT a job description, return exactly {"notAJobDescription": true} instead.
- Return nothing apart from the JSON object (no prose, no markdown).`;

const PARSER_SYSTEM_PROMPT_STRICT = `${PARSER_SYSTEM_PROMPT}

STRICT: Your previous response was not valid JSON. Respond with a single, raw, valid JSON object only. Do not include markdown code fences, comments, or any text before or after the JSON.`;

// ---------------------------------------------------------------------------
// Parser response interpretation
// ---------------------------------------------------------------------------

type ParserOutcome =
  | { kind: "success"; signal: ParsedSignal }
  | { kind: "not_a_jd" }
  | { kind: "invalid" };

/** True when the candidate object carries the not-a-JD marker (Req 3.5). */
const isNotAJobDescription = (candidate: unknown): boolean =>
  typeof candidate === "object" &&
  candidate !== null &&
  (candidate as { notAJobDescription?: unknown }).notAJobDescription === true;

/**
 * Interpret a single (fence-stripped) LLM response: parse JSON, detect the
 * not-a-JD marker, then validate against the schema.
 */
const interpretParserResponse = (text: string): ParserOutcome => {
  let candidate: unknown;
  try {
    candidate = parseJsonResponse<unknown>(text);
  } catch {
    return { kind: "invalid" };
  }

  if (isNotAJobDescription(candidate)) {
    return { kind: "not_a_jd" };
  }

  const signal = validateParsedSignal(candidate);
  return signal ? { kind: "success", signal } : { kind: "invalid" };
};

/**
 * Call the LLM once and, on invalid JSON, retry exactly once with a stricter
 * JSON-only instruction (Requirements 3.1, 3.3, 3.4). A not-a-JD result is
 * terminal and is never retried.
 */
const runParserWithRetry = async (rawText: string): Promise<ParserOutcome> => {
  const first = await callLLM({
    system: PARSER_SYSTEM_PROMPT,
    user: rawText,
  });
  const firstOutcome = interpretParserResponse(first.text);
  if (firstOutcome.kind !== "invalid") {
    return firstOutcome;
  }

  // Single stricter retry, then fail.
  const retry = await callLLM({
    system: PARSER_SYSTEM_PROMPT_STRICT,
    user: rawText,
  });
  return interpretParserResponse(retry.text);
};

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

/**
 * Stage 1 orchestration. Enforces the minimum-length gate (no LLM call below
 * `Minimum_JD_Length`), runs the parser with a single stricter retry on invalid
 * JSON, surfaces `not_a_job_description`, then persists a `Job_Description`
 * (deterministic `jdHash`, `createdBy = userId`) and returns its id + parsed
 * signal.
 *
 * `LLMTimeoutError` from the LLM client is intentionally left to propagate so
 * the route layer can map it to a 504 (Requirement 10.3).
 */
export const parseJD = async (
  rawText: string,
  sourceType: SourceType,
  userId: string,
): Promise<ParseResult> => {
  // Length gate first: input below the bound never reaches the LLM (Req 2.5).
  if (!meetsMinimumLength(rawText)) {
    return { ok: false, error: "too_short" };
  }

  const outcome = await runParserWithRetry(rawText);

  if (outcome.kind === "not_a_jd") {
    // Do not proceed to generation (Req 3.5).
    return { ok: false, error: "not_a_job_description" };
  }

  if (outcome.kind === "invalid") {
    // Still invalid after one retry (Req 3.4).
    return { ok: false, error: "parse_failed" };
  }

  // Persist the staging Job_Description with deterministic provenance hash and
  // the creating User identifier taken from the JWT by the caller (Req 6.1, 6.4).
  await connectdb();
  const doc = await JobDescription.create({
    sourceType,
    rawText,
    jdHash: jdHash(rawText),
    parsed: outcome.signal,
    createdBy: userId,
  });

  return {
    ok: true,
    jobDescriptionId: String(doc._id),
    parsed: outcome.signal,
  };
};
