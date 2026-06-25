import mongoose, { Schema, model } from "mongoose";

// A generated test instance. Holds the correct answers server-side so the
// client never sees them and the score is computed/locked on the server.
const schema = new Schema({
  owner: { type: String, required: true }, // email from the JWT
  questions: [
    {
      question: { type: String, required: true },
      options: { type: [String], required: true },
      answer: { type: String, required: true }, // server-only
    },
  ],
  context: {
    mode: { type: String, enum: ["assignment", "custom"], required: true },
    assignmentId: { type: String },
    customAssignmentId: { type: String },
    topic: { type: String },
    difficulty: { type: String },
    subtopics: [{ name: String, questionCount: Number }],
  },
  scored: { type: Boolean, default: false }, // once true, score is immutable
  score: { type: Number },
  total: { type: Number },
  createdAt: { type: Date, default: Date.now, expires: 7200 }, // TTL 2h
});

export default mongoose.models.TestSession ||
  model("TestSession", schema);
