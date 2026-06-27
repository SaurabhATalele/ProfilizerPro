import mongoose, { Schema, model, Document } from "mongoose";

// Interview Prep — middle level of the content tree. A Chapter is a folder
// inside a Subject, not content itself. Any numbering the author wants in the
// title is typed directly ("1 Introduction"); the system never auto-prefixes
// numbers. `order` controls sort position within the Subject and is
// independent of the title text. See feature-interview-prep.md (Section 1).

export interface IChapter extends Document {
  subjectId: Schema.Types.ObjectId;
  title: string;
  order: number;
  createdAt: Date;
}

const ChapterSchema = new Schema<IChapter>({
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Chapter ||
  model<IChapter>("Chapter", ChapterSchema);
