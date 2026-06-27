"use client";
import { FC, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, Folder } from "lucide-react";
import type { NavTreeSubject } from "@/Utils/types/InterviewPrep";

interface NavTreeProps {
  subjects: NavTreeSubject[];
  /** Live search text; filters the tree by page title. */
  filter: string;
}

/** Lowercase substring match used for the live filter. */
const matches = (haystack: string, needle: string): boolean =>
  haystack.toLowerCase().includes(needle.toLowerCase());

/**
 * Recursive, collapsible Subject -> Chapter -> Page tree built from the single
 * nav-tree payload (no per-navigation refetch). Live-filters by page title as
 * the user types and highlights the page matching the active route slug.
 */
const NavTree: FC<NavTreeProps> = ({ subjects, filter }) => {
  const pathname = usePathname();
  // Active slug is the last segment of /interview-prep/[slug].
  const activeSlug = useMemo(() => {
    const parts = (pathname ?? "").split("/").filter(Boolean);
    return parts[0] === "interview-prep" && parts[1] ? parts[1] : "";
  }, [pathname]);

  const trimmed = filter.trim();

  // Filtered tree: keep only pages matching the query (and their ancestors).
  const tree = useMemo(() => {
    if (!trimmed) return subjects;
    return subjects
      .map((subject) => ({
        ...subject,
        chapters: subject.chapters
          .map((chapter) => ({
            ...chapter,
            pages: chapter.pages.filter((p) => matches(p.title, trimmed)),
          }))
          .filter((chapter) => chapter.pages.length > 0),
      }))
      .filter((subject) => subject.chapters.length > 0);
  }, [subjects, trimmed]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Auto-expand: everything while filtering, otherwise the branch holding the
  // active page so the current note is always visible on load.
  useEffect(() => {
    const next = new Set<string>();
    for (const subject of tree) {
      for (const chapter of subject.chapters) {
        const holdsActive = chapter.pages.some((p) => p.slug === activeSlug);
        if (trimmed || holdsActive) {
          next.add(subject._id);
          next.add(chapter._id);
        }
      }
    }
    setExpanded(next);
  }, [tree, trimmed, activeSlug]);

  const toggle = (id: string): void =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (tree.length === 0) {
    return (
      <p className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
        {trimmed ? "No notes match your search." : "No notes published yet."}
      </p>
    );
  }

  return (
    <nav className="flex flex-col gap-1 text-sm" aria-label="Notes navigation">
      {tree.map((subject) => {
        const subjectOpen = expanded.has(subject._id);
        return (
          <div key={subject._id}>
            <button
              type="button"
              onClick={() => toggle(subject._id)}
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left font-semibold text-gray-800 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
              aria-expanded={subjectOpen}
            >
              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  subjectOpen ? "rotate-90" : ""
                }`}
              />
              {subject.label}
            </button>

            {subjectOpen && (
              <div className="ml-3 flex flex-col gap-0.5 border-l border-gray-200 pl-2 dark:border-gray-800">
                {subject.chapters.map((chapter) => {
                  const chapterOpen = expanded.has(chapter._id);
                  return (
                    <div key={chapter._id}>
                      <button
                        type="button"
                        onClick={() => toggle(chapter._id)}
                        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        aria-expanded={chapterOpen}
                      >
                        <ChevronRight
                          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                            chapterOpen ? "rotate-90" : ""
                          }`}
                        />
                        <Folder className="h-3.5 w-3.5 shrink-0" />
                        {chapter.title}
                      </button>

                      {chapterOpen && (
                        <ul className="ml-4 flex flex-col gap-0.5 border-l border-gray-200 pl-2 dark:border-gray-800">
                          {chapter.pages.map((page) => {
                            const active = page.slug === activeSlug;
                            return (
                              <li key={page._id}>
                                <Link
                                  href={`/interview-prep/${page.slug}`}
                                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors duration-200 ${
                                    active
                                      ? "border-l-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 font-medium text-[var(--color-primary)] dark:border-[var(--color-secondary)] dark:bg-[var(--color-secondary)]/10 dark:text-[var(--color-secondary)]"
                                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                  }`}
                                >
                                  <span className="shrink-0 text-xs">
                                    {page.icon ?? <FileText className="h-3.5 w-3.5" />}
                                  </span>
                                  <span className="truncate">{page.title}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default NavTree;
