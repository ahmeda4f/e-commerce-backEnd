import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "product",
    },
    rate: {
      type: Number,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
