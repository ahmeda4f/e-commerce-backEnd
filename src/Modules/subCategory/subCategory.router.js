import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { authorization } from "../../Middlewares/authorization.js";
import { multerMiddleHost } from "../../Middlewares/multer.js";
import { allowedExtensions } from "../../Utils/allowedExtensions.js";
import { systemRoles } from "../../Utils/systemRoles.js";

import {
  addSubCategory,
  deleteSubCategory,
  getAllSubCategories,
  getAllSubCategoryFeatures,
  getSubCategory,
  getSubCategoryWithBrands,
  updateSubCategory,
} from "./subCategory.controller.js";
import { validationHandler } from "../../Middlewares/validation.js";
import {
  addSubCategorySchema,
  deleteSubCategorySchema,
  getAllSubCategoriesSchema,
  idInParamsTokenInHeadersSchema,
  updateSubCategorySchema,
} from "./subCategory.validationSchemas.js";

const router = Router();

router.get(
  "/allSubCategoriesFeatures",
  authorization([systemRoles.superAdmin, systemRoles.Admin, systemRoles.User]),
  expressAsyncHandler(getAllSubCategoryFeatures)
);

router.get(
  "/getAllSubCategories",
  validationHandler(getAllSubCategoriesSchema),
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getAllSubCategories)
);

router.get(
  "/getSubCategoryWithBrands/:subCategoryId",
  validationHandler(idInParamsTokenInHeadersSchema),
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getSubCategoryWithBrands)
);

router.get(
  "/getSubCategory/:subCategoryId",
  validationHandler(idInParamsTokenInHeadersSchema),
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getSubCategory)
);

router.post(
  "/addSubCategory/:categoryId",
  validationHandler(addSubCategorySchema),
  authorization(systemRoles.superAdmin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(addSubCategory)
);

router.put(
  "/updateSubCategory/:subCategoryId",
  validationHandler(updateSubCategorySchema),
  authorization(systemRoles.superAdmin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(updateSubCategory)
);

router.delete(
  "/deleteSubCategory/:subCategoryId",
  validationHandler(deleteSubCategorySchema),
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(deleteSubCategory)
);

export default router;
