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

const router = Router();

router.post(
  "/addSubCategory/:categoryId",
  authorization(systemRoles.superAdmin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(addSubCategory)
);

router.get(
  "/getAllSubCategories",
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getAllSubCategories)
);

router.get(
  "/getSubCategoryWithBrands/:subCategoryId",
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getSubCategoryWithBrands)
);

router.get(
  "/getSubCategory/:subCategoryId",
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getSubCategory)
);

router.put(
  "/updateSubCategory/:subCategoryId",
  authorization(systemRoles.superAdmin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(updateSubCategory)
);

router.delete(
  "/deleteSubCategory/:subCategoryId",
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(deleteSubCategory)
);

router.get(
  "/allSubCategoriesFeatures",
  authorization([systemRoles.superAdmin, systemRoles.Admin, systemRoles.User]),
  expressAsyncHandler(getAllSubCategoryFeatures)
);

export default router;
