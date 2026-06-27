import { z } from "zod";

// Zod schemas validating the untrusted bodies of the Interview Prep admin
// mutation routes (Section 6 requires every admin-mutation body validated) and
// the user-facing progress update. See feature-interview-prep.md.

export const PAGE_STATUS_VALUES = ["draft", "published", "archived"] as const;
export const PROGRESS_STATUS_VALUES = [
  "not-started",
  "in-progress",
  "completed",
] as const;

export const pageStatusEnum = z.enum(PAGE_STATUS_VALUES);
export const progressStatusEnum = z.enum(PROGRESS_STATUS_VALUES);

// A Mongo ObjectId hex string (24 chars). Kept permissive but non-empty.
const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, "invalid id");

// ---------------------------------------------------------------------------
// Subject
// ---------------------------------------------------------------------------

export const SubjectCreateSchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "key must be kebab-case")
    .optional(),
  label: z.string().min(1, "label is required"),
  icon: z.string().optional(),
  order: z.number().int().optional(),
});

export const SubjectUpdateSchema = z
  .object({
    _id: objectId,
    label: z.string().min(1).optional(),
    icon: z.string().optional(),
    order: z.number().int().optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Chapter
// ---------------------------------------------------------------------------

export const ChapterCreateSchema = z.object({
  subjectId: objectId,
  title: z.string().min(1, "title is required"),
  order: z.number().int().optional(),
});

export const ChapterUpdateSchema = z
  .object({
    _id: objectId,
    title: z.string().min(1).optional(),
    order: z.number().int().optional(),
  })
  .strict();

export const ReorderSchema = z.object({
  items: z
    .array(z.object({ _id: objectId, order: z.number().int() }))
    .min(1, "nothing to reorder"),
});

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const PageCreateSchema = z.object({
  title: z.string().min(1, "title is required"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case")
    .optional(),
  chapterId: objectId,
  order: z.number().int().optional(),
  icon: z.string().optional(),
  content: z.string().min(1, "content is required"),
  status: pageStatusEnum.optional(),
  tags: z.array(z.string()).optional(),
});

export const PageUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, "slug must be kebab-case")
      .optional(),
    chapterId: objectId.optional(),
    order: z.number().int().optional(),
    icon: z.string().optional(),
    content: z.string().min(1).optional(),
    status: pageStatusEnum.optional(),
    tags: z.array(z.string()).optional(),
  })
  .strict();

export const PageStatusSchema = z.object({
  status: pageStatusEnum,
});

// ---------------------------------------------------------------------------
// Progress (user-facing)
// ---------------------------------------------------------------------------

export const ProgressUpdateSchema = z
  .object({
    liked: z.boolean().optional(),
    status: progressStatusEnum.optional(),
    notes: z.string().optional(),
  })
  .strict();
