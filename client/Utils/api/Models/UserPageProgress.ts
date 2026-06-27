import mongoose, { Schema, model, Document } from "mongoose";

// Interview Prep — per-user, per-page state: a personal like (which drives the
// aggregate Page.likeCount), a lightweight progress status, optional private
// notes, and the last-viewed timestamp. The (userId, pageId) pair is unique so
// each user has at most one progress row per page. Archiving a Page never
// touches these rows. See feature-interview-prep.md (Section 1).

export type ProgressStatus = "not-started" | "in-progress" | "completed";

export interface IUserPageProgress extends Document {
  userId: Schema.Types.ObjectId;
  pageId: Schema.Types.ObjectId;
  liked: boolean;
  status: ProgressStatus;
  notes?: string;
  lastViewedAt: Date;
}

const UserPageProgressSchema = new Schema<IUserPageProgress>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  pageId: { type: Schema.Types.ObjectId, ref: "Page", required: true },
  liked: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed"],
    default: "not-started",
  },
  notes: String,
  lastViewedAt: { type: Date, default: Date.now },
});

UserPageProgressSchema.index({ userId: 1, pageId: 1 }, { unique: true });

export default mongoose.models.UserPageProgress ||
  model<IUserPageProgress>("UserPageProgress", UserPageProgressSchema);
