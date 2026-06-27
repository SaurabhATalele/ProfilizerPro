import connectdb from "@/Utils/api/db/connectDB";
import Subject from "@/Utils/api/Models/Subject";
import Chapter from "@/Utils/api/Models/Chapter";
import Page from "@/Utils/api/Models/Page";
import type {
  NavTreeResponse,
  NavTreeSubject,
  SubjectInput,
} from "@/Utils/types/InterviewPrep";

// SubjectController — owns the nav-tree aggregation (the single call powering
// the whole sidebar) plus Subject CRUD. See feature-interview-prep.md
// (Section 3). Mutations are admin-gated at the route layer.

export type SubjectMutationResult =
  | { ok: true; subject: unknown }
  | { ok: false; error: "not_found" | "has_children" | "duplicate_key" };

/** kebab-case a label into a stable Subject key. */
const toKey = (label: string): string =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Build the entire Subject -> Chapter -> Page tree in a single aggregation
 * (no N+1). Page bodies are intentionally omitted — only titles/slugs/icons
 * are returned. Non-admins see published pages only; admins see every page.
 */
export const getNavTree = async (
  isAdmin: boolean,
): Promise<NavTreeResponse> => {
  await connectdb();

  // Page-level status filter applied inside the nested lookup.
  const pageStatusMatch = isAdmin ? {} : { status: "published" };

  const subjects = await Subject.aggregate<NavTreeSubject>([
    { $sort: { order: 1, createdAt: 1 } },
    {
      $lookup: {
        from: "chapters",
        let: { subjectId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$subjectId", "$$subjectId"] } } },
          { $sort: { order: 1, createdAt: 1 } },
          {
            $lookup: {
              from: "pages",
              let: { chapterId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$chapterId", "$$chapterId"] },
                    ...pageStatusMatch,
                  },
                },
                { $sort: { order: 1, createdAt: 1 } },
                { $project: { _id: 1, title: 1, slug: 1, icon: 1, status: 1 } },
              ],
              as: "pages",
            },
          },
          { $project: { _id: 1, title: 1, pages: 1 } },
        ],
        as: "chapters",
      },
    },
    { $project: { _id: 1, key: 1, label: 1, icon: 1, chapters: 1 } },
  ]);

  // The sidebar count reflects the published note total.
  const totalPages = await Page.countDocuments({ status: "published" });

  return { subjects, totalPages };
};

export const createSubject = async (
  input: SubjectInput,
): Promise<SubjectMutationResult> => {
  await connectdb();
  try {
    const subject = await Subject.create({
      key: input.key?.trim() || toKey(input.label),
      label: input.label,
      icon: input.icon,
      order: input.order ?? 0,
    });
    return { ok: true, subject };
  } catch (error: unknown) {
    // Duplicate `key` (unique index) is the expected conflict.
    if ((error as { code?: number })?.code === 11000) {
      return { ok: false, error: "duplicate_key" };
    }
    throw error;
  }
};

export const updateSubject = async (
  id: string,
  patch: Partial<SubjectInput>,
): Promise<SubjectMutationResult> => {
  await connectdb();
  const subject = await Subject.findByIdAndUpdate(
    id,
    {
      ...(patch.label !== undefined ? { label: patch.label } : {}),
      ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
      ...(patch.order !== undefined ? { order: patch.order } : {}),
    },
    { new: true },
  );
  if (!subject) return { ok: false, error: "not_found" };
  return { ok: true, subject };
};

/**
 * Delete a Subject only when it has no non-archived Chapters. Chapters are not
 * archivable (only Pages are), so any existing Chapter blocks the delete to
 * avoid orphaning content. See the "archive, never hard-delete" rule.
 */
export const deleteSubject = async (
  id: string,
): Promise<SubjectMutationResult> => {
  await connectdb();
  const childCount = await Chapter.countDocuments({ subjectId: id });
  if (childCount > 0) {
    return { ok: false, error: "has_children" };
  }
  const subject = await Subject.findByIdAndDelete(id);
  if (!subject) return { ok: false, error: "not_found" };
  return { ok: true, subject };
};
