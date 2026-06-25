import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";

// ---------------------------------------------------------------------------
// Module mocks — NO real LLM calls and NO real DB access happen in these tests.
//   * @/Utils/api/llm/LLMClient: keep the real pure helpers (parseJsonResponse,
//     stripMarkdownFences) but replace `callLLM` with a spy.
//   * @/Utils/api/Models/JobDescription: replace `.create` with a spy.
//   * @/Utils/api/db/connectDB: replace the default export with a spy.
// ---------------------------------------------------------------------------

const { mockCallLLM, mockCreate, mockConnect } = vi.hoisted(() => ({
  mockCallLLM: vi.fn(),
  mockCreate: vi.fn(),
  mockConnect: vi.fn(),
}));

vi.mock("@/Utils/api/llm/LLMClient", async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import(
    "@/Utils/api/llm/LLMClient"
  );
  return {
    ...actual,
    callLLM: mockCallLLM,
  };
});

vi.mock("@/Utils/api/Models/JobDescription", () => ({
  default: { create: mockCreate },
}));

vi.mock("@/Utils/api/db/connectDB", () => ({
  default: mockConnect,
}));

import {
  countWords,
  meetsMinimumLength,
  resolveJDInput,
  validateParsedSignal,
  parseJD,
  MINIMUM_JD_LENGTH,
  isSupportedUploadType,
} from "@/Utils/api/Controllers/JDParserController";
import {
  ParsedSignalSchema,
  SENIORITY_VALUES,
} from "@/Utils/validation/jdGeneratorSchemas";

// ---------------------------------------------------------------------------
// Shared arbitraries
// ---------------------------------------------------------------------------

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

/** A single whitespace-free "word" of 1-8 lowercase letters. */
const wordArb = fc
  .array(fc.constantFrom(...LETTERS), { minLength: 1, maxLength: 8 })
  .map((cs) => cs.join(""));

/** Text with FEWER than MINIMUM_JD_LENGTH words (0..49). */
const shortTextArb = fc
  .array(wordArb, { minLength: 0, maxLength: MINIMUM_JD_LENGTH - 1 })
  .map((words) => words.join(" "));

/** Text with AT LEAST MINIMUM_JD_LENGTH words. */
const longTextArb = fc
  .array(wordArb, { minLength: MINIMUM_JD_LENGTH, maxLength: MINIMUM_JD_LENGTH + 60 })
  .map((words) => words.join(" "));

/** Non-empty pasted text (has non-whitespace content). */
const validPasteArb = fc
  .string({ minLength: 1 })
  .filter((s) => s.trim().length > 0);

const baseNameArb = fc
  .array(fc.constantFrom(...LETTERS), { minLength: 1, maxLength: 6 })
  .map((cs) => cs.join(""));

const supportedExtArb = fc.constantFrom(
  ".txt",
  ".pdf",
  ".docx",
  ".TXT",
  ".Pdf",
  ".DOCX",
  ".Txt",
);

const unsupportedExtArb = fc.constantFrom(
  ".jpg",
  ".png",
  ".exe",
  ".csv",
  ".json",
  ".md",
  ".doc",
  ".rtf",
  "", // no extension at all
);

const supportedFileArb = fc
  .tuple(baseNameArb, supportedExtArb)
  .map(([base, ext]) => base + ext);

const unsupportedFileArb = fc
  .tuple(baseNameArb, unsupportedExtArb)
  .map(([base, ext]) => base + ext);

/** A schema-valid ParsedSignal candidate. */
const validSignalArb = fc.record({
  role: fc.string({ minLength: 1 }),
  seniority: fc.constantFrom(...SENIORITY_VALUES),
  skills: fc.array(fc.string()),
  mustHave: fc.array(fc.string()),
  niceToHave: fc.array(fc.string()),
});

beforeEach(() => {
  mockCallLLM.mockReset();
  mockCreate.mockReset();
  mockConnect.mockReset();
  mockConnect.mockResolvedValue(undefined);
  mockCreate.mockResolvedValue({ _id: "stub-id" });
});

// ===========================================================================
// Task 3.2 — Property 1: JD minimum-length gate (Requirement 2.5)
// ===========================================================================

describe("Property 1: JD minimum-length gate (Req 2.5)", () => {
  it("countWords counts whitespace-delimited words and ignores extra whitespace", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords("one")).toBe(1);
    expect(countWords("  one   two  three ")).toBe(3);
  });

  it("meetsMinimumLength toggles exactly at MINIMUM_JD_LENGTH words", () => {
    const below = Array(MINIMUM_JD_LENGTH - 1).fill("w").join(" ");
    const at = Array(MINIMUM_JD_LENGTH).fill("w").join(" ");
    expect(meetsMinimumLength(below)).toBe(false);
    expect(meetsMinimumLength(at)).toBe(true);
  });

  // Feature: jd-question-generator, Property 1: JD minimum-length gate
  it("countWords matches the constructed word count for any text", () => {
    fc.assert(
      fc.property(
        fc.array(wordArb, { minLength: 0, maxLength: 120 }),
        (words) => {
          const text = words.join(" ");
          expect(countWords(text)).toBe(words.length);
          expect(meetsMinimumLength(text)).toBe(
            words.length >= MINIMUM_JD_LENGTH,
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: jd-question-generator, Property 1: JD minimum-length gate
  it("parseJD short-circuits to too_short and never calls the LLM for <50 words", async () => {
    await fc.assert(
      fc.asyncProperty(shortTextArb, async (text) => {
        mockCallLLM.mockClear();
        mockCreate.mockClear();
        const result = await parseJD(text, "paste", "user-1");
        expect(result).toEqual({ ok: false, error: "too_short" });
        expect(mockCallLLM).not.toHaveBeenCalled();
        expect(mockCreate).not.toHaveBeenCalled();
      }),
      { numRuns: 100 },
    );
  });

  // Feature: jd-question-generator, Property 1: JD minimum-length gate
  it("text with >=50 words passes the length gate", () => {
    fc.assert(
      fc.property(longTextArb, (text) => {
        expect(meetsMinimumLength(text)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});

// ===========================================================================
// Task 3.3 — Property 2: Input source typing (Requirements 2.1, 2.2)
// ===========================================================================

describe("Property 2: Input source typing (Req 2.1, 2.2)", () => {
  // Feature: jd-question-generator, Property 2: Input source typing
  it("records sourceType 'paste' for pasted text", () => {
    fc.assert(
      fc.property(validPasteArb, (pasteText) => {
        const resolved = resolveJDInput({ pasteText });
        expect(resolved.ok).toBe(true);
        if (resolved.ok) {
          expect(resolved.sourceType).toBe("paste");
          expect(resolved.rawText).toBe(pasteText);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: jd-question-generator, Property 2: Input source typing
  it("records sourceType 'upload' for supported files (.txt/.pdf/.docx)", () => {
    fc.assert(
      fc.property(supportedFileArb, fc.string(), (filename, text) => {
        expect(isSupportedUploadType(filename)).toBe(true);
        const resolved = resolveJDInput({ upload: { filename, text } });
        expect(resolved.ok).toBe(true);
        if (resolved.ok) {
          expect(resolved.sourceType).toBe("upload");
          expect(resolved.rawText).toBe(text);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ===========================================================================
// Task 3.4 — Property 3: Unsupported-upload handling (Requirements 2.3, 2.4)
// ===========================================================================

describe("Property 3: Unsupported-upload handling (Req 2.3, 2.4)", () => {
  // Feature: jd-question-generator, Property 3: Unsupported-upload handling depends on paste presence
  it("rejects an unsupported upload as the sole input with unsupported_file", () => {
    fc.assert(
      fc.property(unsupportedFileArb, fc.string(), (filename, text) => {
        expect(isSupportedUploadType(filename)).toBe(false);
        const resolved = resolveJDInput({ upload: { filename, text } });
        expect(resolved.ok).toBe(false);
        if (!resolved.ok) {
          expect(resolved.error).toBe("unsupported_file");
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: jd-question-generator, Property 3: Unsupported-upload handling depends on paste presence
  it("processes the paste and ignores an unsupported upload when both are present", () => {
    fc.assert(
      fc.property(
        validPasteArb,
        unsupportedFileArb,
        fc.string(),
        (pasteText, filename, uploadText) => {
          const resolved = resolveJDInput({
            pasteText,
            upload: { filename, text: uploadText },
          });
          expect(resolved.ok).toBe(true);
          if (resolved.ok) {
            expect(resolved.sourceType).toBe("paste");
            expect(resolved.rawText).toBe(pasteText);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ===========================================================================
// Task 3.5 — Property 4: Parser output validation + seniority enum (Req 3.2)
// ===========================================================================

describe("Property 4: Parser output validation and seniority enum (Req 3.2)", () => {
  // Feature: jd-question-generator, Property 4: Parser output validation and seniority enum
  it("returns non-null iff schema-valid, with seniority always in the allowed enum", () => {
    const candidateArb = fc.oneof(
      validSignalArb,
      // Adversarial: valid shape but seniority outside the enum.
      fc.record({
        role: fc.string({ minLength: 1 }),
        seniority: fc
          .string()
          .filter((s) => !(SENIORITY_VALUES as readonly string[]).includes(s)),
        skills: fc.array(fc.string()),
        mustHave: fc.array(fc.string()),
        niceToHave: fc.array(fc.string()),
      }),
      // Adversarial: empty role.
      fc.record({
        role: fc.constant(""),
        seniority: fc.constantFrom(...SENIORITY_VALUES),
        skills: fc.array(fc.string()),
        mustHave: fc.array(fc.string()),
        niceToHave: fc.array(fc.string()),
      }),
      // Adversarial: wrong types / arbitrary junk.
      fc.anything(),
    );

    fc.assert(
      fc.property(candidateArb, (candidate) => {
        const result = validateParsedSignal(candidate);
        const schemaValid = ParsedSignalSchema.safeParse(candidate).success;
        if (schemaValid) {
          expect(result).not.toBeNull();
          expect(SENIORITY_VALUES as readonly string[]).toContain(
            result!.seniority,
          );
        } else {
          expect(result).toBeNull();
        }
      }),
      { numRuns: 100 },
    );
  });

  it("returns the typed signal for a concrete valid object", () => {
    const signal = {
      role: "Backend Engineer",
      seniority: "senior" as const,
      skills: ["go", "postgres"],
      mustHave: ["go"],
      niceToHave: ["kubernetes"],
    };
    expect(validateParsedSignal(signal)).toEqual(signal);
  });

  it("rejects an out-of-enum seniority", () => {
    expect(
      validateParsedSignal({
        role: "x",
        seniority: "principal",
        skills: [],
        mustHave: [],
        niceToHave: [],
      }),
    ).toBeNull();
  });
});

// ===========================================================================
// Task 3.6 — Unit tests: parser retry + not-a-JD (Requirements 3.3, 3.4, 3.5)
// ===========================================================================

describe("parseJD orchestration with mocked LLM (Req 3.3, 3.4, 3.5)", () => {
  const longJD = Array(60).fill("requirement").join(" ");
  const validSignal = {
    role: "Frontend Engineer",
    seniority: "mid",
    skills: ["react", "typescript"],
    mustHave: ["react"],
    niceToHave: ["next.js"],
  };

  it("retries once on malformed JSON then succeeds (Req 3.3)", async () => {
    mockCallLLM
      .mockResolvedValueOnce({ text: "this is not json", model: "test-model" })
      .mockResolvedValueOnce({
        text: JSON.stringify(validSignal),
        model: "test-model",
      });
    mockCreate.mockResolvedValue({ _id: "jd-123" });

    const result = await parseJD(longJD, "paste", "user-1");

    expect(mockCallLLM).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      ok: true,
      jobDescriptionId: "jd-123",
      parsed: validSignal,
    });
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("returns parse_failed when JSON is malformed twice (Req 3.4)", async () => {
    mockCallLLM
      .mockResolvedValueOnce({ text: "garbage one", model: "test-model" })
      .mockResolvedValueOnce({ text: "garbage two", model: "test-model" });

    const result = await parseJD(longJD, "paste", "user-1");

    expect(mockCallLLM).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: false, error: "parse_failed" });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns not_a_job_description for the non-JD marker without retrying (Req 3.5)", async () => {
    mockCallLLM.mockResolvedValueOnce({
      text: JSON.stringify({ notAJobDescription: true }),
      model: "test-model",
    });

    const result = await parseJD(longJD, "paste", "user-1");

    expect(mockCallLLM).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: false, error: "not_a_job_description" });
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
