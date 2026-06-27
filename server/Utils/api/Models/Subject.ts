import mongoose, { Schema, model, Document } from "mongoose";

// Interview Prep — top level of the three-level content tree:
//   Subject -> Chapter -> Page
// A Subject is a broad area ("Java", "System Design", "Behavioral"). It carries
// a stable `key` used by seed scripts/filters and (later) the JD cross-link.
// See feature-interview-prep.md (Section 1).

export interface ISubject extends Document {
  key: string; // "java", "system-design" — stable, used in filters/seed scripts
  label: string; // "Java"
  icon?: string; // lucide-react icon name
  order: number;
  createdAt: Date;
}

const SubjectSchema = new Schema<ISubject>({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  icon: String,
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subject ||
  model<ISubject>("Subject", SubjectSchema);
