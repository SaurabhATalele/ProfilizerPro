import { generateText } from "ai";
import { google } from "@ai-sdk/google";

/**
 * LLMClient — the single, provider-isolated integration point for every
 * LLM-backed action in the JD Question Generator (JD_Parser, Question_Generator).
 *
 * Provider note: the requirements/glossary name the Anthropic Messages API, but
 * ProfilizePro is currently wired to Google Gemini through the Vercel AI SDK
 * (see `GenerateTestController`), and only `GOOGLE_GENERATIVE_AI_API_KEY` is
 * configured. Per the design's open note, the provider choice is isolated behind
 * this wrapper: callers depend only on `callLLM`/`LLMResult`, so switching to
 * Anthropic later (e.g. `@ai-sdk/anthropic`) changes only this file — no other
 * component is affected.
 */

/** Result of a single LLM call. `model` is recorded as provenance by callers. */
export interface LLMResult {
  text: string;
  model: string;
}

/**
 * Thrown when an LLM call exceeds its configured request timeout. Callers map
 * this to a `504` rather than blocking indefinitely (Req 10.3).
 */
export class LLMTimeoutError extends Error {
  constructor(message = "LLM request timed out") {
    super(message);
    this.name = "LLMTimeoutError";
    // Restore the prototype chain for `instanceof` after transpilation.
    Object.setPrototypeOf(this, LLMTimeoutError.prototype);
  }
}

/** Default model id; overridable via `LLM_MODEL` to ease provider swaps. */
const DEFAULT_LLM_MODEL = "gemini-2.5-flash";

/**
 * Configured request timeout in milliseconds. Sourced from
 * `LLM_REQUEST_TIMEOUT_MS`; falls back to 30s when unset or non-numeric.
 */
export const LLM_REQUEST_TIMEOUT_MS =
  Number(process.env.LLM_REQUEST_TIMEOUT_MS) || 30_000;

/**
 * Strip any markdown code fences the model may wrap JSON in, reusing the
 * convention established in `GenerateTestController`.
 */
export const stripMarkdownFences = (text: string): string =>
  text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

/**
 * Parse fence-wrapped JSON from an LLM response into `T`, reusing the
 * strip-then-`JSON.parse` convention from `GenerateTestController`. Throws on
 * malformed JSON so callers can apply the single-retry-then-fail policy.
 */
export const parseJsonResponse = <T>(text: string): T => {
  try {
    return JSON.parse(stripMarkdownFences(text)) as T;
  } catch {
    throw new Error("Failed to parse LLM response as JSON");
  }
};

/**
 * Issue a single Messages-style request with a `system` instruction and a
 * `user` prompt, returning the (fence-stripped) text and the model id used.
 *
 * Enforces a request timeout: if the call exceeds `timeoutMs` (defaulting to
 * `LLM_REQUEST_TIMEOUT_MS`) it aborts the underlying request and rejects with
 * `LLMTimeoutError` instead of blocking indefinitely (Req 10.3).
 */
export const callLLM = async (params: {
  system: string;
  user: string;
  timeoutMs?: number;
}): Promise<LLMResult> => {
  const { system, user } = params;
  const timeoutMs = params.timeoutMs ?? LLM_REQUEST_TIMEOUT_MS;
  const modelId = process.env.LLM_MODEL || DEFAULT_LLM_MODEL;

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      // Cancel the in-flight request so it does not keep running after timeout.
      controller.abort();
      reject(new LLMTimeoutError(`LLM request exceeded ${timeoutMs}ms`));
    }, timeoutMs);
  });

  const generation = generateText({
    model: google(modelId),
    system,
    prompt: user,
    abortSignal: controller.signal,
  });

  // If the timeout wins the race, the aborted generation settles later; swallow
  // that late rejection to avoid an unhandled-rejection warning.
  generation.catch(() => undefined);

  try {
    const { text } = await Promise.race([generation, timeout]);
    return { text: stripMarkdownFences(text), model: modelId };
  } finally {
    if (timer) clearTimeout(timer);
  }
};
