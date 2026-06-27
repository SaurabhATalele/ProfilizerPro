"use client";
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getNavTree } from "@/Utils/Apicalls/InterviewPrep";
import type { NavTreeSubject } from "@/Utils/types/InterviewPrep";
import SubjectIcon from "./SubjectIcon";

/** First published page slug in a subject, or null if it has none yet. */
const firstPageSlug = (subject: NavTreeSubject): string | null => {
  for (const chapter of subject.chapters) {
    if (chapter.pages.length > 0) return chapter.pages[0].slug;
  }
  return null;
};

/** Count published pages in a subject (for the tile subtitle). */
const pageCount = (subject: NavTreeSubject): number =>
  subject.chapters.reduce((sum, c) => sum + c.pages.length, 0);

/**
 * Interview Prep home — a tile grid of subjects (the wireframe view). Clicking
 * a subject opens its first note. Rendered under the global app Navbar.
 */
const SubjectGrid: FC = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<NavTreeSubject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true);
      const resp = await getNavTree();
      if (resp && resp.ok) {
        const data: { subjects: NavTreeSubject[] } = await resp.json();
        setSubjects(data.subjects ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const openSubject = (subject: NavTreeSubject): void => {
    const slug = firstPageSlug(subject);
    if (slug) router.push(`/interview-prep/${slug}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Welcome Back
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Select a subject to start studying.
      </p>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          No subjects are available yet. Check back soon.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const count = pageCount(subject);
            const hasNotes = count > 0;
            return (
              <button
                key={subject._id}
                type="button"
                onClick={() => openSubject(subject)}
                disabled={!hasNotes}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-gray-200 disabled:hover:shadow-none dark:border-gray-800 dark:bg-[#121212] dark:hover:border-[var(--color-secondary)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-xl text-[var(--color-primary)] transition-transform duration-300 group-hover:scale-110 dark:bg-[var(--color-secondary)]/10 dark:text-[var(--color-secondary)]">
                  <SubjectIcon icon={subject.icon} className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {subject.label}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {hasNotes
                      ? `Notes and concepts · ${count} note${count === 1 ? "" : "s"}`
                      : "Coming soon"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectGrid;
