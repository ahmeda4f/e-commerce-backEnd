import Product from "../../../DB/Models/product.model.js";
import Review from "../../../DB/Models/review.model.js";

export const addReview = async (req, res, next) => {
  const { text, rate, productId } = req.body;
  if (!productId) {
    return res.status(400).json({
      message: "product id is required",
    });
  }
  let isReviewExist = await Review.findOne({
    user: req.userFound._id,
    product: productId,
  });
  if (isReviewExist)
    return res.status(409).json({ message: "review already exist" });

  let reviewObject = {
    user: req.userFound._id,
    text,
    rate,
    product: productId,
  };
  let review = await Review.create(reviewObject);
  await review.save();
  return res.status(201).json({ message: "review added successfully", review });
};

export const updateReview = async (req, res, next) => {
  let review = await Review.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );

  if (!review)
    return res
      .status(404)
      .json({ message: "failed", error: "review not found" });

  return res.status(200).json({
    message: "updated review successfully",
  });
};

export const getAllReviewsForProduct = async (req, res) => {
  const { productId } = req.params;
  const productFound = await Product.findById(productId);
  if (!productFound) {
    return res.status(404).json({ message: "Product not found" });
  }
  const reviews = await Review.find({ product: productId });
  return res.status(200).json({ reviews });
};

export const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findOneAndDelete({
    _id: reviewId,
    user: req.userFound._id,
  });
  if (!review) {
    return res.status(404).json({ message: "review not found" });
  }
  return res.status(200).json({ message: "review deleted successfully" });
};
