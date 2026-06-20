import mongoose from "mongoose";
const Schema = mongoose.Schema;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/Utils/constants";

const secret = SECRET_KEY;

const User = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

User.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (err: unknown) {
    next(err as Error);
  }
});

User.methods.isValidPassword = async function (newPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(newPassword, this.password);
  } catch (err) {
    console.log(err);
    return false;
  }
};

User.methods.GenerateToken = async function (): Promise<string | undefined> {
  try {
    const userId = this._id;
    const email = this.email;
    const username = this.username;
    const isAdmin = this.isAdmin;
    const user = { userId, email, username, isAdmin };
    return await jwt.sign(user, secret as string);
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

User.statics.ValidateToken = async function (token: string): Promise<unknown> {
  try {
    console.log(token);
    return await jwt.verify(token, secret as string);
  } catch (error) {
    return false;
  }
};

export default mongoose.models.User || mongoose.model("User", User);
