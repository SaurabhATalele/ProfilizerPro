import connectdb from "@/Utils/api/db/connectDB";
import Chapter from "@/Utils/api/Models/Chapter";
import Page from "@/Utils/api/Models/Page";
import type { ChapterInput, ReorderItem } from "@/Utils/types/InterviewPrep";

// ChapterController — Chapter CRUD + reorder. Chapters are folders, never
// content. Deleting a Chapter is blocked while it still has non-archived
// Pages, mirroring the Subject rule. See feature-interview-prep.md (Section 3).

export type ChapterMutationResult =
  | { ok: true; chapter: unknown }
  | { ok: false; error: "not_found" | "has_children" };

export const createChapter = async (
  input: ChapterInput,
): Promise<{ ok: true; chapter: unknown }> => {
  await connectdb();
  const chapter = await Chapter.create({
    subjectId: input.subjectId,
    title: input.title,
    order: input.order ?? 0,
  });
  return { ok: true, chapter };
};

export const updateChapter = async (
  id: string,
  patch: Partial<Pick<ChapterInput, "title" | "order">>,
): Promise<ChapterMutationResult> => {
  await connectdb();
  const chapter = await Chapter.findByIdAndUpdate(
    id,
    {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.order !== undefined ? { order: patch.order } : {}),
    },
    { new: true },
  );
  if (!chapter) return { ok: false, error: "not_found" };
  return { ok: true, chapter };
};

/** Bulk-set the `order` of chapters within a subject. */
export const reorderChapters = async (
  items: ReorderItem[],
): Promise<{ ok: true }> => {
  await connectdb();
  await Promise.all(
    items.map((item) =>
      Chapter.findByIdAndUpdate(item._id, { order: item.order }),
    ),
  );
  return { ok: true };
};

/**
 * Delete a Chapter only when it has no non-archived Pages. Archived pages do
 * not block (their likes/progress are preserved regardless), but a live or
 * draft page does, so content is never silently orphaned.
 */
export const deleteChapter = async (
  id: string,
): Promise<ChapterMutationResult> => {
  await connectdb();
  const liveChildren = await Page.countDocuments({
    chapterId: id,
    status: { $ne: "archived" },
  });
  if (liveChildren > 0) {
    return { ok: false, error: "has_children" };
  }
  const chapter = await Chapter.findByIdAndDelete(id);
  if (!chapter) return { ok: false, error: "not_found" };
  return { ok: true, chapter };
};
