import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { systemRoles } from "../../Utils/systemRoles.js";
import { authorization } from "../../Middlewares/authorization.js";
import { multerMiddleHost } from "../../Middlewares/multer.js";
import { allowedExtensions } from "../../Utils/allowedExtensions.js";

import {
  addProduct,
  getAllProducts,
  getAllProductsFeatures,
  updateProduct,
} from "./product.controller.js";
import { validationHandler } from "../../Middlewares/validation.js";
import {
  addProductSchema,
  getAllProductsSchema,
  updateProductSchema,
} from "./product.validationSchemas.js";

const router = Router();

router.get(
  "/allProducts",
  validationHandler(getAllProductsSchema),
  authorization([systemRoles.Admin, systemRoles.superAdmin, systemRoles.User]),
  getAllProducts
);

router.get("/allProductsFeatures", getAllProductsFeatures);

router.post(
  "/addProduct",
  validationHandler(addProductSchema),
  authorization([systemRoles.Admin, systemRoles.superAdmin]),
  multerMiddleHost({ extensions: allowedExtensions.image }).array("image", 3),
  expressAsyncHandler(addProduct)
);

router.put(
  "/updateProduct/:productId",
  validationHandler(updateProductSchema),
  authorization([systemRoles.Admin, systemRoles.superAdmin]),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(updateProduct)
);
export default router;
