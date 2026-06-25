import mongoose, { Schema, model } from "mongoose";

const schema = new Schema({
  Question: {
    type: String,
    required: true,
  },
  AssignmentId: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  subHeading: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: false,
  },
  answer: {
    type: String,
    required: false,
  },
  marks: {
    type: Number,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  negativeMarks: {
    type: Number,
    required: false,
  },
  // Additive, backward-compatible fields for JD-generated questions. Optional
  // so Mongoose strict mode retains them while existing MCQ consumers (which
  // ignore unknown fields) are unaffected.
  // See .kiro/specs/jd-question-generator/design.md ("Data Models").
  kind: {
    type: String,
    enum: ["mcq", "coding", "aptitude"],
    required: false,
  },
  skillTag: {
    type: String,
    required: false,
  },
  testCases: {
    type: [
      {
        _id: false,
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        hidden: { type: Boolean, required: true },
      },
    ],
    required: false,
  },
});

export default mongoose.models.Question || model("Question", schema);
