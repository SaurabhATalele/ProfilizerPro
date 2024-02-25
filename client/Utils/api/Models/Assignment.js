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
      },
      maxQuestions: {
        type: Number,
        required: true,
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
      },
    ],
    required: false,
  },
});

module.exports = mongoose.models.Assignment || model("Assignment", schema);
