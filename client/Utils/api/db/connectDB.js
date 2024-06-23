import { MONGO_URL } from "@/Utils/constants";
import mongoose from "mongoose";

const connectdb = async () => {
  const connection = {};

  try {
    if (connection.isConnected) {
      console.log("Using existing connection");
      return;
    }
    await mongoose.connect(MONGO_URL || "", {});
    connection.isConnected = mongoose.connections[0].readyState;
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectdb;
