import { MONGO_URL } from "@/Utils/constants";
import mongoose from "mongoose";

const connectdb = async () => {
  try {
    await mongoose.connect(MONGO_URL || "", {});
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectdb;
