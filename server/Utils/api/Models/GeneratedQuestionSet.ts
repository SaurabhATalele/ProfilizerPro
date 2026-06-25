import mongoose, { Schema, model } from "mongoose";

// Staging document holding the generated questions, the requested mix, and
// provenance. Holds the editable, not-yet-published work; the live
// Assignment/Question documents are only created on approval.
// See .kiro/specs/jd-question-generator/design.md ("Data Models").

const mixSchema = new Schema(
  {
    mcq: { type: Number, required: true, default: 0 },
    coding: { type: Number, required: true, default: 0 },
    aptitude: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const testCaseSchema = new Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    hidden: { type: Boolean, required: true },
  },
  { _id: false },
);

const generatedQuestionSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ["mcq", "coding", "aptitude"],
      required: true,
    },
    text: { type: String, required: true },
    options: { type: [String], required: false },
    answer: { type: String, required: false },
    testCases: { type: [testCaseSchema], required: false },
    skillTag: { type: String, required: false },
    language: { type: String, required: false },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    edited: { type: Boolean, required: true, default: false },
    manuallyAdded: { type: Boolean, required: false },
  },
  { _id: false },
);

// Provenance: makes generated content auditable.
const provenanceSchema = new Schema(
  {
    jdHash: { type: String, required: true },
    model: { type: String, required: true },
    promptVersion: { type: String, required: true },
  },
  { _id: false },
);

const schema = new Schema({
  jobDescriptionId: {
    type: Schema.Types.ObjectId,
    ref: "JobDescription",
    required: true,
  },
  requestedMix: { type: mixSchema, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard", "mixed"],
    required: true,
  },
  preferredLanguages: { type: [String], required: true, default: [] },
  questions: { type: [generatedQuestionSchema], required: true, default: [] },
  shortfall: { type: mixSchema, required: true },
  generatedFrom: { type: provenanceSchema, required: true },
  // Admin id taken from the JWT, never from the request body.
  createdBy: { type: String, required: true },
  // Set on approval; references the created Assignment ("Test").
  testId: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: false,
  },
  // Cooldown anchor for single-question regeneration.
  lastRegenerationAt: { type: Date, required: false },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

export default mongoose.models.GeneratedQuestionSet ||
  model("GeneratedQuestionSet", schema);
