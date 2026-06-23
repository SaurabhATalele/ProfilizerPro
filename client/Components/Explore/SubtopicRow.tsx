"use client";
import { FC } from "react";
import { Check, Minus, Plus } from "lucide-react";

interface SubtopicRowProps {
  name: string;
  selected: boolean;
  questionCount: number;
  source: "ai" | "custom";
  minQuestions: number;
  maxQuestions: number;
  onToggle: (name: string) => void;
  onCountChange: (name: string, next: number) => void;
}

const SubtopicRow: FC<SubtopicRowProps> = ({
  name,
  selected,
  questionCount,
  source,
  minQuestions,
  maxQuestions,
  onToggle,
  onCountChange,
}) => {
  const isAi = source === "ai";

  return (
    <li
      className={`rounded-xl border transition-all duration-200 ${
        selected
          ? "border-[var(--color-primary)] dark:border-[var(--color-secondary)] bg-[var(--color-primary)]/5 dark:bg-[var(--color-secondary)]/10"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/40"
      }`}
    >
      {/* Selection row */}
      <button
        type="button"
        onClick={() => onToggle(name)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        aria-pressed={selected}
      >
        <span
          className={`flex items-center justify-center w-5 h-5 rounded-md border-2 transition-all duration-200 shrink-0 ${
            selected
              ? "bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] border-[var(--color-primary)] dark:border-[var(--color-secondary)]"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {selected && <Check className="w-3.5 h-3.5 text-white" />}
        </span>
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
          {name}
        </span>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
            isAi
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:bg-[var(--color-secondary)]/15 dark:text-[var(--color-secondary)]"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {isAi ? "AI" : "Custom"}
        </span>
      </button>

      {/* Question count stepper */}
      {selected && (
        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Number of questions
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onCountChange(name, questionCount - 1)}
              disabled={questionCount <= minQuestions}
              className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease questions"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-[var(--color-primary)] dark:text-[var(--color-secondary)]">
              {questionCount}
            </span>
            <button
              type="button"
              onClick={() => onCountChange(name, questionCount + 1)}
              disabled={questionCount >= maxQuestions}
              className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase questions"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default SubtopicRow;
