"use client";
import { FC, useState } from "react";
import {
  editQuestion,
  deleteQuestion,
  regenerateQuestion,
} from "@/Utils/Apicalls/JDGenerator";
import type {
  GeneratedQuestion,
  GeneratedQuestionSet,
} from "@/Utils/types/JDGenerator";
import Toast from "@/Utils/Toast";

interface QuestionCardProps {
  setId: string;
  question: GeneratedQuestion;
  /** Index of this question within the full set (server operates by index). */
  index: number;
  /** Replace the whole working question list with the server's updated set. */
  onSetUpdated: (questions: GeneratedQuestion[]) => void;
}

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

type PendingAction = "edit" | "delete" | "regenerate" | null;

/**
 * A single reviewable question. Shows difficulty + skillTag badges and exposes
 * edit / delete / regenerate controls. Each action has its own loading
 * indicator and inline error message (Req 7.1, 10.1, 10.2).
 */
const QuestionCard: FC<QuestionCardProps> = ({
  setId,
  question,
  index,
  onSetUpdated,
}) => {
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);
  const [draftText, setDraftText] = useState<string>(question.text);
  const [draftAnswer, setDraftAnswer] = useState<string>(question.answer ?? "");

  // The set-mutation routes may return either a wrapped `{ set }` body or the
  // updated set directly; accept either shape.
  const applyUpdatedSet = (
    data: { set?: GeneratedQuestionSet; questions?: GeneratedQuestion[] },
  ): boolean => {
    if (data.set && Array.isArray(data.set.questions)) {
      onSetUpdated(data.set.questions);
      return true;
    }
    if (Array.isArray(data.questions)) {
      onSetUpdated(data.questions);
      return true;
    }
    return false;
  };

  const handleSaveEdit = async (): Promise<void> => {
    setError("");
    if (!draftText.trim()) {
      setError("Question text cannot be empty.");
      return;
    }
    const updated: GeneratedQuestion = {
      ...question,
      text: draftText.trim(),
      answer: question.answer !== undefined ? draftAnswer : question.answer,
      edited: true,
    };

    setPending("edit");
    try {
      const resp = await editQuestion(setId, index, updated);
      const data: {
        set?: GeneratedQuestionSet;
        questions?: GeneratedQuestion[];
        error?: string;
      } = await resp.json();
      if (!resp.ok || !applyUpdatedSet(data)) {
        const message = "Couldn't save the edit. Please try again.";
        setError(message);
        Toast("error", message);
        return;
      }
      Toast("success", "Question updated.");
      setEditing(false);
    } catch {
      const message = "Network error while saving. Please try again.";
      setError(message);
      Toast("error", message);
    } finally {
      setPending(null);
    }
  };

  const handleDelete = async (): Promise<void> => {
    setError("");
    setPending("delete");
    try {
      const resp = await deleteQuestion(setId, index);
      const data: {
        set?: GeneratedQuestionSet;
        questions?: GeneratedQuestion[];
        error?: string;
      } = await resp.json();
      if (!resp.ok || !applyUpdatedSet(data)) {
        const message = "Couldn't delete the question. Please try again.";
        setError(message);
        Toast("error", message);
        return;
      }
      Toast("success", "Question deleted.");
    } catch {
      const message = "Network error while deleting. Please try again.";
      setError(message);
      Toast("error", message);
    } finally {
      setPending(null);
    }
  };

  const handleRegenerate = async (): Promise<void> => {
    setError("");
    setPending("regenerate");
    try {
      const resp = await regenerateQuestion({
        generatedQuestionSetId: setId,
        index,
      });
      const data: {
        set?: GeneratedQuestionSet;
        questions?: GeneratedQuestion[];
        error?: string;
      } = await resp.json();
      if (!resp.ok || !applyUpdatedSet(data)) {
        const message =
          data.error === "rate_limited"
            ? "Please wait before regenerating again."
            : "Couldn't regenerate the question. Please try again.";
        setError(message);
        Toast("error", message);
        return;
      }
      Toast("success", "Question regenerated.");
    } catch {
      const message = "Network error while regenerating. Please try again.";
      setError(message);
      Toast("error", message);
    } finally {
      setPending(null);
    }
  };

  const busy = pending !== null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-300 dark:border-gray-800 dark:bg-[#121212]">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            DIFFICULTY_BADGE[question.difficulty] ??
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {question.difficulty}
        </span>
        {question.skillTag && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            {question.skillTag}
          </span>
        )}
        {question.language && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
            {question.language}
          </span>
        )}
        {question.edited && (
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            edited
          </span>
        )}
        {question.manuallyAdded && (
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            added
          </span>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={3}
            aria-label="Question text"
            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-black dark:text-white"
          />
          {question.answer !== undefined && (
            <input
              type="text"
              value={draftAnswer}
              onChange={(e) => setDraftAnswer(e.target.value)}
              aria-label="Answer"
              placeholder="Answer"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-black dark:text-white"
            />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {pending === "edit" && (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent"
                />
              )}
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setDraftText(question.text);
                setDraftAnswer(question.answer ?? "");
                setError("");
              }}
              disabled={busy}
              className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium disabled:opacity-60 dark:border-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm">{question.text}</p>

          {Array.isArray(question.options) && question.options.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
              {question.options.map((option, i) => (
                <li key={i}>{option}</li>
              ))}
            </ul>
          )}

          {question.answer && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Answer: {question.answer}
            </p>
          )}

          {Array.isArray(question.testCases) &&
            question.testCases.length > 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {question.testCases.length} test case
                {question.testCases.length === 1 ? "" : "s"} (
                {question.testCases.filter((t) => t.hidden).length} hidden)
              </p>
            )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={busy}
              className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium transition-all duration-300 hover:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium transition-all duration-300 hover:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {pending === "regenerate" && (
                <span
                  aria-hidden="true"
                  className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
              )}
              Regenerate
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600 transition-all duration-300 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              {pending === "delete" && (
                <span
                  aria-hidden="true"
                  className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
              )}
              Delete
            </button>
          </div>
        </>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default QuestionCard;
