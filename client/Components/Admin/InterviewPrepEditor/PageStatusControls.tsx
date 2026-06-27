"use client";
import { FC, useState } from "react";
import { setPageStatus } from "@/Utils/Apicalls/InterviewPrep";
import Toast from "@/Utils/Toast";
import type { PageStatus } from "@/Utils/types/InterviewPrep";

interface PageStatusControlsProps {
  pageId: string;
  status: PageStatus;
  /** Whether the page has likes/progress against it (drives archive confirm). */
  hasEngagement?: boolean;
  onChanged: (status: PageStatus) => void;
}

const BADGE: Record<PageStatus, string> = {
  draft: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  published:
    "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  archived: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

/**
 * Publish / unpublish / archive controls for a page. Archiving asks for
 * confirmation first (it hides the page from readers) — but never destroys the
 * likes/progress recorded against it.
 */
const PageStatusControls: FC<PageStatusControlsProps> = ({
  pageId,
  status,
  hasEngagement,
  onChanged,
}) => {
  const [busy, setBusy] = useState<boolean>(false);

  const apply = async (next: PageStatus): Promise<void> => {
    if (next === "archived") {
      const msg = hasEngagement
        ? "This page has reader likes/progress. Archiving hides it from readers but keeps those records. Continue?"
        : "Archive this page? It will be hidden from readers.";
      if (!window.confirm(msg)) return;
    }
    setBusy(true);
    try {
      const resp = await setPageStatus(pageId, next);
      if (!resp || !resp.ok) throw new Error("status failed");
      onChanged(next);
      Toast("success", `Page ${next}.`);
    } catch {
      Toast("error", "Couldn't change status.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[status]}`}
      >
        {status}
      </span>

      {status !== "published" && (
        <button
          type="button"
          onClick={() => apply("published")}
          disabled={busy}
          className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
        >
          Publish
        </button>
      )}
      {status === "published" && (
        <button
          type="button"
          onClick={() => apply("draft")}
          disabled={busy}
          className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium disabled:opacity-60 dark:border-gray-700"
        >
          Unpublish
        </button>
      )}
      {status !== "archived" && (
        <button
          type="button"
          onClick={() => apply("archived")}
          disabled={busy}
          className="rounded-lg border border-amber-400 px-3 py-1 text-xs font-medium text-amber-700 disabled:opacity-60 dark:text-amber-400"
        >
          Archive
        </button>
      )}
    </div>
  );
};

export default PageStatusControls;
