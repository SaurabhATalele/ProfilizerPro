import { notFound } from "next/navigation";
import { getNavTree } from "@/Utils/api/Controllers/SubjectController";
import {
  getStaticPageBySlug,
  getPublishedSlugs,
} from "@/Utils/api/Controllers/PageController";
import InterviewReader from "@/Components/InterviewPrep/InterviewReader";
import type {
  NavTreeSubject,
  PageDetailResponse,
} from "@/Utils/types/InterviewPrep";

// ISR: each published note is statically generated and revalidated once a day.
// Content, breadcrumb, and aggregate counts are baked in — no DB fetch to
// display. `dynamicParams` lets notes published after build render on demand
// and then cache.
export const revalidate = 86400; // 1 day, in seconds
export const dynamicParams = true;

/** Prerender every published note's slug at build time. */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const slugs = await getPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    // DB unreachable at build — fall back to on-demand ISR generation.
    console.error("interview-prep generateStaticParams:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Reader route for a single note. Statically generated via ISR: the published
 * page detail + nav tree are read server-side and passed to the client shell.
 */
const Page = async ({ params }: PageProps) => {
  const { slug } = await params;

  const [tree, page] = await Promise.all([
    getNavTree(false),
    getStaticPageBySlug(slug),
  ]);

  if (!page) notFound();

  const subjects = JSON.parse(
    JSON.stringify(tree.subjects),
  ) as NavTreeSubject[];
  const initialPage = JSON.parse(JSON.stringify(page)) as PageDetailResponse;

  return (
    <InterviewReader
      subjects={subjects}
      totalPages={tree.totalPages}
      initialPage={initialPage}
    />
  );
};

export default Page;
