import mongoose, { Schema, model, Document } from "mongoose";

// Interview Prep — the leaf level of the content tree and the only level that
// holds actual content. The entire note body lives in a single markdown
// `content` field (headings, bold, blockquotes, fenced code, hr, lists).
// Routing is flat (`/interview-prep/[slug]`) so `slug` is globally unique.
// Pages are archived, never hard-deleted, to protect likes/progress.
// See feature-interview-prep.md (Section 1).

export type PageStatus = "draft" | "published" | "archived";

export interface IPage extends Document {
  title: string;
  slug: string; // globally unique — routing is flat: /interview-prep/[slug]
  chapterId: Schema.Types.ObjectId;
  order: number;
  icon?: string; // optional custom emoji/icon per note
  content: string; // the ENTIRE page body as one markdown string
  status: PageStatus;
  tags?: string[]; // search/filter + future JD cross-link (Section 12)
  viewCount: number;
  likeCount: number;
  createdBy: Schema.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const PageSchema = new Schema<IPage>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
  order: { type: Number, default: 0 },
  icon: String,
  content: { type: String, required: true },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  tags: [String],
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Page || model<IPage>("Page", PageSchema);
