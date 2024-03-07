import moment from "moment";
import mongoose from "mongoose";
import { systemRoles } from "../../src/Utils/systemRoles.js";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 20,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minLength: 8,
    },

    phoneNumber: [
      {
        type: String,
        required: true,
        unique: true,
      },
    ],
    address: [
      {
        type: String,
        required: true,
      },
    ],
    role: {
      type: String,
      enum: [
        systemRoles.User,
        systemRoles.Admin,
        systemRoles.superAdmin,
        systemRoles.Delivery,
      ],
      default: systemRoles.User,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    age: {
      type: Number,
      min: 13,
      max: 90,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
