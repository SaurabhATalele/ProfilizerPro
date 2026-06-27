"use client";
import { FC, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapters,
} from "@/Utils/Apicalls/InterviewPrep";
import Toast from "@/Utils/Toast";
import type { NavTreeSubject, NavTreeChapter } from "@/Utils/types/InterviewPrep";

interface ChapterManagerProps {
  subjects: NavTreeSubject[];
  onChanged: () => void;
}

/** Chapter CRUD + up/down reordering, scoped to a selected subject. */
const ChapterManager: FC<ChapterManagerProps> = ({ subjects, onChanged }) => {
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?._id ?? "");
  const [title, setTitle] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(() => {
    // Keep a valid selection if the subject list changes.
    if (!subjects.some((s) => s._id === subjectId)) {
      setSubjectId(subjects[0]?._id ?? "");
    }
  }, [subjects, subjectId]);

  const selected = subjects.find((s) => s._id === subjectId);
  const chapters: NavTreeChapter[] = selected?.chapters ?? [];

  const inputClass =
    "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white";

  const handleCreate = async (): Promise<void> => {
    if (!subjectId) {
      Toast("error", "Create a subject first.");
      return;
    }
    if (!title.trim()) {
      Toast("error", "Chapter title is required.");
      return;
    }
    setBusy(true);
    try {
      const resp = await createChapter({
        subjectId,
        title: title.trim(),
        order: chapters.length,
      });
      if (!resp || !resp.ok) throw new Error("create failed");
      Toast("success", "Chapter created.");
      setTitle("");
      onChanged();
    } catch {
      Toast("error", "Couldn't create chapter.");
    } finally {
      setBusy(false);
    }
  };

  const handleRename = async (id: string, current: string): Promise<void> => {
    const next = window.prompt("New chapter title", current);
    if (!next || next.trim() === current) return;
    const resp = await updateChapter(id, { title: next.trim() });
    if (resp && resp.ok) {
      Toast("success", "Chapter renamed.");
      onChanged();
    } else {
      Toast("error", "Couldn't rename chapter.");
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (
      !window.confirm(
        "Delete this chapter? Only allowed when it has no live pages.",
      )
    ) {
      return;
    }
    const resp = await deleteChapter(id);
    if (resp && resp.ok) {
      Toast("success", "Chapter deleted.");
      onChanged();
    } else if (resp && resp.status === 409) {
      Toast("error", "Chapter still has pages — archive or move them first.");
    } else {
      Toast("error", "Couldn't delete chapter.");
    }
  };

  // Swap a chapter with its neighbour and persist the new order.
  const move = async (index: number, dir: -1 | 1): Promise<void> => {
    const target = index + dir;
    if (target < 0 || target >= chapters.length) return;
    const reordered = [...chapters];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];
    const items = reordered.map((c, i) => ({ _id: c._id, order: i }));
    const resp = await reorderChapters(items);
    if (resp && resp.ok) {
      onChanged();
    } else {
      Toast("error", "Couldn't reorder chapters.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col">
          <label className="mb-1 text-xs text-gray-500 dark:text-gray-400">
            Subject
          </label>
          <select
            className={inputClass}
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.length === 0 && <option value="">No subjects</option>}
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col">
          <label className="mb-1 text-xs text-gray-500 dark:text-gray-400">
            New chapter title
          </label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="1 Introduction"
          />
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={busy}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          Add Chapter
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {chapters.map((c, i) => (
          <li
            key={c._id}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800"
          >
            <span className="text-sm font-medium">
              {c.title}{" "}
              <span className="text-xs text-gray-400">
                ({c.pages.length} pages)
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="rounded-md border border-gray-300 p-1 disabled:opacity-40 dark:border-gray-700"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === chapters.length - 1}
                aria-label="Move down"
                className="rounded-md border border-gray-300 p-1 disabled:opacity-40 dark:border-gray-700"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleRename(c._id, c.title)}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-700"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => handleDelete(c._id)}
                aria-label={`Delete ${c.title}`}
                className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 dark:border-red-900 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
        {chapters.length === 0 && (
          <li className="text-sm text-gray-500 dark:text-gray-400">
            No chapters in this subject yet.
          </li>
        )}
      </ul>
    </div>
  );
};

export default ChapterManager;
