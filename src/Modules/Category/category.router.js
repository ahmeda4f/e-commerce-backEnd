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

const router = Router();
router.get(
  "/getAllCategories",
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getAllCategories)
);
router.delete(
  "/deleteCategory/:categoryId",
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(deleteCategory)
);

router.post(
  "/addCategory",
  authorization(systemRoles.superAdmin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(addCategory)
);
router.put(
  "/updateCategory/:categoryId",
  authorization(systemRoles.superAdmin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(updateCategory)
);

router.get(
  "/getAllSubCategoriesForCategory/:categoryId",
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getAllSubCategoriesForCategory)
);

router.get(
  "/getCategory/:categoryId",
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getCategory)
);

router.get(
  "/getCategoryWithBrands/:categoryId",
  authorization(systemRoles.superAdmin),
  expressAsyncHandler(getCategoryWithBrands)
);

router.get(
  "/allCategoriesFeatures",
  authorization([systemRoles.superAdmin, systemRoles.Admin, systemRoles.User]),
  expressAsyncHandler(getAllCategoriesFeatures)
);
export default router;
