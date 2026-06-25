import { z } from "zod";

// Zod schemas for the JD Question Generator feature.
//
// These validate untrusted boundaries:
//   - ParsedSignalSchema  -> Stage 1 LLM output (JD_Parser)
//   - GeneratedSetSchema  -> Stage 2 LLM output (Question_Generator)
//   - SetPatchSchema      -> PATCH /set/[id] request body
//
// See .kiro/specs/jd-question-generator/design.md ("Data Models").

// ---------------------------------------------------------------------------
// Enum value sources (kept as `as const` tuples so they can be reused for both
// the Zod enums and any non-Zod consumers).
// ---------------------------------------------------------------------------

export const SENIORITY_VALUES = [
  "intern",
  "junior",
  "mid",
  "senior",
  "lead",
] as const;

export const TARGET_DIFFICULTY_VALUES = [
  "easy",
  "medium",
  "hard",
  "mixed",
] as const;

export const QUESTION_DIFFICULTY_VALUES = ["easy", "medium", "hard"] as const;

export const QUESTION_KIND_VALUES = ["mcq", "coding", "aptitude"] as const;

export const seniorityEnum = z.enum(SENIORITY_VALUES);
export const targetDifficultyEnum = z.enum(TARGET_DIFFICULTY_VALUES);
export const questionDifficultyEnum = z.enum(QUESTION_DIFFICULTY_VALUES);
export const questionKindEnum = z.enum(QUESTION_KIND_VALUES);

// Minimum coding-question test-case constraints (Requirement 5.7).
const MIN_CODING_TEST_CASES = 3;

// ---------------------------------------------------------------------------
// ParsedSignalSchema (Requirement 3.2) — Stage 1 output validation.
// ---------------------------------------------------------------------------

export const ParsedSignalSchema = z.object({
  role: z.string().min(1, "role is required"),
  seniority: seniorityEnum,
  skills: z.array(z.string()),
  mustHave: z.array(z.string()),
  niceToHave: z.array(z.string()),
});

export type ParsedSignalInput = z.infer<typeof ParsedSignalSchema>;

// ---------------------------------------------------------------------------
// Generated question / set schemas (Requirements 5.2, 5.7).
// ---------------------------------------------------------------------------

export const TestCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  hidden: z.boolean(),
});

export const GeneratedQuestionSchema = z
  .object({
    kind: questionKindEnum,
    text: z.string().min(1, "question text is required"),
    options: z.array(z.string()).optional(),
    answer: z.string().optional(),
    testCases: z.array(TestCaseSchema).optional(),
    skillTag: z.string().optional(),
    language: z.string().optional(),
    difficulty: questionDifficultyEnum,
    // LLM output omits these review-state flags; default them so raw model
    // output validates while admin-edited payloads can set them explicitly.
    edited: z.boolean().default(false),
    manuallyAdded: z.boolean().optional(),
  })
  .superRefine((q, ctx) => {
    // Requirement 5.7: every coding question needs >=3 test cases, >=1 hidden.
    if (q.kind === "coding") {
      const testCases = q.testCases ?? [];
      if (testCases.length < MIN_CODING_TEST_CASES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["testCases"],
          message: `coding question requires at least ${MIN_CODING_TEST_CASES} test cases`,
        });
      }
      if (!testCases.some((tc) => tc.hidden)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["testCases"],
          message: "coding question requires at least one hidden test case",
        });
      }
    }
  });

export const GeneratedSetSchema = z.object({
  // Requirement 5.2: target difficulty constrained to the enum.
  difficulty: targetDifficultyEnum,
  questions: z.array(GeneratedQuestionSchema),
});

export type GeneratedQuestionInput = z.infer<typeof GeneratedQuestionSchema>;
export type GeneratedSetInput = z.infer<typeof GeneratedSetSchema>;

// ---------------------------------------------------------------------------
// PATCH /set/[id] body — discriminated union on `op`.
// ---------------------------------------------------------------------------

const nonNegativeIndex = z
  .number()
  .int("index must be an integer")
  .nonnegative("index must be >= 0");

export const SetPatchSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("edit"),
    index: nonNegativeIndex,
    question: GeneratedQuestionSchema,
  }),
  z.object({
    op: z.literal("delete"),
    index: nonNegativeIndex,
  }),
  z.object({
    op: z.literal("add"),
    question: GeneratedQuestionSchema,
  }),
]);

export type SetPatchInput = z.infer<typeof SetPatchSchema>;
