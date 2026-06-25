"use client";
import { FC, useState, ChangeEvent } from "react";
import { parseJD } from "@/Utils/Apicalls/JDGenerator";
import type { ParsedSignal } from "@/Utils/types/JDGenerator";
import Toast from "@/Utils/Toast";

/** Lower bound on JD length below which the server rejects input (Req 2.5). */
const MINIMUM_JD_WORDS = 50;

const SUPPORTED_EXTENSIONS = [".txt", ".pdf", ".docx"];

interface JDInputStepProps {
  /** Called once parsing succeeds, advancing the wizard. */
  onParsed: (jobDescriptionId: string, parsed: ParsedSignal) => void;
}

/** Human-readable messages for the typed parse errors the server may return. */
const PARSE_ERROR_MESSAGES: Record<string, string> = {
  too_short: `The job description is too short. Please provide at least ${MINIMUM_JD_WORDS} words.`,
  unsupported_file: "That file type is not supported. Upload a .txt, .pdf, or .docx file.",
  parse_failed:
    "We couldn't parse this job description. Try cleaning up the text and parsing again.",
  not_a_job_description:
    "This doesn't look like a job description. Paste a real JD to continue.",
};

const countWords = (value: string): number => {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

/**
 * Step 1 — paste JD text or upload a supported file. Shows a client-side length
 * hint (warns under 50 words) and calls `parseJD`. Owns its own loading and
 * error state for the parse action (Req 10.1, 10.2).
 */
const JDInputStep: FC<JDInputStepProps> = ({ onParsed }) => {
  const [text, setText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const wordCount = countWords(text);
  const belowMinimum = wordCount > 0 && wordCount < MINIMUM_JD_WORDS;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleParse = async (): Promise<void> => {
    setError("");

    if (!text.trim() && !file) {
      setError("Paste a job description or upload a file to continue.");
      return;
    }

    // Client-side length hint only blocks when there is no file to fall back on.
    if (!file && belowMinimum) {
      setError(PARSE_ERROR_MESSAGES.too_short);
      return;
    }

    setLoading(true);
    try {
      const resp = await parseJD({
        text: text.trim() ? text : undefined,
        file: file ?? undefined,
      });
      const data: {
        jobDescriptionId?: string;
        parsed?: ParsedSignal;
        error?: string;
      } = await resp.json();

      if (!resp.ok || !data.jobDescriptionId || !data.parsed) {
        const message =
          (data.error && PARSE_ERROR_MESSAGES[data.error]) ||
          "Parsing failed. Please try again.";
        setError(message);
        Toast("error", message);
        return;
      }

      Toast("success", "Job description parsed.");
      onParsed(data.jobDescriptionId, data.parsed);
    } catch {
      const message = "Network error while parsing. Please try again.";
      setError(message);
      Toast("error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label
          htmlFor="jd-text"
          className="mb-2 block text-sm font-medium"
        >
          Paste the job description
        </label>
        <textarea
          id="jd-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Paste the full job description here..."
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition-all duration-300 focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white"
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span
            className={
              belowMinimum
                ? "text-amber-600 dark:text-amber-400"
                : "text-gray-500 dark:text-gray-400"
            }
          >
            {wordCount} word{wordCount === 1 ? "" : "s"}
            {belowMinimum &&
              ` — aim for at least ${MINIMUM_JD_WORDS} words for a good parse`}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="jd-file" className="mb-2 block text-sm font-medium">
          Or upload a file{" "}
          <span className="text-gray-500 dark:text-gray-400">
            ({SUPPORTED_EXTENSIONS.join(", ")})
          </span>
        </label>
        <input
          id="jd-file"
          type="file"
          accept={SUPPORTED_EXTENSIONS.join(",")}
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:text-gray-400 dark:file:bg-white dark:file:text-black"
        />
        {file && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Selected: {file.name}
          </p>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleParse}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {loading && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent"
            />
          )}
          {loading ? "Parsing..." : "Parse Job Description"}
        </button>
      </div>
    </div>
  );
};

export default JDInputStep;
