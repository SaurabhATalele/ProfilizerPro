import mongoose from "mongoose";
const Schema = mongoose.Schema;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/Utils/constants";
// import dotenv from 'dotenv'
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// dotenv.config();

const secret = SECRET_KEY;
// defining the schema for the user model
const User = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  email: {
    type: String,
    required: true,
    validator: function (v) {
      return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  organization: {
    type: String,
  },
  dateJoined: {
    type: Date,
    default: Date.now,
  },
});

// before saving the details of the user, we will encrypt the password of the user using bcryptjs
User.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

// To login, we need the validation mechanism that we will provide from here
User.methods.isValidPassword = async function (newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password);
  } catch (err) {
    console.log(err);
  }
};

// to Generate the auth token thathas to be stored in the users login or used as the auth token in header
User.methods.GenerateToken = async function () {
  try {
    const userId = this._id;
    const email = this.email;
    const organization = this.organization;
    const user = { userId, email, organization };
    console.log(organization);
    return await jwt.sign(user, secret);
  } catch (err) {
    console.log(err);
  }
};

// to validate the token sent by the user with our system
User.methods.ValidateToken = async function (token) {
  try {
    return await jwt.verify(token, secret);
  } catch (error) {
    return false;
  }
};

// export the model
export default mongoose.models.User || mongoose.model("User", User);
