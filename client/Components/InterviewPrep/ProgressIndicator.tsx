"use client";
import { FC, useState } from "react";
import { updatePageProgress } from "@/Utils/Apicalls/InterviewPrep";
import Toast from "@/Utils/Toast";
import type { ProgressStatus } from "@/Utils/types/InterviewPrep";

interface ProgressIndicatorProps {
  pageId: string;
  initialStatus: ProgressStatus;
}

const OPTIONS: { value: ProgressStatus; label: string }[] = [
  { value: "not-started", label: "Not started" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

/**
 * A low-emphasis per-page progress control (not-started / in-progress /
 * completed). Kept visually minor so it doesn't compete with the header row.
 * Updates optimistically and rolls back on failure.
 */
const ProgressIndicator: FC<ProgressIndicatorProps> = ({
  pageId,
  initialStatus,
}) => {
  const [status, setStatus] = useState<ProgressStatus>(initialStatus);
  const [busy, setBusy] = useState<boolean>(false);

  const handleChange = async (next: ProgressStatus): Promise<void> => {
    const prev = status;
    setStatus(next);
    setBusy(true);
    try {
      const resp = await updatePageProgress(pageId, { status: next });
      if (!resp || !resp.ok) throw new Error("progress failed");
    } catch {
      setStatus(prev);
      Toast("error", "Couldn't update progress.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6 flex items-center gap-2 text-xs">
      <span className="text-gray-400 dark:text-gray-500">Progress</span>
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as ProgressStatus)}
        disabled={busy}
        aria-label="Reading progress"
        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 outline-none transition-colors focus:border-[var(--color-primary)] disabled:opacity-60 dark:border-gray-700 dark:bg-[#121212] dark:text-gray-300"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProgressIndicator;
