"use client";
import { FC, useState } from "react";
import { createPage, updatePage } from "@/Utils/Apicalls/InterviewPrep";
import Toast from "@/Utils/Toast";
import PageContent from "@/Components/InterviewPrep/PageContent";
import type { PageStatus } from "@/Utils/types/InterviewPrep";

/** A chapter option flattened with its owning subject label for the picker. */
export interface ChapterOption {
  _id: string;
  label: string; // "Java / Introduction"
}

/** Existing page being edited (omit for create mode). */
export interface EditablePage {
  _id: string;
  title: string;
  slug: string;
  chapterId: string;
  icon?: string;
  content: string;
  status: PageStatus;
  tags?: string[];
}

interface PageEditorProps {
  chapters: ChapterOption[];
  existing?: EditablePage;
  onSaved: () => void;
}

/**
 * Create/edit a page. A markdown textarea sits beside a live preview that
 * reuses the reader's PageContent, so authors see exactly what readers will.
 */
const PageEditor: FC<PageEditorProps> = ({ chapters, existing, onSaved }) => {
  const [title, setTitle] = useState<string>(existing?.title ?? "");
  const [slug, setSlug] = useState<string>(existing?.slug ?? "");
  const [chapterId, setChapterId] = useState<string>(
    existing?.chapterId ?? chapters[0]?._id ?? "",
  );
  const [icon, setIcon] = useState<string>(existing?.icon ?? "");
  const [tags, setTags] = useState<string>((existing?.tags ?? []).join(", "));
  const [status, setStatus] = useState<PageStatus>(existing?.status ?? "draft");
  const [content, setContent] = useState<string>(existing?.content ?? "");
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      Toast("error", "Title is required.");
      return;
    }
    if (!chapterId) {
      Toast("error", "Pick a chapter.");
      return;
    }
    if (!content.trim()) {
      Toast("error", "Content is required.");
      return;
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        ...(slug.trim() ? { slug: slug.trim() } : {}),
        chapterId,
        icon: icon.trim() || undefined,
        content,
        status,
        tags: tagList,
      };
      const resp = existing
        ? await updatePage(existing._id, payload)
        : await createPage(payload);
      if (!resp || !resp.ok) throw new Error("save failed");
      Toast("success", existing ? "Page updated." : "Page created.");
      onSaved();
    } catch {
      Toast("error", "Couldn't save the page.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Title
          </label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What Is Java"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Slug (optional — auto-generated)
          </label>
          <input
            className={inputClass}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="java-what-is-java"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Chapter
          </label>
          <select
            className={inputClass}
            value={chapterId}
            onChange={(e) => setChapterId(e.target.value)}
          >
            {chapters.length === 0 && <option value="">No chapters yet</option>}
            {chapters.map((c) => (
              <option key={c._id} value={c._id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Icon (emoji)
            </label>
            <input
              className={inputClass}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="📌"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Status
            </label>
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as PageStatus)}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
          Tags (comma-separated)
        </label>
        <input
          className={inputClass}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="java, fundamentals"
        />
      </div>

      {/* Editor + live preview */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Markdown
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            placeholder={"# Title\n\n## Section\n\n> A callout\n\n```java\n// code\n```"}
            className={`${inputClass} resize-y font-mono`}
          />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Live preview
          </span>
          <div className="h-full min-h-[20rem] overflow-y-auto rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            {content.trim() ? (
              <PageContent content={content} />
            ) : (
              <p className="text-sm text-gray-400">Preview appears here.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {saving && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent" />
          )}
          {existing ? "Save Changes" : "Create Page"}
        </button>
      </div>
    </div>
  );
};

export default PageEditor;
