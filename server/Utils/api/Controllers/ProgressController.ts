import connectdb from "@/Utils/api/db/connectDB";
import Page from "@/Utils/api/Models/Page";
import UserPageProgress from "@/Utils/api/Models/UserPageProgress";
import type {
  ProgressStatus,
  ToggleLikeResponse,
  UpdatePageProgressRequest,
} from "@/Utils/types/InterviewPrep";

// ProgressController — per-user like + progress state. See
// feature-interview-prep.md (Section 3).

// ---------------------------------------------------------------------------
// Pure helper (exported for tests).
// ---------------------------------------------------------------------------

/**
 * Given the user's current like state, return the next state and the exact
 * delta to apply to the aggregate `Page.likeCount`. Liking yields +1,
 * un-liking yields -1 — never a blind +1 on every call, so double-clicks and
 * stale client state can't double-count or push the count negative. Pure.
 */
export const computeLikeTransition = (
  currentlyLiked: boolean,
): { liked: boolean; delta: 1 | -1 } =>
  currentlyLiked ? { liked: false, delta: -1 } : { liked: true, delta: 1 };

// ---------------------------------------------------------------------------
// Like toggle
// ---------------------------------------------------------------------------

export type ToggleLikeResult =
  | { ok: true; data: ToggleLikeResponse }
  | { ok: false; error: "not_found" };

/**
 * Toggle the requesting user's like on a page. Reads the current per-user
 * state, flips it, and applies the matching +1/-1 to `Page.likeCount` in the
 * same operation. Idempotent against repeated calls reflecting the same UI
 * state because the delta is computed from stored state, not assumed.
 */
export const toggleLike = async (
  userId: string,
  pageId: string,
): Promise<ToggleLikeResult> => {
  await connectdb();

  const page = await Page.findById(pageId);
  if (!page) return { ok: false, error: "not_found" };

  const existing = await UserPageProgress.findOne({ userId, pageId });
  const currentlyLiked = existing?.liked ?? false;
  const { liked, delta } = computeLikeTransition(currentlyLiked);

  await UserPageProgress.findOneAndUpdate(
    { userId, pageId },
    { $set: { liked, lastViewedAt: new Date() } },
    { upsert: true, new: true },
  );

  // Clamp at zero defensively so a corrupted state can never go negative.
  const nextCount = Math.max(0, page.likeCount + delta);
  await Page.updateOne({ _id: pageId }, { $set: { likeCount: nextCount } });

  return { ok: true, data: { liked, likeCount: nextCount } };
};

// ---------------------------------------------------------------------------
// Progress upsert
// ---------------------------------------------------------------------------

export type UpsertProgressResult =
  | { ok: true; status: ProgressStatus; notes?: string }
  | { ok: false; error: "not_found" };

/**
 * Upsert the user's progress row for a page (status / notes). Like state is
 * owned by `toggleLike` and is intentionally not modified here even if a
 * `liked` field is present in the request — that keeps `Page.likeCount` in
 * sync with a single write path.
 */
export const upsertProgress = async (
  userId: string,
  pageId: string,
  data: UpdatePageProgressRequest,
): Promise<UpsertProgressResult> => {
  await connectdb();

  const page = await Page.findById(pageId);
  if (!page) return { ok: false, error: "not_found" };

  const update: Record<string, unknown> = { lastViewedAt: new Date() };
  if (data.status !== undefined) update.status = data.status;
  if (data.notes !== undefined) update.notes = data.notes;

  const doc = await UserPageProgress.findOneAndUpdate(
    { userId, pageId },
    { $set: update },
    { upsert: true, new: true },
  ).lean<{ status: ProgressStatus; notes?: string } | null>();

  // With upsert + new this is non-null at runtime; fall back defensively.
  return {
    ok: true,
    status: doc?.status ?? "not-started",
    notes: doc?.notes,
  };
};
