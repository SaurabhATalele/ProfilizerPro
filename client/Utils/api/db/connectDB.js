import mongoose from "mongoose";

const connectdb = async () => {
  try {
    console.log(process.env.NEXT_PUBLIC_MONGO_URI);
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI || "", {});
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectdb;
