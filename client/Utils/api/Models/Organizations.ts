import mongoose, { Schema } from "mongoose";

const organizationSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export default mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);
