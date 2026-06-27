"use client";
import { FC, useEffect, useState } from "react";
import { getPageBySlug } from "@/Utils/Apicalls/InterviewPrep";
import type { PageDetailResponse } from "@/Utils/types/InterviewPrep";
import PageHeader from "./PageHeader";
import PageContent from "./PageContent";
import ProgressIndicator from "./ProgressIndicator";

interface PageReaderProps {
  slug: string;
}

/**
 * Reader surface for a single note. Fetches the page detail by slug (which also
 * increments the view count server-side), then renders the header, progress
 * control, and markdown body. Shows a skeleton while loading and a friendly
 * not-found state for missing/unauthorized slugs.
 */
const PageReader: FC<PageReaderProps> = ({ slug }) => {
  const [page, setPage] = useState<PageDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      setLoading(true);
      setNotFound(false);
      const resp = await getPageBySlug(slug);
      if (cancelled) return;
      if (!resp || !resp.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data: PageDetailResponse = await resp.json();
      setPage(data);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-6 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-9 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold">Note not found</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This note doesn&apos;t exist or isn&apos;t available. Pick another from
          the sidebar.
        </p>
      </div>
    );
  }

  return (
    <article>
      <PageHeader
        pageId={page._id}
        title={page.title}
        breadcrumb={page.breadcrumb}
        viewCount={page.viewCount}
        initialLiked={page.liked}
        initialLikeCount={page.likeCount}
      />
      <ProgressIndicator
        pageId={page._id}
        initialStatus={page.progressStatus}
      />
      <PageContent content={page.content} />
    </article>
  );
};

export default PageReader;
