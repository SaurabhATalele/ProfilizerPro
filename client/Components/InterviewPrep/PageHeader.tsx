"use client";
import { FC, useState } from "react";
import { Eye, Heart, Link as LinkIcon } from "lucide-react";
import { toggleLike } from "@/Utils/Apicalls/InterviewPrep";
import Toast from "@/Utils/Toast";
import type { PageBreadcrumb } from "@/Utils/types/InterviewPrep";

interface PageHeaderProps {
  pageId: string;
  title: string;
  breadcrumb: PageBreadcrumb;
  viewCount: number;
  initialLiked: boolean;
  initialLikeCount: number;
}

/**
 * The content-pane header row: back-to-dashboard link, breadcrumb, read-only
 * view counter, a toggleable like button with aggregate count, and a Copy Link
 * action. The like toggle is optimistic and rolls back on failure.
 */
const PageHeader: FC<PageHeaderProps> = ({
  pageId,
  title,
  breadcrumb,
  viewCount,
  initialLiked,
  initialLikeCount,
}) => {
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  const [busy, setBusy] = useState<boolean>(false);

  const handleLike = async (): Promise<void> => {
    if (busy) return;
    setBusy(true);

    // Optimistic update.
    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !prevLiked;
    setLiked(nextLiked);
    setLikeCount(prevCount + (nextLiked ? 1 : -1));

    try {
      const resp = await toggleLike(pageId);
      if (!resp || !resp.ok) throw new Error("like failed");
      const data: { liked: boolean; likeCount: number } = await resp.json();
      // Reconcile with the server's authoritative values.
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      // Roll back on failure.
      setLiked(prevLiked);
      setLikeCount(prevCount);
      Toast("error", "Couldn't update like. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      Toast("success", "Link copied to clipboard.");
    } catch {
      Toast("error", "Couldn't copy the link.");
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-gray-500 dark:text-gray-400"
        >
          <span>{breadcrumb.subjectLabel}</span>
          <span className="mx-1.5">/</span>
          <span>{breadcrumb.chapterTitle}</span>
          <span className="mx-1.5">/</span>
          <span className="text-gray-700 dark:text-gray-200">{title}</span>
        </nav>

        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
            title="Views"
          >
            <Eye className="h-4 w-4" /> {viewCount}
          </span>

          <button
            type="button"
            onClick={handleLike}
            disabled={busy}
            aria-pressed={liked}
            aria-label={liked ? "Unlike" : "Like"}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-gray-500 transition-colors duration-200 hover:bg-gray-100 disabled:opacity-60 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Heart
              className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
            {likeCount}
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-gray-500 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <LinkIcon className="h-4 w-4" /> Copy Link
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
        {title}
      </h1>
    </div>
  );
};

export default PageHeader;
