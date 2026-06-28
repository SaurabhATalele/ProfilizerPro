"use client";
import { FC } from "react";
import { Link as LinkIcon } from "lucide-react";
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
 * The content-pane header: breadcrumb, title, and a Copy Link action.
 */
const PageHeader: FC<PageHeaderProps> = ({ title, breadcrumb }) => {
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

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-gray-500 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <LinkIcon className="h-4 w-4" /> Copy Link
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
        {title}
      </h1>
    </div>
  );
};

export default PageHeader;
