import { FC } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionCardProps {
  question: string;
  answer: string;
  yourAnswer: string;
}

const QuestionCard: FC<QuestionCardProps> = ({ question, answer, yourAnswer }) => {
  const isCorrect = yourAnswer === answer;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors">
      {/* Header: question + status badge */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h4 className="text-base font-semibold leading-relaxed text-[var(--color-dark-bg)] dark:text-white">
          {question}
        </h4>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isCorrect
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          {isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>

      {/* Answers */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Your Answer
          </span>
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              isCorrect
                ? "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-300"
                : "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{yourAnswer || "Not answered"}</span>
          </div>
        </div>

        {!isCorrect && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Correct Answer
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 text-sm text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{answer}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
