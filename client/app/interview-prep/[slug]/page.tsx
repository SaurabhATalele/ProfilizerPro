"use client";
import { FC } from "react";
import { useParams } from "next/navigation";
import InterviewDeskLayout from "@/Components/InterviewPrep/InterviewDeskLayout";
import PageReader from "@/Components/InterviewPrep/PageReader";

/**
 * Reader route for a single note. The desk shell (sidebar tree) wraps the
 * reader; the global app Navbar sits above it (no feature-specific navbar).
 */
const Page: FC = () => {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  if (!slug) return null;
  return (
    <InterviewDeskLayout>
      <PageReader slug={slug} />
    </InterviewDeskLayout>
  );
};

export default Page;
