"use client";
import { FC, useEffect, useState } from "react";
import { getPageBySlug } from "@/Utils/Apicalls/InterviewPrep";
import type { PageDetailResponse } from "@/Utils/types/InterviewPrep";
import PageHeader from "./PageHeader";
import PageContent from "./PageContent";
import ProgressIndicator from "./ProgressIndicator";

interface PageReaderProps {
  /** Statically rendered (ISR) page detail — content shows with no DB fetch. */
  initialPage: PageDetailResponse;
}

/**
 * Reader for a single note. The content, title, breadcrumb, and aggregate
 * counts come from the statically generated page (no client fetch to display).
 * If the visitor is signed in, a background call registers a view and layers
 * in their personal like/progress state without blocking the content.
 */
const PageReader: FC<PageReaderProps> = ({ initialPage }) => {
  const [page, setPage] = useState<PageDetailResponse>(initialPage);
  // Bumped once personalization lands so the like/progress controls remount
  // with the user's actual state instead of the static defaults.
  const [personalizedKey, setPersonalizedKey] = useState<string>("static");

  // Re-sync when navigating between notes (new static props).
  useEffect(() => {
    setPage(initialPage);
    setPersonalizedKey("static");
  }, [initialPage]);

  // Background personalization: increment the view count and read the user's
  // like/progress. Skipped entirely for signed-out visitors.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("token")) return;

    let cancelled = false;
    const personalize = async (): Promise<void> => {
      const resp = await getPageBySlug(initialPage.slug);
      if (cancelled || !resp || !resp.ok) return;
      const data: PageDetailResponse = await resp.json();
      if (cancelled) return;
      setPage(data);
      setPersonalizedKey(`p-${data._id}`);
    };
    personalize();
    return () => {
      cancelled = true;
    };
  }, [initialPage.slug]);

  return (
    <article>
      <PageHeader
        key={`header-${personalizedKey}`}
        pageId={page._id}
        title={page.title}
        breadcrumb={page.breadcrumb}
        viewCount={page.viewCount}
        initialLiked={page.liked}
        initialLikeCount={page.likeCount}
      />
      <ProgressIndicator
        key={`progress-${personalizedKey}`}
        pageId={page._id}
        initialStatus={page.progressStatus}
      />
      <PageContent content={page.content} />
    </article>
  );
};

export default PageReader;
