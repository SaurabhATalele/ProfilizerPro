import mongoose, { Schema, model } from "mongoose";

const schema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  description: {
    type: String,
    required: false,
    minLength: 3,
  },
  icon: {
    type: String,
    required: true,
  },
  topics: [
    {
      name: {
        type: [String],
        required: true,
      },
      minQuestions: {
        type: Number,
        required: true,
        default: 4,
      },
      maxQuestions: {
        type: Number,
        required: true,
        default: 8,
      },
    },
  ],
  attemptedBy: {
    type: [
      {
        email: {
          type: String,
          validate: function (v: string) {
            return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
          },
        },
        score: {
          type: Number,
          required: false,
        },
        correct: {
          type: Number,
          required: false,
        },
        total: {
          type: Number,
          required: false,
        },
        questions: {
          type: [
            {
              question: {
                type: String,
                required: true,
              },
              answer: {
                type: String,
                required: true,
              },
              yourAnswer: {
                type: String,
                required: false,
              },
            },
          ],
        },
        date: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
    required: false,
  },
  isCustom: { type: Boolean, required: false, default: false },
  owner: { type: String, required: false, default: "" },
  topic: { type: String, required: false, default: "" },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: false,
    default: "medium",
  },
  customSubtopics: [
    {
      name: { type: String, required: true },
      questionCount: { type: Number, required: true, default: 1 },
    },
  ],
});

// In Next.js dev, the model is cached on the mongoose connection across hot
// reloads. If the schema changes, the stale cached model would silently strip
// the new fields (mongoose strict mode). Delete the cached model so the current
// schema always applies.
if (mongoose.models.Assignment) {
  delete mongoose.models.Assignment;
}

export default model("Assignment", schema);
