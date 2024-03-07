import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { authorization } from "../../Middlewares/authorization.js";
import { systemRoles } from "../../Utils/systemRoles.js";

import {
  addReview,
  deleteReview,
  getAllReviewsForProduct,
} from "./review.controller.js";

const router = Router();

router.post(
  "/addReview",
  authorization(systemRoles.User),
  expressAsyncHandler(addReview)
);

router.get(
  "/getAllReviewsForProduct/:productId",
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(getAllReviewsForProduct)
);

router.delete(
  "/deleteReview/:reviewId",
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(deleteReview)
);
export default router;
