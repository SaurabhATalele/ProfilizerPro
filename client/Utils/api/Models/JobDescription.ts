import mongoose, { Schema, model } from "mongoose";

// Staging document holding the raw JD text, its source, and the Stage 1
// parsed hiring signal. Created during /parse; never published as a Test.
// See .kiro/specs/jd-question-generator/design.md ("Data Models").

const parsedSchema = new Schema(
  {
    role: { type: String, required: true },
    seniority: {
      type: String,
      enum: ["intern", "junior", "mid", "senior", "lead"],
      required: true,
    },
    skills: { type: [String], required: true, default: [] },
    mustHave: { type: [String], required: true, default: [] },
    niceToHave: { type: [String], required: true, default: [] },
  },
  { _id: false },
);

const schema = new Schema({
  sourceType: {
    type: String,
    enum: ["paste", "upload"],
    required: true,
  },
  rawText: {
    type: String,
    required: true,
  },
  // sha256 of the normalized rawText; deterministic per JD text.
  jdHash: {
    type: String,
    required: true,
  },
  parsed: {
    type: parsedSchema,
    required: true,
  },
  // Admin email/id taken from the JWT, never from the request body.
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default mongoose.models.JobDescription ||
  model("JobDescription", schema);
