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
  updateBrand,
} from "./brand.controller.js";

const router = Router();

router.post(
  "/addBrand",
  authorization(systemRoles.Admin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(addBrand)
);
router.put(
  "/updateBrand/:brandId",
  authorization(systemRoles.Admin),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(updateBrand)
);

router.get(
  "/getAllBrands",
  authorization([systemRoles.Admin, systemRoles.superAdmin]),
  expressAsyncHandler(getAllBrands)
);
router.delete(
  "/deleteBrand/:brandId",
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  expressAsyncHandler(deleteBrand)
);

export default router;
