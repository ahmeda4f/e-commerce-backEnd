import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { authorization } from "../../Middlewares/authorization.js";
import { systemRoles } from "../../Utils/systemRoles.js";

import {
  addReview,
  deleteReview,
  getAllReviewsForProduct,
  updateReview,
} from "./review.controller.js";
import { validationHandler } from "../../Middlewares/validation.js";
import {
  addReviewSchema,
  deleteReviewSchema,
  getAllReviewsForProductSchema,
  updateReviewSchema,
} from "./review.validationSchemas.js";

const router = Router();

router.post(
  "/addReview",
  validationHandler(addReviewSchema),
  authorization(systemRoles.User),
  expressAsyncHandler(addReview)
);

router.get(
  "/getAllReviewsForProduct/:productId",
  validationHandler(getAllReviewsForProductSchema),
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(getAllReviewsForProduct)
);

router.delete(
  "/deleteReview/:reviewId",
  validationHandler(deleteReviewSchema),
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(deleteReview)
);

router.put(
  "/updateReview/:reviewId",
  validationHandler(updateReviewSchema),
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(updateReview)
);
export default router;
