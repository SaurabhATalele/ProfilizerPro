import { MONGO_URL } from "@/Utils/constants";
import mongoose from "mongoose";

const connection = {
  isConnected: false,
};
const connectdb = async () => {
  try {
    console.log(connection.isConnected);
    if (connection.isConnected) {
      console.log("Using existing connection");
      return;
    }
    await mongoose.connect(MONGO_URL || "", {});
    console.log(mongoose.connections[0].readyState);
    connection.isConnected = mongoose.connections[0].readyState ? true : false;
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectdb;
