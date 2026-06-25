import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import type {
  GeneratedQuestion,
  QuestionDifficulty,
  QuestionKind,
} from "@/Utils/types/JDGenerator";

// ---------------------------------------------------------------------------
// Module mocks: no real DB / model code runs. The controller imports these
// four modules; each is replaced with a spy-backed stub so the orchestration
// functions can be exercised without a database.
// ---------------------------------------------------------------------------

vi.mock("@/Utils/api/db/connectDB", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/Utils/api/Models/Assignment", () => ({
  default: { create: vi.fn() },
}));

vi.mock("@/Utils/api/Models/Question", () => ({
  default: { insertMany: vi.fn() },
}));

vi.mock("@/Utils/api/Models/GeneratedQuestionSet", () => ({
  default: { findById: vi.fn() },
}));

import Assignment from "@/Utils/api/Models/Assignment";
import Question from "@/Utils/api/Models/Question";
import GeneratedQuestionSet from "@/Utils/api/Models/GeneratedQuestionSet";
import {
  editQuestionInSet,
  deleteQuestionFromSet,
  addQuestionToSet,
  mapGeneratedQuestionToQuestion,
  editQuestion,
  deleteQuestion,
  addQuestion,
  approveAsTest,
} from "@/Utils/api/Controllers/JDGeneratorController";

// ---------------------------------------------------------------------------
// Shared fast-check arbitraries and helpers.
// ---------------------------------------------------------------------------

const DIFFICULTY_LEVEL: Record<QuestionDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const kindArb = fc.constantFrom<QuestionKind>("mcq", "coding", "aptitude");
const difficultyArb = fc.constantFrom<QuestionDifficulty>(
  "easy",
  "medium",
  "hard",
);

const testCaseArb = fc.record({
  input: fc.string(),
  expectedOutput: fc.string(),
  hidden: fc.boolean(),
});

/** A GeneratedQuestion with required fields always present and optional fields sometimes present. */
const questionArb: fc.Arbitrary<GeneratedQuestion> = fc.record(
  {
    kind: kindArb,
    text: fc.string({ minLength: 1 }),
    difficulty: difficultyArb,
    edited: fc.boolean(),
    options: fc.array(fc.string()),
    answer: fc.string(),
    skillTag: fc.string(),
    language: fc.string(),
    testCases: fc.array(testCaseArb),
    manuallyAdded: fc.boolean(),
  },
  { requiredKeys: ["kind", "text", "difficulty", "edited"] },
) as fc.Arbitrary<GeneratedQuestion>;

/** A score arbitrary that spans well outside the valid [0, 100] range. */
const scoreArb = fc.oneof(
  fc.integer({ min: -200, max: 300 }),
  fc.double({ min: -200, max: 300, noNaN: true }),
);

interface MockSetDoc {
  questions: { toObject: () => GeneratedQuestion[] };
  difficulty: string;
  testId?: unknown;
  updatedAt?: Date;
  save: ReturnType<typeof vi.fn>;
}

/** Build a mock Generated_Question_Set document whose questions.toObject() is a plain array and .save() is a spy. */
const makeSetDoc = (
  questions: GeneratedQuestion[],
  opts: { difficulty?: string; testId?: unknown } = {},
): MockSetDoc => {
  const doc: MockSetDoc = {
    // `questions` is reassigned by the controller to a plain array; expose a
    // toObject() that reads the current value so reads stay consistent.
    questions: { toObject: () => questions },
    difficulty: opts.difficulty ?? "medium",
    testId: opts.testId,
    save: vi.fn().mockResolvedValue(undefined),
  };
  return doc;
};

const meta = { title: "Generated Test", duration: 30, passingScore: 50 };

beforeEach(() => {
  vi.mocked(GeneratedQuestionSet.findById).mockReset();
  vi.mocked(Assignment.create).mockReset();
  vi.mocked(Question.insertMany).mockReset();
});

// ---------------------------------------------------------------------------
// Task 5.2 — Property 12: Question-set editing operations (Req 7.2, 7.3, 7.4)
// ---------------------------------------------------------------------------

describe("Property 12: question-set editing operations", () => {
  // Feature: jd-question-generator, Property 12: editing the question at a valid index replaces only that question's content, sets its edited flag to true, and leaves all other questions unchanged; deleting at a valid index yields a set of length n-1 equal to the original minus that question; adding a question yields a set of length n+1 that contains the new question.
  // Validates: Requirements 7.2, 7.3, 7.4
  it("edit replaces only the target question and sets edited=true, others unchanged", () => {
    fc.assert(
      fc.property(
        fc.array(questionArb, { minLength: 1 }),
        questionArb,
        fc.nat(),
        (questions, replacement, rawIndex) => {
          const index = rawIndex % questions.length;
          const result = editQuestionInSet(questions, index, replacement);

          // Same length.
          expect(result.length).toBe(questions.length);
          // Target replaced with the new content, flagged edited.
          expect(result[index]).toEqual({ ...replacement, edited: true });
          // Every other question is left exactly as it was (reference-equal).
          questions.forEach((original, i) => {
            if (i !== index) expect(result[i]).toBe(original);
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: jd-question-generator, Property 12: deleting at a valid index yields a set of length n-1 equal to the original minus that question.
  // Validates: Requirements 7.3
  it("delete yields length n-1 equal to the original minus that question", () => {
    fc.assert(
      fc.property(
        fc.array(questionArb, { minLength: 1 }),
        fc.nat(),
        (questions, rawIndex) => {
          const index = rawIndex % questions.length;
          const result = deleteQuestionFromSet(questions, index);

          expect(result.length).toBe(questions.length - 1);
          // Result equals the original with the element at `index` removed.
          const expected = questions.filter((_, i) => i !== index);
          expect(result).toEqual(expected);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: jd-question-generator, Property 12: adding a question yields a set of length n+1 that contains the new question.
  // Validates: Requirements 7.4
  it("add yields length n+1 containing the new question", () => {
    fc.assert(
      fc.property(
        fc.array(questionArb),
        questionArb,
        (questions, newQuestion) => {
          const result = addQuestionToSet(questions, newQuestion);

          expect(result.length).toBe(questions.length + 1);
          // The appended question is present (flagged manuallyAdded).
          expect(result[result.length - 1]).toEqual({
            ...newQuestion,
            manuallyAdded: true,
          });
          // Pre-existing questions are preserved unchanged.
          questions.forEach((original, i) => {
            expect(result[i]).toBe(original);
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Task 5.3 — Property 15: Passing-score range validation (Req 9.2)
// ---------------------------------------------------------------------------

describe("Property 15: passing-score range validation", () => {
  // Feature: jd-question-generator, Property 15: for any supplied passing score, approval succeeds only if the score is within [0, 100]; otherwise approval is rejected with a validation error and no Assignment or Question documents are created.
  // Validates: Requirements 9.2
  it("approves only when passingScore is within [0,100]; out-of-range creates nothing", async () => {
    await fc.assert(
      fc.asyncProperty(scoreArb, fc.array(questionArb), async (score, questions) => {
        vi.mocked(Assignment.create).mockClear();
        vi.mocked(Question.insertMany).mockClear();
        vi.mocked(Assignment.create).mockResolvedValue({
          _id: "assignment-id",
        } as never);
        vi.mocked(Question.insertMany).mockResolvedValue([] as never);
        vi.mocked(GeneratedQuestionSet.findById).mockResolvedValue(
          makeSetDoc(questions) as never,
        );

        const result = await approveAsTest(
          "set-id",
          { ...meta, passingScore: score },
          "user-1",
        );

        const inRange = score >= 0 && score <= 100;
        if (inRange) {
          expect(result.ok).toBe(true);
          expect(Assignment.create).toHaveBeenCalledTimes(1);
        } else {
          expect(result).toEqual({ ok: false, error: "invalid_score" });
          // No Test artifacts created for an invalid score.
          expect(Assignment.create).not.toHaveBeenCalled();
          expect(Question.insertMany).not.toHaveBeenCalled();
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Task 5.4 — Property 16: Question mapping coverage (Req 9.3)
// ---------------------------------------------------------------------------

describe("Property 16: question mapping coverage", () => {
  // Feature: jd-question-generator, Property 16: the mapper produces exactly one schema-valid Question document per Generated_Question, preserving the question text, options, answer, and kind, and assigning a valid numeric level; the number of Question documents equals the number of approved questions.
  // Validates: Requirements 9.3
  it("maps each GeneratedQuestion to exactly one Question preserving fields and a valid level", () => {
    fc.assert(
      fc.property(
        fc.array(questionArb),
        fc.string({ minLength: 1 }),
        (questions, assignmentId) => {
          const mapped = questions.map((q) =>
            mapGeneratedQuestionToQuestion(q, assignmentId),
          );

          // n approved questions -> n Question docs.
          expect(mapped.length).toBe(questions.length);

          questions.forEach((q, i) => {
            const m = mapped[i];
            // text/kind preserved.
            expect(m.Question).toBe(q.text);
            expect(m.kind).toBe(q.kind);
            expect(m.type).toBe(q.kind);
            expect(m.AssignmentId).toBe(assignmentId);
            // valid numeric level mapped from difficulty (easy=1/medium=2/hard=3).
            expect(m.level).toBe(DIFFICULTY_LEVEL[q.difficulty]);
            expect([1, 2, 3]).toContain(m.level);
            // options/answer carried through when present.
            if (q.options !== undefined) expect(m.options).toEqual(q.options);
            else expect(m.options).toBeUndefined();
            if (q.answer !== undefined) expect(m.answer).toBe(q.answer);
            else expect(m.answer).toBeUndefined();
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Task 5.5 — Unit tests: no-publish-before-approval + idempotent approval
// (Req 7.5, 9.4)
// ---------------------------------------------------------------------------

describe("no-publish-before-approval (Req 7.5)", () => {
  const sampleQuestions: GeneratedQuestion[] = [
    { kind: "mcq", text: "Q1", difficulty: "easy", edited: false, options: ["a", "b"], answer: "a" },
    { kind: "aptitude", text: "Q2", difficulty: "medium", edited: false },
  ];

  it("editQuestion does not create any Assignment or Question", async () => {
    vi.mocked(GeneratedQuestionSet.findById).mockResolvedValue(
      makeSetDoc(sampleQuestions) as never,
    );

    const result = await editQuestion("set-id", 0, {
      kind: "mcq",
      text: "edited",
      difficulty: "hard",
      edited: false,
    });

    expect(result.ok).toBe(true);
    expect(Assignment.create).not.toHaveBeenCalled();
    expect(Question.insertMany).not.toHaveBeenCalled();
  });

  it("deleteQuestion does not create any Assignment or Question", async () => {
    vi.mocked(GeneratedQuestionSet.findById).mockResolvedValue(
      makeSetDoc(sampleQuestions) as never,
    );

    const result = await deleteQuestion("set-id", 0);

    expect(result.ok).toBe(true);
    expect(Assignment.create).not.toHaveBeenCalled();
    expect(Question.insertMany).not.toHaveBeenCalled();
  });

  it("addQuestion does not create any Assignment or Question", async () => {
    vi.mocked(GeneratedQuestionSet.findById).mockResolvedValue(
      makeSetDoc(sampleQuestions) as never,
    );

    const result = await addQuestion("set-id", {
      kind: "coding",
      text: "new",
      difficulty: "medium",
      edited: false,
    });

    expect(result.ok).toBe(true);
    expect(Assignment.create).not.toHaveBeenCalled();
    expect(Question.insertMany).not.toHaveBeenCalled();
  });
});

describe("idempotent approval (Req 9.4)", () => {
  it("approving twice does not create a duplicate Test; second call returns the existing testId", async () => {
    const questions: GeneratedQuestion[] = [
      { kind: "mcq", text: "Q1", difficulty: "easy", edited: false, options: ["a"], answer: "a" },
    ];
    // findById returns the SAME doc both times so the testId set by the first
    // approval is visible to the second (idempotent guard).
    const setDoc = makeSetDoc(questions);
    vi.mocked(GeneratedQuestionSet.findById).mockResolvedValue(setDoc as never);
    vi.mocked(Assignment.create).mockImplementation(async () => {
      const created = { _id: "assignment-xyz" };
      return created as never;
    });
    vi.mocked(Question.insertMany).mockResolvedValue([] as never);

    const first = await approveAsTest("set-id", meta, "user-1");
    // The first approval records testId on the SAME doc; the second approval
    // must observe it via the idempotent guard and create nothing new.
    const second = await approveAsTest("set-id", meta, "user-1");

    expect(first).toEqual({ ok: true, testId: "assignment-xyz" });
    expect(second).toEqual({ ok: true, testId: "assignment-xyz" });
    // Test artifacts created exactly once across both approvals.
    expect(Assignment.create).toHaveBeenCalledTimes(1);
    expect(Question.insertMany).toHaveBeenCalledTimes(1);
  });
});
