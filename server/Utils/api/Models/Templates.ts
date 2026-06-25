import mongoose, { Schema, model } from "mongoose";

const schema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  template: {
    type: String,
    ref: "Template",
    required: true,
  },
});

export default mongoose.models.template || model("template", schema);
