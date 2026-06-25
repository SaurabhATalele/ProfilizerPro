"use client";
import { FC, useMemo, useState } from "react";
import { addQuestion } from "@/Utils/Apicalls/JDGenerator";
import type {
  GeneratedQuestion,
  GeneratedQuestionSet,
  ParsedSignal,
  Mix,
  QuestionKind,
  QuestionDifficulty,
  TestCase,
} from "@/Utils/types/JDGenerator";
import Toast from "@/Utils/Toast";
import QuestionCard from "./QuestionCard";

interface QuestionReviewStepProps {
  setId: string;
  questions: GeneratedQuestion[];
  shortfall: Mix | null;
  confirmedSignal: ParsedSignal;
  /** Replace the working question list (used after every server mutation). */
  onQuestionsChange: (questions: GeneratedQuestion[]) => void;
  onProceed: () => void;
  onBack: () => void;
}

const KIND_ORDER: QuestionKind[] = ["mcq", "coding", "aptitude"];
const KIND_LABELS: Record<QuestionKind, string> = {
  mcq: "Multiple Choice",
  coding: "Coding",
  aptitude: "Aptitude",
};
const DIFFICULTY_OPTIONS: QuestionDifficulty[] = ["easy", "medium", "hard"];

const emptyTestCases = (): TestCase[] => [
  { input: "", expectedOutput: "", hidden: false },
  { input: "", expectedOutput: "", hidden: false },
  { input: "", expectedOutput: "", hidden: true },
];

/**
 * Step 4 — questions grouped by kind, each rendered as a QuestionCard with its
 * own edit / delete / regenerate controls. Provides an add-question control
 * whose submission has its own loading indicator and inline error (Req 7.1).
 */
const QuestionReviewStep: FC<QuestionReviewStepProps> = ({
  setId,
  questions,
  shortfall,
  confirmedSignal,
  onQuestionsChange,
  onProceed,
  onBack,
}) => {
  const skillOptions = useMemo<string[]>(() => {
    const merged = [
      ...(confirmedSignal.mustHave ?? []),
      ...(confirmedSignal.niceToHave ?? []),
      ...(confirmedSignal.skills ?? []),
    ];
    return Array.from(new Set(merged.filter(Boolean)));
  }, [confirmedSignal]);

  // Add-question form state.
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [addKind, setAddKind] = useState<QuestionKind>("mcq");
  const [addDifficulty, setAddDifficulty] =
    useState<QuestionDifficulty>("medium");
  const [addText, setAddText] = useState<string>("");
  const [addAnswer, setAddAnswer] = useState<string>("");
  const [addOptions, setAddOptions] = useState<string>("");
  const [addSkillTag, setAddSkillTag] = useState<string>("");
  const [addLanguage, setAddLanguage] = useState<string>("");
  const [addTestCases, setAddTestCases] = useState<TestCase[]>(emptyTestCases());
  const [adding, setAdding] = useState<boolean>(false);
  const [addError, setAddError] = useState<string>("");

  // Pair each question with its index in the full set before grouping, so the
  // QuestionCard always operates on the correct server-side index.
  const indexed = questions.map((question, index) => ({ question, index }));
  const grouped = KIND_ORDER.map((kind) => ({
    kind,
    items: indexed.filter((entry) => entry.question.kind === kind),
  }));

  const hasShortfall =
    shortfall &&
    (shortfall.mcq > 0 || shortfall.coding > 0 || shortfall.aptitude > 0);

  const updateTestCase = (
    i: number,
    field: keyof TestCase,
    value: string | boolean,
  ): void => {
    setAddTestCases((prev) =>
      prev.map((tc, idx) => (idx === i ? { ...tc, [field]: value } : tc)),
    );
  };

  const resetAddForm = (): void => {
    setAddKind("mcq");
    setAddDifficulty("medium");
    setAddText("");
    setAddAnswer("");
    setAddOptions("");
    setAddSkillTag("");
    setAddLanguage("");
    setAddTestCases(emptyTestCases());
    setAddError("");
  };

  const handleAdd = async (): Promise<void> => {
    setAddError("");
    if (!addText.trim()) {
      setAddError("Question text is required.");
      return;
    }

    const newQuestion: GeneratedQuestion = {
      kind: addKind,
      text: addText.trim(),
      difficulty: addDifficulty,
      edited: false,
      manuallyAdded: true,
    };

    if (addKind === "mcq") {
      const options = addOptions
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean);
      if (options.length > 0) newQuestion.options = options;
      if (addAnswer.trim()) newQuestion.answer = addAnswer.trim();
    }
    if (addKind === "aptitude" && addAnswer.trim()) {
      newQuestion.answer = addAnswer.trim();
    }
    if (addKind === "coding") {
      if (addLanguage.trim()) newQuestion.language = addLanguage.trim();
      newQuestion.testCases = addTestCases.filter(
        (tc) => tc.input.trim() !== "" || tc.expectedOutput.trim() !== "",
      );
    }
    if (addSkillTag) newQuestion.skillTag = addSkillTag;

    setAdding(true);
    try {
      const resp = await addQuestion(setId, newQuestion);
      const data: {
        set?: GeneratedQuestionSet;
        questions?: GeneratedQuestion[];
        error?: string;
      } = await resp.json();
      const updatedQuestions = data.set?.questions ?? data.questions;
      if (!resp.ok || !Array.isArray(updatedQuestions)) {
        const message = "Couldn't add the question. Please try again.";
        setAddError(message);
        Toast("error", message);
        return;
      }
      onQuestionsChange(updatedQuestions);
      Toast("success", "Question added.");
      resetAddForm();
      setShowAdd(false);
    } catch {
      const message = "Network error while adding. Please try again.";
      setAddError(message);
      Toast("error", message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {hasShortfall && shortfall && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
          Some requested questions couldn&apos;t be generated — shortfall: MCQ{" "}
          {shortfall.mcq}, Coding {shortfall.coding}, Aptitude{" "}
          {shortfall.aptitude}.
        </p>
      )}

      {questions.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No questions in this set. Add one below or go back to regenerate.
        </p>
      )}

      {grouped.map(
        ({ kind, items }) =>
          items.length > 0 && (
            <div key={kind}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {KIND_LABELS[kind]} ({items.length})
              </h2>
              <div className="flex flex-col gap-3">
                {items.map(({ question, index }) => (
                  <QuestionCard
                    key={index}
                    setId={setId}
                    question={question}
                    index={index}
                    onSetUpdated={onQuestionsChange}
                  />
                ))}
              </div>
            </div>
          ),
      )}

      {/* Add-question control */}
      <div className="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700">
        {!showAdd ? (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="text-sm font-medium text-[var(--color-primary)] transition-colors duration-300 hover:underline dark:text-white"
          >
            + Add a question manually
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="add-kind"
                  className="mb-1 block text-xs text-gray-500 dark:text-gray-400"
                >
                  Kind
                </label>
                <select
                  id="add-kind"
                  value={addKind}
                  onChange={(e) => setAddKind(e.target.value as QuestionKind)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-black dark:text-white"
                >
                  {KIND_ORDER.map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="add-difficulty"
                  className="mb-1 block text-xs text-gray-500 dark:text-gray-400"
                >
                  Difficulty
                </label>
                <select
                  id="add-difficulty"
                  value={addDifficulty}
                  onChange={(e) =>
                    setAddDifficulty(e.target.value as QuestionDifficulty)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-black dark:text-white"
                >
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              value={addText}
              onChange={(e) => setAddText(e.target.value)}
              rows={3}
              placeholder="Question text"
              aria-label="New question text"
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-black dark:text-white"
            />

            {addKind === "mcq" && (
              <textarea
                value={addOptions}
                onChange={(e) => setAddOptions(e.target.value)}
                rows={3}
                placeholder="Options (one per line)"
                aria-label="Options"
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-black dark:text-white"
              />
            )}

            {(addKind === "mcq" || addKind === "aptitude") && (
              <input
                type="text"
                value={addAnswer}
                onChange={(e) => setAddAnswer(e.target.value)}
                placeholder="Answer"
                aria-label="Answer"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-black dark:text-white"
              />
            )}

            {addKind === "coding" && (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={addLanguage}
                  onChange={(e) => setAddLanguage(e.target.value)}
                  placeholder="Language (e.g. Python)"
                  aria-label="Language"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-black dark:text-white"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Test cases (at least three, with at least one hidden)
                </span>
                {addTestCases.map((tc, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={tc.input}
                      onChange={(e) => updateTestCase(i, "input", e.target.value)}
                      placeholder="Input"
                      aria-label={`Test case ${i + 1} input`}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-black dark:text-white"
                    />
                    <input
                      type="text"
                      value={tc.expectedOutput}
                      onChange={(e) =>
                        updateTestCase(i, "expectedOutput", e.target.value)
                      }
                      placeholder="Expected output"
                      aria-label={`Test case ${i + 1} expected output`}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-black dark:text-white"
                    />
                    <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <input
                        type="checkbox"
                        checked={tc.hidden}
                        onChange={(e) =>
                          updateTestCase(i, "hidden", e.target.checked)
                        }
                      />
                      hidden
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setAddTestCases((prev) => [
                      ...prev,
                      { input: "", expectedOutput: "", hidden: false },
                    ])
                  }
                  className="self-start text-xs font-medium text-[var(--color-primary)] hover:underline dark:text-white"
                >
                  + Add test case
                </button>
              </div>
            )}

            {skillOptions.length > 0 && (
              <div>
                <label
                  htmlFor="add-skilltag"
                  className="mb-1 block text-xs text-gray-500 dark:text-gray-400"
                >
                  Skill tag (optional)
                </label>
                <select
                  id="add-skilltag"
                  value={addSkillTag}
                  onChange={(e) => setAddSkillTag(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-black dark:text-white"
                >
                  <option value="">None</option>
                  {skillOptions.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {addError && (
              <p
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {addError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
              >
                {adding && (
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent"
                  />
                )}
                Add Question
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAddForm();
                  setShowAdd(false);
                }}
                disabled={adding}
                className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium disabled:opacity-60 dark:border-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onProceed}
          disabled={questions.length === 0}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
        >
          Continue to Save
        </button>
      </div>
    </div>
  );
};

export default QuestionReviewStep;
