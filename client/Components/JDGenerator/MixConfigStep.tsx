"use client";
import { FC, useState } from "react";
import { generateQuestions } from "@/Utils/Apicalls/JDGenerator";
import type {
  ParsedSignal,
  GeneratedQuestion,
  Mix,
  TargetDifficulty,
} from "@/Utils/types/JDGenerator";
import Toast from "@/Utils/Toast";

const DIFFICULTY_OPTIONS: TargetDifficulty[] = [
  "easy",
  "medium",
  "hard",
  "mixed",
];

interface MixConfigStepProps {
  jobDescriptionId: string;
  confirmedSignal: ParsedSignal;
  /** Emit generated questions + shortfall and advance the wizard. */
  onGenerated: (
    setId: string,
    questions: GeneratedQuestion[],
    shortfall: Mix,
  ) => void;
  onBack: () => void;
}

type CountKey = keyof Mix;

const COUNT_FIELDS: { key: CountKey; label: string }[] = [
  { key: "mcq", label: "MCQ" },
  { key: "coding", label: "Coding" },
  { key: "aptitude", label: "Aptitude" },
];

/**
 * Step 3 — choose per-kind counts, a target difficulty and optional preferred
 * languages, then call `generateQuestions`. Owns its own loading / error state
 * for the generation action (Req 10.1, 10.2).
 */
const MixConfigStep: FC<MixConfigStepProps> = ({
  jobDescriptionId,
  confirmedSignal,
  onGenerated,
  onBack,
}) => {
  const [mix, setMix] = useState<Mix>({ mcq: 5, coding: 2, aptitude: 3 });
  const [difficulty, setDifficulty] = useState<TargetDifficulty>("mixed");
  const [languages, setLanguages] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const total = mix.mcq + mix.coding + mix.aptitude;

  const updateCount = (key: CountKey, value: string): void => {
    const parsed = Number.parseInt(value, 10);
    const safe = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setMix((prev) => ({ ...prev, [key]: safe }));
  };

  const handleGenerate = async (): Promise<void> => {
    setError("");

    if (total === 0) {
      setError("Request at least one question.");
      return;
    }

    const preferredLanguages = languages
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      const resp = await generateQuestions({
        jobDescriptionId,
        confirmedSignal,
        mix,
        difficulty,
        preferredLanguages:
          preferredLanguages.length > 0 ? preferredLanguages : undefined,
      });
      const data: {
        generatedQuestionSetId?: string;
        questions?: GeneratedQuestion[];
        shortfall?: Mix;
        error?: string;
      } = await resp.json();

      if (
        !resp.ok ||
        !data.generatedQuestionSetId ||
        !Array.isArray(data.questions)
      ) {
        const message =
          data.error === "generation_failed"
            ? "Generation failed after retrying. Adjust the inputs and try again."
            : "Generation failed. Please try again.";
        setError(message);
        Toast("error", message);
        return;
      }

      const shortfall: Mix = data.shortfall ?? { mcq: 0, coding: 0, aptitude: 0 };
      Toast("success", "Questions generated.");
      onGenerated(data.generatedQuestionSetId, data.questions, shortfall);
    } catch {
      const message = "Network error while generating. Please try again.";
      setError(message);
      Toast("error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="mb-2 block text-sm font-medium">
          Question counts by kind
        </span>
        <div className="grid grid-cols-3 gap-3">
          {COUNT_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label
                htmlFor={`count-${key}`}
                className="mb-1 block text-xs text-gray-500 dark:text-gray-400"
              >
                {label}
              </label>
              <input
                id={`count-${key}`}
                type="number"
                min={0}
                value={mix[key]}
                onChange={(e) => updateCount(key, e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition-all duration-300 focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white"
              />
            </div>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Total requested: {total}
        </p>
      </div>

      <div>
        <label htmlFor="difficulty" className="mb-2 block text-sm font-medium">
          Target difficulty
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as TargetDifficulty)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition-all duration-300 focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white"
        >
          {DIFFICULTY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="languages" className="mb-2 block text-sm font-medium">
          Preferred languages{" "}
          <span className="text-gray-500 dark:text-gray-400">
            (optional, comma-separated)
          </span>
        </label>
        <input
          id="languages"
          type="text"
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          placeholder="e.g. JavaScript, Python"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition-all duration-300 focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium transition-all duration-300 hover:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {loading && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent"
            />
          )}
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </div>
    </div>
  );
};

export default MixConfigStep;
