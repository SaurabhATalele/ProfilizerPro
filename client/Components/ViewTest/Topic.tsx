"use client";
import { FC, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";

interface TopicProps {
  name: string;
  minQuestions: number;
  maxQuestions: number;
  setSelectedTopics: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const Topic: FC<TopicProps> = ({ name, minQuestions, maxQuestions, setSelectedTopics }) => {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [questions, setQuestions] = useState<number>(minQuestions);

  const toggleSelected = (): void => {
    if (isSelected) {
      setIsSelected(false);
      setSelectedTopics((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    } else {
      setIsSelected(true);
      setSelectedTopics((prev) => ({ ...prev, [name]: String(questions) }));
    }
  };

  const updateCount = (next: number): void => {
    const clamped = Math.min(maxQuestions, Math.max(minQuestions, next));
    setQuestions(clamped);
    setSelectedTopics((prev) => ({ ...prev, [name]: String(clamped) }));
  };

  return (
    <li
      className={`rounded-xl border transition-all duration-200 ${
        isSelected
          ? "border-[var(--color-primary)] dark:border-[var(--color-secondary)] bg-[var(--color-primary)]/5 dark:bg-[var(--color-secondary)]/10"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/40"
      }`}
    >
      {/* Selection row */}
      <button
        type="button"
        onClick={toggleSelected}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        aria-pressed={isSelected}
      >
        <span
          className={`flex items-center justify-center w-5 h-5 rounded-md border-2 transition-all duration-200 shrink-0 ${
            isSelected
              ? "bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] border-[var(--color-primary)] dark:border-[var(--color-secondary)]"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
        </span>
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
          {name}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {minQuestions}–{maxQuestions} Qs
        </span>
      </button>

      {/* Question count stepper */}
      {isSelected && (
        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Number of questions
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateCount(questions - 1)}
              disabled={questions <= minQuestions}
              className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease questions"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-[var(--color-primary)] dark:text-[var(--color-secondary)]">
              {questions}
            </span>
            <button
              type="button"
              onClick={() => updateCount(questions + 1)}
              disabled={questions >= maxQuestions}
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

export default Topic;
