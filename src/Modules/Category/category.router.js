import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { authorization } from "../../Middlewares/authorization.js";
import { systemRoles } from "../../Utils/systemRoles.js";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getAllCategoriesFeatures,
  getAllSubCategoriesForCategory,
  getCategory,
  getCategoryWithBrands,
  updateCategory,
} from "./category.controller.js";
import { multerMiddleHost } from "../../Middlewares/multer.js";
import { allowedExtensions } from "../../Utils/allowedExtensions.js";
import { validationHandler } from "../../Middlewares/validation.js";
import {
  addCategorySchema,
  categoryIdInParamsAndTokenInHeadersSchema,
  deleteCategorySchema,
  getAllCategoriesSchema,
  updateCategorySchema,
} from "./category.validationSchemas.js";

const router = Router();
router.get(
  "/getAllCategories",
  validationHandler(getAllCategoriesSchema),
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getAllCategories)
);
router.delete(
  "/deleteCategory/:categoryId",
  validationHandler(deleteCategorySchema),
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(deleteCategory)
);

router.post(
  "/addCategory",
  validationHandler(addCategorySchema),
  authorization(systemRoles.superAdmin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(addCategory)
);
router.put(
  "/updateCategory/:categoryId",
  validationHandler(updateCategorySchema),
  authorization(systemRoles.superAdmin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(updateCategory)
);

router.get(
  "/getAllSubCategoriesForCategory/:categoryId",
  validationHandler(categoryIdInParamsAndTokenInHeadersSchema),
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getAllSubCategoriesForCategory)
);

router.get(
  "/getCategory/:categoryId",
  validationHandler(categoryIdInParamsAndTokenInHeadersSchema),
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getCategory)
);

router.get(
  "/getCategoryWithBrands/:categoryId",
  validationHandler(categoryIdInParamsAndTokenInHeadersSchema),
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getCategoryWithBrands)
);

router.get(
  "/allCategoriesFeatures",
  authorization([systemRoles.superAdmin, systemRoles.Admin, systemRoles.User]),
  expressAsyncHandler(getAllCategoriesFeatures)
);
export default router;
