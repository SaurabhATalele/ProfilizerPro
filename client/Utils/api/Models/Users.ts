import mongoose, { Document, Model } from "mongoose";
const Schema = mongoose.Schema;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/Utils/constants";

const secret = SECRET_KEY;

export interface IUser {
  username: string;
  name:string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  isValidPassword(newPassword: string): Promise<boolean>;
  GenerateToken(): Promise<string | undefined>;
}

export interface IUserModel extends Model<IUserDocument> {
  ValidateToken(token: string): Promise<unknown>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true
    },
    name:{
      type:String,
      required: false
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

UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (err: unknown) {
    next(err as Error);
  }
});

UserSchema.methods.isValidPassword = async function (newPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(newPassword, this.password);
  } catch (err) {
    console.log(err);
    return false;
  }
};

UserSchema.methods.GenerateToken = async function (): Promise<string | undefined> {
  try {
    const userId = this._id;
    const email = this.email;
    const username = this.username;
    const isAdmin = this.isAdmin;
    const user = { userId, email, username, isAdmin };
    return jwt.sign(user, secret as string);
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

UserSchema.statics.ValidateToken = function (token: string): unknown {
  try {
    return jwt.verify(token, secret as string);
  } catch (_error) {
    return false;
  }
};

export default (mongoose.models.User || mongoose.model<IUserDocument, IUserModel>("User", UserSchema)) as IUserModel;
