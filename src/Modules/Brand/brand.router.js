import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { authorization } from "../../Middlewares/authorization.js";
import { systemRoles } from "../../Utils/systemRoles.js";
import { multerMiddleHost } from "../../Middlewares/multer.js";
import { allowedExtensions } from "../../Utils/allowedExtensions.js";

import {
  addBrand,
  deleteBrand,
  getAllBrands,
  getAllBrandsFeatures,
  updateBrand,
} from "./brand.controller.js";
import { validationHandler } from "../../Middlewares/validation.js";
import {
  addBrandSchema,
  deleteBrandSchema,
  updateBrandSchema,
} from "./brand.validationSchemas.js";
import { tokenInHeadersSchema } from "../User/user.validataionSchemas.js";

const router = Router();

router.post(
  "/addBrand",
  validationHandler(addBrandSchema),
  authorization(systemRoles.Admin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(addBrand)
);

router.put(
  "/updateBrand/:brandId",
  validationHandler(updateBrandSchema),
  authorization(systemRoles.Admin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(updateBrand)
);

router.get(
  "/getAllBrands",
  validationHandler(tokenInHeadersSchema),
  authorization([systemRoles.Admin, systemRoles.superAdmin]),
  expressAsyncHandler(getAllBrands)
);
router.delete(
  "/deleteBrand/:brandId",
  validationHandler(deleteBrandSchema),
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  expressAsyncHandler(deleteBrand)
);

router.get(
  "/allBrandsFeatures",
  authorization([systemRoles.superAdmin, systemRoles.Admin, systemRoles.User]),
  expressAsyncHandler(getAllBrandsFeatures)
);

export default router;
