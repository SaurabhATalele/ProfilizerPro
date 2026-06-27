"use client";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { getNavTree, getPageBySlug } from "@/Utils/Apicalls/InterviewPrep";
import Toast from "@/Utils/Toast";
import type {
  NavTreeSubject,
  PageDetailResponse,
} from "@/Utils/types/InterviewPrep";
import SubjectManager from "./SubjectManager";
import ChapterManager from "./ChapterManager";
import PageEditor, {
  type ChapterOption,
  type EditablePage,
} from "./PageEditor";
import PageStatusControls from "./PageStatusControls";

type Tab = "subjects" | "chapters" | "pages";

/**
 * Admin authoring console for the Interview Prep library. Fetches the admin
 * nav tree (which includes drafts/archived) and exposes Subject, Chapter, and
 * Page management. The Page tab embeds the live-preview PageEditor.
 */
const InterviewPrepAdmin: FC = () => {
  const [subjects, setSubjects] = useState<NavTreeSubject[]>([]);
  const [tab, setTab] = useState<Tab>("pages");
  const [editing, setEditing] = useState<EditablePage | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    const resp = await getNavTree();
    if (resp && resp.ok) {
      const data: { subjects: NavTreeSubject[] } = await resp.json();
      setSubjects(data.subjects ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Flatten chapters with "Subject / Chapter" labels for the page editor picker.
  const chapterOptions = useMemo<ChapterOption[]>(
    () =>
      subjects.flatMap((s) =>
        s.chapters.map((c) => ({
          _id: c._id,
          label: `${s.label} / ${c.title}`,
        })),
      ),
    [subjects],
  );

  // All pages flattened, with their chapter label, for the page list.
  const allPages = useMemo(
    () =>
      subjects.flatMap((s) =>
        s.chapters.flatMap((c) =>
          c.pages.map((p) => ({
            ...p,
            chapterLabel: `${s.label} / ${c.title}`,
          })),
        ),
      ),
    [subjects],
  );

  const openEditor = async (slug: string): Promise<void> => {
    const resp = await getPageBySlug(slug);
    if (!resp || !resp.ok) {
      Toast("error", "Couldn't load the page for editing.");
      return;
    }
    const data: PageDetailResponse = await resp.json();
    setEditing({
      _id: data._id,
      title: data.title,
      slug: data.slug,
      chapterId: data.chapterId ?? "",
      icon: data.icon,
      content: data.content,
      status: data.status ?? "draft",
      tags: data.tags ?? [],
    });
    setCreating(false);
  };

  const handleSaved = (): void => {
    setEditing(null);
    setCreating(false);
    refresh();
  };

  const tabClass = (t: Tab): string =>
    `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      tab === t
        ? "bg-[var(--color-primary)] text-white dark:bg-white dark:text-black"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Interview Prep — Authoring</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Manage subjects, chapters, and notes. Changes appear in the reader once
        a page is published.
      </p>

      <div className="mb-6 flex gap-2">
        <button className={tabClass("pages")} onClick={() => setTab("pages")}>
          Pages
        </button>
        <button
          className={tabClass("chapters")}
          onClick={() => setTab("chapters")}
        >
          Chapters
        </button>
        <button
          className={tabClass("subjects")}
          onClick={() => setTab("subjects")}
        >
          Subjects
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : (
        <>
          {tab === "subjects" && (
            <SubjectManager subjects={subjects} onChanged={refresh} />
          )}
          {tab === "chapters" && (
            <ChapterManager subjects={subjects} onChanged={refresh} />
          )}
          {tab === "pages" && (
            <div className="flex flex-col gap-4">
              {editing || creating ? (
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setCreating(false);
                    }}
                    className="self-start text-sm text-gray-500 hover:underline dark:text-gray-400"
                  >
                    ← Back to page list
                  </button>
                  <PageEditor
                    chapters={chapterOptions}
                    existing={editing ?? undefined}
                    onSaved={handleSaved}
                  />
                </div>
              ) : (
                <>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (chapterOptions.length === 0) {
                          Toast("error", "Create a subject and chapter first.");
                          return;
                        }
                        setCreating(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
                    >
                      <Plus className="h-4 w-4" /> New Page
                    </button>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {allPages.map((p) => (
                      <li
                        key={p._id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {p.title}
                          </p>
                          <p className="truncate text-xs text-gray-400">
                            {p.chapterLabel}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <PageStatusControls
                            pageId={p._id}
                            status={p.status ?? "published"}
                            onChanged={() => refresh()}
                          />
                          <button
                            type="button"
                            onClick={() => openEditor(p.slug)}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-700"
                          >
                            Edit
                          </button>
                        </div>
                      </li>
                    ))}
                    {allPages.length === 0 && (
                      <li className="text-sm text-gray-500 dark:text-gray-400">
                        No pages yet. Create a subject, a chapter, then a page.
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewPrepAdmin;
