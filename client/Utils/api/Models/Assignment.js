// const { Schema, model } = require("mongoose");
import { Schema, model } from "mongoose";
import mongoose from "mongoose";
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
          validate: function (v) {
            return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
          },
        },
        score: {
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
                required: true,
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
});

module.exports = mongoose.models.Assignment || model("Assignment", schema);

// answers: {
//   type: [
//     {
//       question: {
//         type: String,
//         required: true,
//       },
//       answer: {
//         type: String,
//         required: true,
//       },
//       yourAnswer: {
//         type: String,
//         required: true,}
//     },
//     ],
//     required: false,

// },
