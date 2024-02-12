import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { systemRoles } from "../../Utils/systemRoles.js";
import { authorization } from "../../Middlewares/authorization.js";
import { multerMiddleHost } from "../../Middlewares/multer.js";
import { allowedExtensions } from "../../Utils/allowedExtensions.js";

import {
  addProduct,
  getAllProducts,
  updateProduct,
} from "./product.controller.js";

const router = Router();

router.get("/allProducts", getAllProducts);

router.post(
  "/addProduct",
  authorization([systemRoles.Admin, systemRoles.superAdmin]),
  multerMiddleHost({ extensions: allowedExtensions.image }).array("image", 3),
  expressAsyncHandler(addProduct)
);

router.put(
  "/updateProduct/:productId",
  authorization([systemRoles.Admin, systemRoles.superAdmin]),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(updateProduct)
);
export default router;
