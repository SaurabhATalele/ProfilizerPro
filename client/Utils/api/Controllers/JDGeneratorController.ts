import connectdb from "@/Utils/api/db/connectDB";
import Assignment from "@/Utils/api/Models/Assignment";
import Question from "@/Utils/api/Models/Question";
import GeneratedQuestionSet from "@/Utils/api/Models/GeneratedQuestionSet";
import type {
  ApproveMeta,
  ApproveResult,
  GeneratedQuestion,
  QuestionDifficulty,
  QuestionKind,
  TestCase,
} from "@/Utils/types/JDGenerator";

// Controller for the review/edit/approve stage of the JD Question Generator.
//
// The pure helpers (set mutations + the GeneratedQuestion -> Question mapper)
// are exported separately from the persistence-bound controller functions so
// the property tests (tasks 5.2-5.4) can exercise them without a database or
// the LLM. See .kiro/specs/jd-question-generator/design.md
// ("Components and Interfaces" / "Data Models").

// ---------------------------------------------------------------------------
// Result type for the set-mutation controller functions.
// ---------------------------------------------------------------------------

export type SetMutationResult =
  | { ok: true; set: unknown }
  | { ok: false; error: "not_found" | "bad_index" };

// ---------------------------------------------------------------------------
// Mapping constants.
// ---------------------------------------------------------------------------

/** Per-question numeric level derived from difficulty (Req 9.3). */
const DIFFICULTY_LEVEL: Record<QuestionDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/** Default marks per kind for the mapped Question (not carried in ApproveMeta). */
const DEFAULT_MARKS: Record<QuestionKind, number> = {
  mcq: 1,
  coding: 5,
  aptitude: 1,
};

/** Difficulty values the existing Assignment schema accepts (no "mixed"). */
const ASSIGNMENT_DIFFICULTY_VALUES = ["easy", "medium", "hard"] as const;

/** Assignment.icon is required; generated Tests get a sensible default. */
const DEFAULT_ASSIGNMENT_ICON = "/icons/generated-test.svg";

// ---------------------------------------------------------------------------
// Pure set-mutation helpers (exported for property tests).
// ---------------------------------------------------------------------------

/**
 * Replace only the question at `index` with `q`, marking it edited. Every other
 * question is returned unchanged. Out-of-range indices yield an unchanged copy.
 */
export const editQuestionInSet = (
  questions: GeneratedQuestion[],
  index: number,
  q: GeneratedQuestion,
): GeneratedQuestion[] =>
  questions.map((existing, i) =>
    i === index ? { ...q, edited: true } : existing,
  );

/** Remove the question at `index`, yielding a set of length n-1. */
export const deleteQuestionFromSet = (
  questions: GeneratedQuestion[],
  index: number,
): GeneratedQuestion[] => questions.filter((_, i) => i !== index);

/** Append `q` (flagged `manuallyAdded`), yielding a set of length n+1. */
export const addQuestionToSet = (
  questions: GeneratedQuestion[],
  q: GeneratedQuestion,
): GeneratedQuestion[] => [...questions, { ...q, manuallyAdded: true }];

// ---------------------------------------------------------------------------
// Pure mapper: GeneratedQuestion -> existing Question schema shape.
// ---------------------------------------------------------------------------

/** Shape produced by the mapper, matching the existing Question schema. */
export interface MappedQuestion {
  Question: string;
  AssignmentId: string;
  type: QuestionKind;
  options?: string[];
  answer?: string;
  marks: number;
  level: number;
  kind: QuestionKind;
  skillTag?: string;
  testCases?: TestCase[];
}

/**
 * Map a single GeneratedQuestion onto the existing Question schema (Req 9.3):
 * text -> Question, kind -> type/kind, difficulty -> numeric level, with
 * options/answer/skillTag/testCases carried through when present.
 */
export const mapGeneratedQuestionToQuestion = (
  gq: GeneratedQuestion,
  assignmentId: string,
): MappedQuestion => {
  const mapped: MappedQuestion = {
    Question: gq.text,
    AssignmentId: assignmentId,
    type: gq.kind,
    marks: DEFAULT_MARKS[gq.kind],
    level: DIFFICULTY_LEVEL[gq.difficulty],
    kind: gq.kind,
  };
  if (gq.options !== undefined) mapped.options = gq.options;
  if (gq.answer !== undefined) mapped.answer = gq.answer;
  if (gq.skillTag !== undefined) mapped.skillTag = gq.skillTag;
  if (gq.testCases !== undefined) mapped.testCases = gq.testCases;
  return mapped;
};

// ---------------------------------------------------------------------------
// Persistence-bound controller functions.
// ---------------------------------------------------------------------------

/** Read the embedded questions of a set document as plain objects. */
const readQuestions = (set: {
  questions: { toObject: () => GeneratedQuestion[] };
}): GeneratedQuestion[] => set.questions.toObject();

/**
 * Edit the question at `index`, persisting the mutation to the
 * Generated_Question_Set (Req 7.2).
 */
export const editQuestion = async (
  setId: string,
  index: number,
  q: GeneratedQuestion,
): Promise<SetMutationResult> => {
  await connectdb();
  const set = await GeneratedQuestionSet.findById(setId);
  if (!set) return { ok: false, error: "not_found" };
  const current = readQuestions(set);
  if (index < 0 || index >= current.length) {
    return { ok: false, error: "bad_index" };
  }
  set.questions = editQuestionInSet(current, index, q);
  set.updatedAt = new Date();
  await set.save();
  return { ok: true, set };
};

/**
 * Delete the question at `index`, persisting the mutation to the
 * Generated_Question_Set (Req 7.3).
 */
export const deleteQuestion = async (
  setId: string,
  index: number,
): Promise<SetMutationResult> => {
  await connectdb();
  const set = await GeneratedQuestionSet.findById(setId);
  if (!set) return { ok: false, error: "not_found" };
  const current = readQuestions(set);
  if (index < 0 || index >= current.length) {
    return { ok: false, error: "bad_index" };
  }
  set.questions = deleteQuestionFromSet(current, index);
  set.updatedAt = new Date();
  await set.save();
  return { ok: true, set };
};

/**
 * Add a question manually, persisting the mutation to the
 * Generated_Question_Set (Req 7.4).
 */
export const addQuestion = async (
  setId: string,
  q: GeneratedQuestion,
): Promise<SetMutationResult> => {
  await connectdb();
  const set = await GeneratedQuestionSet.findById(setId);
  if (!set) return { ok: false, error: "not_found" };
  const current = readQuestions(set);
  set.questions = addQuestionToSet(current, q);
  set.updatedAt = new Date();
  await set.save();
  return { ok: true, set };
};

/**
 * Approve a Generated_Question_Set as a real Test (Req 9.x): validate the
 * passing score, then create one Assignment plus one Question per approved
 * question and record the new Test id on the set. Idempotent: a set that
 * already has a `testId` returns that id without creating a duplicate Test.
 */
export const approveAsTest = async (
  setId: string,
  meta: ApproveMeta,
  userId: string,
): Promise<ApproveResult> => {
  // Req 9.2: reject out-of-range scores before creating anything.
  if (meta.passingScore < 0 || meta.passingScore > 100) {
    return { ok: false, error: "invalid_score" };
  }

  await connectdb();
  const set = await GeneratedQuestionSet.findById(setId);
  if (!set) return { ok: false, error: "not_found" };

  // Idempotent guard (Req 9.4): never publish the same set twice.
  if (set.testId) {
    return { ok: true, testId: String(set.testId) };
  }

  // The set difficulty may be "mixed", which the Assignment enum rejects; fall
  // back to "medium" in that case.
  const difficulty = (
    ASSIGNMENT_DIFFICULTY_VALUES as readonly string[]
  ).includes(set.difficulty)
    ? set.difficulty
    : "medium";

  // Req 9.1: create the Test as an existing Assignment so it is immediately
  // attemptable through the unchanged test-attempt flow (Req 9.5).
  const assignment = await Assignment.create({
    name: meta.title,
    icon: DEFAULT_ASSIGNMENT_ICON,
    difficulty,
    owner: userId,
    isCustom: true,
  });

  // Req 9.3: one mapped Question document per approved question.
  const questions = readQuestions(set).map((gq) =>
    mapGeneratedQuestionToQuestion(gq, String(assignment._id)),
  );
  if (questions.length > 0) {
    await Question.insertMany(questions);
  }

  set.testId = assignment._id;
  set.updatedAt = new Date();
  await set.save();

  return { ok: true, testId: String(assignment._id) };
};
