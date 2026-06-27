import connectdb from "@/Utils/api/db/connectDB";
import Page from "@/Utils/api/Models/Page";
import Chapter from "@/Utils/api/Models/Chapter";
import Subject from "@/Utils/api/Models/Subject";
import UserPageProgress from "@/Utils/api/Models/UserPageProgress";
import type {
  PageDetailResponse,
  PageInput,
  PageStatus,
  ProgressStatus,
  ReorderItem,
  SearchPageResult,
} from "@/Utils/types/InterviewPrep";

// PageController — page reads (with view increment + per-user like/progress
// join), search, and admin authoring. See feature-interview-prep.md
// (Section 3).

// ---------------------------------------------------------------------------
// Pure helpers (exported for tests; no DB).
// ---------------------------------------------------------------------------

/** kebab-case a title into a URL slug. Deterministic. */
export const slugify = (title: string): string =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "page";

/**
 * Given a desired slug and the set of slugs already taken, return a unique
 * slug by appending `-2`, `-3`, ... on collision. Pure.
 */
export const uniqueSlug = (desired: string, taken: Set<string>): string => {
  if (!taken.has(desired)) return desired;
  let n = 2;
  while (taken.has(`${desired}-${n}`)) n += 1;
  return `${desired}-${n}`;
};

/** Resolve a globally-unique slug for a (possibly new) page against the DB. */
const resolveUniqueSlug = async (
  desired: string,
  excludeId?: string,
): Promise<string> => {
  const base = slugify(desired);
  // Pull every slug sharing the base prefix so collisions are detected in one
  // query rather than a probe-per-candidate loop.
  const existing = await Page.find(
    { slug: new RegExp(`^${base}(-\\d+)?$`) },
    { slug: 1, _id: 1 },
  ).lean<{ _id: unknown; slug: string }[]>();
  const taken = new Set(
    existing
      .filter((p) => String(p._id) !== excludeId)
      .map((p) => p.slug),
  );
  return uniqueSlug(base, taken);
};

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export type GetPageResult =
  | { ok: true; data: PageDetailResponse }
  | { ok: false; error: "not_found" };

/**
 * Fetch a published page by slug for reading. Non-admins get `not_found` (the
 * route maps it to 404, never 403) for draft/archived slugs. Increments
 * `viewCount` on every successful published fetch, and joins in the requesting
 * user's like/progress state.
 */
export const getPageBySlug = async (
  slug: string,
  user: { userId?: string; isAdmin?: boolean },
): Promise<GetPageResult> => {
  await connectdb();

  const page = await Page.findOne({ slug });
  if (!page) return { ok: false, error: "not_found" };

  // Draft/archived pages are invisible to non-admins at the direct-slug level.
  if (page.status !== "published" && !user.isAdmin) {
    return { ok: false, error: "not_found" };
  }

  // v1: increment the view count on every published load (known limitation —
  // no per-session dedup). Admins previewing drafts do not inflate the count.
  if (page.status === "published") {
    await Page.updateOne({ _id: page._id }, { $inc: { viewCount: 1 } });
    page.viewCount += 1;
  }

  // Breadcrumb: chapter title + subject label.
  const chapter = await Chapter.findById(page.chapterId).lean<{
    _id: unknown;
    title: string;
    subjectId: unknown;
  } | null>();
  const subject = chapter
    ? await Subject.findById(chapter.subjectId).lean<{ label: string } | null>()
    : null;

  // Per-user like/progress state.
  let liked = false;
  let progressStatus: ProgressStatus = "not-started";
  if (user.userId) {
    const progress = await UserPageProgress.findOne({
      userId: user.userId,
      pageId: page._id,
    }).lean<{ liked: boolean; status: ProgressStatus } | null>();
    if (progress) {
      liked = progress.liked;
      progressStatus = progress.status;
    }
  }

  return {
    ok: true,
    data: {
      _id: String(page._id),
      title: page.title,
      slug: page.slug,
      content: page.content,
      icon: page.icon,
      viewCount: page.viewCount,
      likeCount: page.likeCount,
      liked,
      progressStatus,
      breadcrumb: {
        subjectLabel: subject?.label ?? "",
        chapterTitle: chapter?.title ?? "",
      },
      // Admin-only authoring fields for the editor.
      ...(user.isAdmin
        ? {
            chapterId: String(page.chapterId),
            status: page.status,
            tags: page.tags ?? [],
          }
        : {}),
    },
  };
};

/**
 * Case-insensitive search over title/tags. Published-only for non-admins.
 * Regex is fine until the library is large enough to justify a text index.
 */
export const searchPages = async (
  query: string,
  isAdmin: boolean,
): Promise<SearchPageResult[]> => {
  await connectdb();
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Escape regex metacharacters in user input before building the pattern.
  const safe = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp(safe, "i");

  const statusFilter = isAdmin ? {} : { status: "published" };
  const results = await Page.find(
    { ...statusFilter, $or: [{ title: rx }, { tags: rx }] },
    { _id: 1, title: 1, slug: 1, icon: 1 },
  )
    .limit(50)
    .lean<SearchPageResult[]>();

  return results.map((r) => ({
    _id: String(r._id),
    title: r.title,
    slug: r.slug,
    icon: r.icon,
  }));
};

// ---------------------------------------------------------------------------
// Static rendering (ISR) helpers — published-only, no view increment, no
// per-user state, so the result is identical for every visitor and can be
// baked into a statically generated page.
// ---------------------------------------------------------------------------

/** Every published page slug, for `generateStaticParams`. */
export const getPublishedSlugs = async (): Promise<string[]> => {
  await connectdb();
  const pages = await Page.find(
    { status: "published" },
    { slug: 1 },
  ).lean<{ slug: string }[]>();
  return pages.map((p) => p.slug);
};

/**
 * Published page detail for static rendering: content, breadcrumb, and
 * aggregate counts only. Returns `null` for missing/unpublished slugs. Unlike
 * `getPageBySlug` this does NOT increment views or read user state, so it is
 * safe to call at build/ISR time. Per-user like/progress are layered in
 * client-side after hydration.
 */
export const getStaticPageBySlug = async (
  slug: string,
): Promise<PageDetailResponse | null> => {
  await connectdb();

  const page = await Page.findOne({ slug, status: "published" }).lean<{
    _id: unknown;
    title: string;
    slug: string;
    content: string;
    icon?: string;
    viewCount: number;
    likeCount: number;
    chapterId: unknown;
  } | null>();
  if (!page) return null;

  const chapter = await Chapter.findById(page.chapterId).lean<{
    title: string;
    subjectId: unknown;
  } | null>();
  const subject = chapter
    ? await Subject.findById(chapter.subjectId).lean<{ label: string } | null>()
    : null;

  return {
    _id: String(page._id),
    title: page.title,
    slug: page.slug,
    content: page.content,
    icon: page.icon,
    viewCount: page.viewCount,
    likeCount: page.likeCount,
    liked: false,
    progressStatus: "not-started",
    breadcrumb: {
      subjectLabel: subject?.label ?? "",
      chapterTitle: chapter?.title ?? "",
    },
  };
};

// ---------------------------------------------------------------------------
// Admin authoring
// ---------------------------------------------------------------------------

export const createPage = async (
  input: PageInput,
  userId: string,
): Promise<{ ok: true; page: unknown }> => {
  await connectdb();
  const slug = await resolveUniqueSlug(input.slug || input.title);
  const page = await Page.create({
    title: input.title,
    slug,
    chapterId: input.chapterId,
    order: input.order ?? 0,
    icon: input.icon,
    content: input.content,
    status: input.status ?? "draft",
    tags: input.tags ?? [],
    createdBy: userId,
    updatedAt: new Date(),
  });
  return { ok: true, page };
};

export type PageMutationResult =
  | { ok: true; page: unknown }
  | { ok: false; error: "not_found" };

export const updatePage = async (
  id: string,
  patch: Partial<PageInput>,
): Promise<PageMutationResult> => {
  await connectdb();
  const page = await Page.findById(id);
  if (!page) return { ok: false, error: "not_found" };

  if (patch.title !== undefined) page.title = patch.title;
  if (patch.chapterId !== undefined) page.chapterId = patch.chapterId as never;
  if (patch.order !== undefined) page.order = patch.order;
  if (patch.icon !== undefined) page.icon = patch.icon;
  if (patch.content !== undefined) page.content = patch.content;
  if (patch.status !== undefined) page.status = patch.status;
  if (patch.tags !== undefined) page.tags = patch.tags;

  // Slug change (explicit, or implied by a retitle when none supplied) is
  // collision-checked and auto-suffixed rather than blocking the save.
  if (patch.slug !== undefined && patch.slug !== page.slug) {
    page.slug = await resolveUniqueSlug(patch.slug, id);
  }

  page.updatedAt = new Date();
  await page.save();
  return { ok: true, page };
};

/** Bulk-set the `order` of pages within a chapter. */
export const reorderPagesInChapter = async (
  items: ReorderItem[],
): Promise<{ ok: true }> => {
  await connectdb();
  await Promise.all(
    items.map((item) => Page.findByIdAndUpdate(item._id, { order: item.order })),
  );
  return { ok: true };
};

/** Publish / unpublish / archive a page. Archiving preserves likes/progress. */
export const setPageStatus = async (
  id: string,
  status: PageStatus,
): Promise<PageMutationResult> => {
  await connectdb();
  const page = await Page.findByIdAndUpdate(
    id,
    { status, updatedAt: new Date() },
    { new: true },
  );
  if (!page) return { ok: false, error: "not_found" };
  return { ok: true, page };
};
