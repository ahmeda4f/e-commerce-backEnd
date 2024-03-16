import { Router } from "express";

import { systemRoles } from "../../Utils/systemRoles.js";
import { addProductToCart, removeProductFromCart } from "./cart.controller.js";

import { authorization } from "../../Middlewares/authorization.js";
import expressAsyncHandler from "express-async-handler";
import { validationHandler } from "../../Middlewares/validation.js";
import {
  addProductToCartSchema,
  removeProductFromCartSchema,
} from "./cart.validationSchemas.js";

const router = Router();

router.post(
  "/addProductToCart",
  validationHandler(addProductToCartSchema),
  authorization(systemRoles.User),
  expressAsyncHandler(addProductToCart)
);

router.delete(
  "/removeProductFromCart/:productId",
  validationHandler(removeProductFromCartSchema),
  authorization(systemRoles.User),
  expressAsyncHandler(removeProductFromCart)
);

export default router;
