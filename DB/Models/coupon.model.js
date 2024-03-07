import mongoose, { Schema } from "mongoose";
const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },

    couponAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    couponStatus: {
      type: String,
      enum: ["valid", "expired"],
      default: "valid",
    },
    isFixed: {
      type: Boolean,
      default: false,
    },
    isPercentage: {
      type: Boolean,
      default: false,
    },

    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    fromDate: {
      type: String,
      required: true,
    },
    toDate: {
      type: String,
      required: true,
    },
    disabledAt: {
      type: String,
    },
    disabledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    enabledAt: {
      type: String,
    },
    enabledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    couponDisabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
