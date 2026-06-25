"use client";
import { FC, useState } from "react";
import Link from "next/link";
import { approveAsTest } from "@/Utils/Apicalls/JDGenerator";
import Toast from "@/Utils/Toast";

interface SaveTestStepProps {
  setId: string;
  onBack: () => void;
}

/**
 * Step 5 — collect the Test metadata (title, duration, passing score) and call
 * `approveAsTest`. Owns its own loading / error state for the approve action
 * and shows the created testId on success (Req 10.1, 10.2).
 */
const SaveTestStep: FC<SaveTestStepProps> = ({ setId, onBack }) => {
  const [title, setTitle] = useState<string>("");
  const [duration, setDuration] = useState<number>(30);
  const [passingScore, setPassingScore] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [testId, setTestId] = useState<string | null>(null);

  const handleApprove = async (): Promise<void> => {
    setError("");

    if (!title.trim()) {
      setError("Give the test a title.");
      return;
    }
    if (duration <= 0) {
      setError("Duration must be greater than zero.");
      return;
    }
    if (passingScore < 0 || passingScore > 100) {
      setError("Passing score must be between 0 and 100.");
      return;
    }

    setLoading(true);
    try {
      const resp = await approveAsTest({
        generatedQuestionSetId: setId,
        title: title.trim(),
        duration,
        passingScore,
      });
      const data: { testId?: string; error?: string } = await resp.json();

      if (!resp.ok || !data.testId) {
        const message =
          data.error === "invalid_score"
            ? "Passing score must be between 0 and 100."
            : "Couldn't save the test. Please try again.";
        setError(message);
        Toast("error", message);
        return;
      }

      setTestId(data.testId);
      Toast("success", "Test created.");
    } catch {
      const message = "Network error while saving. Please try again.";
      setError(message);
      Toast("error", message);
    } finally {
      setLoading(false);
    }
  };

  if (testId) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-8 text-center dark:border-green-900 dark:bg-green-950/30">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-2xl text-white">
          ✓
        </div>
        <h2 className="text-lg font-semibold">Test created</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your approved set is now a live test (ID:{" "}
          <span className="font-mono">{testId}</span>) and is usable in the
          existing test-attempt flow.
        </p>
        <Link
          href={`/test/${testId}`}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg dark:bg-white dark:text-black"
        >
          View Test
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label htmlFor="test-title" className="mb-2 block text-sm font-medium">
          Test title
        </label>
        <input
          id="test-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Backend Engineer Screen"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition-all duration-300 focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="test-duration"
            className="mb-2 block text-sm font-medium"
          >
            Duration (minutes)
          </label>
          <input
            id="test-duration"
            type="number"
            min={1}
            value={duration}
            onChange={(e) =>
              setDuration(Number.parseInt(e.target.value, 10) || 0)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition-all duration-300 focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="test-passing"
            className="mb-2 block text-sm font-medium"
          >
            Passing score (0–100)
          </label>
          <input
            id="test-passing"
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) =>
              setPassingScore(Number.parseInt(e.target.value, 10) || 0)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition-all duration-300 focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white"
          />
        </div>
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
          onClick={handleApprove}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {loading && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent"
            />
          )}
          {loading ? "Saving..." : "Approve & Save as Test"}
        </button>
      </div>
    </div>
  );
};

export default SaveTestStep;
