import Product from "../../../DB/Models/product.model.js";
import Review from "../../../DB/Models/review.model.js";

export const addReview = async (req, res, next) => {
  const { text, rate, productId } = req.body;

  const numericRate = parseFloat(rate);

  if (isNaN(numericRate) || numericRate < 1 || numericRate > 5) {
    return res.status(400).json({
      message: "Invalid rate value. Rate must be a number between 1 and 5.",
    });
  }

  if (!productId) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  let isReviewExist = await Review.findOne({
    user: req.userFound._id,
    product: productId,
  });

  if (isReviewExist) {
    return res.status(409).json({ message: "Review already exists" });
  }

  let reviewObject = {
    user: req.userFound._id,
    text,
    rate: numericRate,
    product: productId,
  };

  const productFirstReview = await Product.findOne({ totalUsersRated: 0 });

  if (productFirstReview) {
    productFirstReview.totalUsersRated = 1;
    productFirstReview.totalRate = numericRate;
    productFirstReview.rate =
      productFirstReview.totalRate / productFirstReview.totalUsersRated;
    await productFirstReview.save();
  }

  const productReviewed = await Product.findOne({
    totalUsersRated: { $gt: 0 },
  });

  if (productReviewed) {
    productReviewed.totalUsersRated++;
    productReviewed.totalRate += numericRate;
    productReviewed.rate =
      productReviewed.totalRate / productReviewed.totalUsersRated;
    if (productReviewed.rate > 5) {
      productReviewed.rate = 5;
    }
    if (productReviewed.rate < 1) {
      productReviewed.rate = 1;
    }
    await productReviewed.save();
  }

  let review = await Review.create(reviewObject);

  await review.save();

  return res.status(201).json({ message: "Review added successfully", review });
};

export const updateReview = async (req, res, next) => {
  let review = await Review.findOneAndUpdate(
    { _id: req.params.reviewId, user: req.userFound._id },
    req.body,
    { new: true }
  );

  if (!review)
    return res
      .status(404)
      .json({ message: "failed", error: "review not found" });

  const product = await Product.findOne({
    _id: review.product,
    totalUsersRated: { $gt: 0 },
  });
  product.totalRate += review.rate;
  product.rate = product.totalRate / product.totalUsersRated;

  if (product.rate > 5) {
    product.rate = 5;
  }
  if (product.rate < 1) {
    product.rate = 1;
  }
  await product.save();
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
  const product = await Product.findOne({
    _id: review.product,
    totalUsersRated: { $gt: 0 },
  });
  product.totalUsersRated--;
  product.totalRate -= review.rate;
  product.rate = product.totalRate / product.totalUsersRated;
  if (product.rate > 5) {
    product.rate = 5;
  }
  if (product.rate < 1) {
    product.rate = 1;
  }
  await product.save();

  return res.status(200).json({ message: "review deleted successfully" });
};
