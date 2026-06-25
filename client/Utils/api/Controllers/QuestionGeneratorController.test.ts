import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";

// ---------------------------------------------------------------------------
// Mocks — NO real LLM or DB calls happen in these tests.
// ---------------------------------------------------------------------------

// Keep the real parseJsonResponse / stripMarkdownFences (used by the
// orchestration), but stub callLLM so nothing reaches the provider.
vi.mock("@/Utils/api/llm/LLMClient", async () => {
  const actual = await vi.importActual<
    typeof import("@/Utils/api/llm/LLMClient")
  >("@/Utils/api/llm/LLMClient");
  return {
    ...actual,
    callLLM: vi.fn(),
  };
});

// connectdb is a no-op in tests.
vi.mock("@/Utils/api/db/connectDB", () => ({
  default: vi.fn(async () => undefined),
}));

// GeneratedQuestionSet model: usable both as a constructor (generateQuestionSet)
// and with a static findById (regenerateQuestion).
vi.mock("@/Utils/api/Models/GeneratedQuestionSet", () => {
  const ctor: any = vi.fn(function (this: any, doc: any) {
    Object.assign(this, doc);
    this.save = vi.fn().mockResolvedValue({ ...doc, _id: "generated-set-id" });
  });
  ctor.findById = vi.fn();
  return { default: ctor };
});

// JobDescription model: only findById is used (to fetch rawText).
vi.mock("@/Utils/api/Models/JobDescription", () => {
  const ctor: any = vi.fn();
  ctor.findById = vi.fn().mockResolvedValue({ rawText: "default raw text" });
  return { default: ctor };
});

import {
  generateQuestionSet,
  regenerateQuestion,
  PROMPT_VERSION,
  REGENERATE_COOLDOWN_MS,
  jdHash,
} from "@/Utils/api/Controllers/QuestionGeneratorController";
import { callLLM } from "@/Utils/api/llm/LLMClient";
import GeneratedQuestionSetModel from "@/Utils/api/Models/GeneratedQuestionSet";
import JobDescriptionModel from "@/Utils/api/Models/JobDescription";
import type { GenerationInput } from "@/Utils/types/JDGenerator";

const RUNS = { numRuns: 100 } as const;

const callLLMMock = vi.mocked(callLLM);
const setCtorMock = vi.mocked(GeneratedQuestionSetModel) as unknown as ReturnType<
  typeof vi.fn
>;
const setFindByIdMock = vi.mocked(
  (GeneratedQuestionSetModel as any).findById,
) as ReturnType<typeof vi.fn>;
const jdFindByIdMock = vi.mocked(
  (JobDescriptionModel as any).findById,
) as ReturnType<typeof vi.fn>;

const baseInput: GenerationInput = {
  jobDescriptionId: "jd-1",
  confirmedSignal: {
    role: "Backend Engineer",
    seniority: "mid",
    skills: ["node"],
    mustHave: ["node"],
    niceToHave: [],
  },
  mix: { mcq: 5, coding: 5, aptitude: 5 },
  difficulty: "mixed",
  preferredLanguages: [],
};

// A schema-valid generated set (all aptitude so skillTag enforcement / mix
// caps leave provenance untouched).
const validSetExample = {
  difficulty: "mixed",
  questions: [
    { kind: "aptitude", text: "What is 2 + 2?", difficulty: "easy" },
    { kind: "aptitude", text: "Explain recursion.", difficulty: "medium" },
  ],
};

beforeEach(() => {
  callLLMMock.mockReset();
  setCtorMock.mockClear();
  setFindByIdMock.mockReset();
  jdFindByIdMock.mockReset();
  jdFindByIdMock.mockResolvedValue({ rawText: "default raw text" });
});

// ---------------------------------------------------------------------------
// fast-check arbitraries for schema-valid generated sets.
// ---------------------------------------------------------------------------

const questionDifficultyArb = fc.constantFrom("easy", "medium", "hard");
const targetDifficultyArb = fc.constantFrom("easy", "medium", "hard", "mixed");

const testCaseArb = fc.record({
  input: fc.string(),
  expectedOutput: fc.string(),
  hidden: fc.boolean(),
});

const validCodingTestCases = fc
  .array(testCaseArb, { minLength: 3, maxLength: 6 })
  .map((tcs) =>
    tcs.some((t) => t.hidden)
      ? tcs
      : [{ input: "i", expectedOutput: "o", hidden: true }, ...tcs],
  );

const validQuestionArb = fc.oneof(
  fc.record({
    kind: fc.constant("mcq"),
    text: fc.string({ minLength: 1 }),
    difficulty: questionDifficultyArb,
  }),
  fc.record({
    kind: fc.constant("aptitude"),
    text: fc.string({ minLength: 1 }),
    difficulty: questionDifficultyArb,
  }),
  fc.record({
    kind: fc.constant("coding"),
    text: fc.string({ minLength: 1 }),
    difficulty: questionDifficultyArb,
    testCases: validCodingTestCases,
  }),
);

const validSetArb = fc.record({
  difficulty: targetDifficultyArb,
  questions: fc.array(validQuestionArb, { maxLength: 6 }),
});

// ===========================================================================
// generateQuestionSet
// ===========================================================================

describe("generateQuestionSet", () => {
  it("Property 7: terminal validation failure persists NOTHING and returns generation_failed", async () => {
    // Feature: jd-question-generator, Property 7: Generation output validation with no partial persistence
    await fc.assert(
      fc.asyncProperty(fc.string(), async (jdText) => {
        callLLMMock.mockReset();
        setCtorMock.mockClear();
        jdFindByIdMock.mockResolvedValue({ rawText: jdText || "x" });
        // Both the initial attempt and the stricter retry yield invalid output.
        callLLMMock.mockResolvedValue({ text: "this is not json", model: "m" });

        const res = await generateQuestionSet(baseInput, "user-A");

        expect(res.ok).toBe(false);
        if (!res.ok) expect(res.error).toBe("generation_failed");
        // No Generated_Question_Set was ever constructed/persisted.
        expect(setCtorMock).not.toHaveBeenCalled();
      }),
      RUNS,
    );
  });

  it("Property 11: on success persists createdBy == userId and generatedFrom { jdHash, model, promptVersion }", async () => {
    // Feature: jd-question-generator, Property 11: Provenance, authorship, and jdHash determinism
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        validSetArb,
        async (userId, rawText, model, validSet) => {
          callLLMMock.mockReset();
          setCtorMock.mockClear();
          jdFindByIdMock.mockResolvedValue({ rawText });
          callLLMMock.mockResolvedValue({
            text: JSON.stringify(validSet),
            model,
          });

          const res = await generateQuestionSet(baseInput, userId);

          expect(res.ok).toBe(true);
          if (res.ok) {
            expect(res.set.createdBy).toBe(userId);
            expect(res.set.generatedFrom.jdHash).toBe(jdHash(rawText));
            expect(res.set.generatedFrom.model).toBe(model);
            expect(res.set.generatedFrom.promptVersion).toBe(PROMPT_VERSION);
          }
        },
      ),
      RUNS,
    );
  });

  // Unit tests — Requirements 5.4, 5.5.
  it("Unit (5.4): invalid output then valid on retry -> success and persists once", async () => {
    jdFindByIdMock.mockResolvedValue({ rawText: "a real job description" });
    callLLMMock
      .mockResolvedValueOnce({ text: "INVALID", model: "m1" })
      .mockResolvedValueOnce({
        text: JSON.stringify(validSetExample),
        model: "m2",
      });

    const res = await generateQuestionSet(baseInput, "user-A");

    expect(res.ok).toBe(true);
    expect(callLLMMock).toHaveBeenCalledTimes(2);
    expect(setCtorMock).toHaveBeenCalledTimes(1);
    if (res.ok) {
      expect(res.set.generatedFrom.model).toBe("m2");
    }
  });

  it("Unit (5.5): invalid output twice -> generation_failed with no persistence", async () => {
    jdFindByIdMock.mockResolvedValue({ rawText: "a real job description" });
    callLLMMock.mockResolvedValue({ text: "STILL INVALID", model: "m" });

    const res = await generateQuestionSet(baseInput, "user-A");

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("generation_failed");
    expect(callLLMMock).toHaveBeenCalledTimes(2);
    expect(setCtorMock).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// regenerateQuestion
// ===========================================================================

interface StoredQuestion {
  kind: "mcq" | "coding" | "aptitude";
  text: string;
  difficulty: "easy" | "medium" | "hard";
  skillTag?: string;
  edited: boolean;
}

const makeSet = (questions: StoredQuestion[], lastRegenerationAt?: Date) => {
  const set: any = {
    questions: questions.map((q) => ({ ...q })),
    lastRegenerationAt,
    markModified: vi.fn(),
    updatedAt: undefined,
  };
  set.save = vi.fn().mockImplementation(async () => set);
  return set;
};

const REPLACEMENT_TEXT = "REGENERATED-REPLACEMENT-XYZ";
const replacementJson = JSON.stringify({
  kind: "mcq",
  text: REPLACEMENT_TEXT,
  difficulty: "medium",
});

const storedQuestionArb: fc.Arbitrary<StoredQuestion> = fc.record({
  kind: fc.constantFrom("mcq", "coding", "aptitude"),
  text: fc.string({ minLength: 1 }),
  difficulty: fc.constantFrom("easy", "medium", "hard"),
  skillTag: fc.option(fc.string(), { nil: undefined }),
  edited: fc.boolean(),
});

describe("regenerateQuestion", () => {
  it("Property 13: replaces only the question at index i; all others (incl. edited) unchanged", async () => {
    // Feature: jd-question-generator, Property 13: Single-question regeneration isolation
    await fc.assert(
      fc.asyncProperty(
        fc.array(storedQuestionArb, { minLength: 1, maxLength: 8 }),
        fc.nat(),
        async (questions, idxSeed) => {
          const index = idxSeed % questions.length;
          callLLMMock.mockReset();
          callLLMMock.mockResolvedValue({ text: replacementJson, model: "m" });

          const original = questions.map((q) => ({ ...q }));
          const set = makeSet(questions, undefined);
          setFindByIdMock.mockReset();
          setFindByIdMock.mockResolvedValue(set);

          const res = await regenerateQuestion("set-1", index, "user-A");

          expect(res.ok).toBe(true);
          if (res.ok) {
            res.set.questions.forEach((q: StoredQuestion, j: number) => {
              if (j === index) {
                // Only the targeted slot changed; it carries the new text.
                expect(q.text).toBe(REPLACEMENT_TEXT);
              } else {
                // Every other question — including edited ones — is untouched.
                expect(q).toEqual(original[j]);
              }
            });
          }
        },
      ),
      RUNS,
    );
  });

  it("Property 14: a second request within the cooldown is rate_limited and never calls the LLM", async () => {
    // Feature: jd-question-generator, Property 14: Regenerate cooldown
    await fc.assert(
      fc.asyncProperty(
        // Stay clear of the boundary to avoid clock-drift flakiness.
        fc.integer({ min: 0, max: REGENERATE_COOLDOWN_MS - 2000 }),
        async (elapsed) => {
          callLLMMock.mockReset();
          const set = makeSet(
            [{ kind: "mcq", text: "q", difficulty: "easy", edited: false }],
            new Date(Date.now() - elapsed),
          );
          setFindByIdMock.mockReset();
          setFindByIdMock.mockResolvedValue(set);

          const res = await regenerateQuestion("set-1", 0, "user-A");

          expect(res.ok).toBe(false);
          if (!res.ok) expect(res.error).toBe("rate_limited");
          expect(callLLMMock).not.toHaveBeenCalled();
        },
      ),
      RUNS,
    );
  });

  it("Property 14: a request at or beyond the cooldown is allowed and calls the LLM", async () => {
    // Feature: jd-question-generator, Property 14: Regenerate cooldown
    await fc.assert(
      fc.asyncProperty(
        fc.integer({
          min: REGENERATE_COOLDOWN_MS + 2000,
          max: REGENERATE_COOLDOWN_MS * 5,
        }),
        async (elapsed) => {
          callLLMMock.mockReset();
          callLLMMock.mockResolvedValue({ text: replacementJson, model: "m" });
          const set = makeSet(
            [{ kind: "mcq", text: "q", difficulty: "easy", edited: false }],
            new Date(Date.now() - elapsed),
          );
          setFindByIdMock.mockReset();
          setFindByIdMock.mockResolvedValue(set);

          const res = await regenerateQuestion("set-1", 0, "user-A");

          expect(res.ok).toBe(true);
          expect(callLLMMock).toHaveBeenCalled();
        },
      ),
      RUNS,
    );
  });
});
