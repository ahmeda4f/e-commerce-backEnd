import { Router } from "express";

import { systemRoles } from "../../Utils/systemRoles.js";
import { addProductToCart, removeProductFromCart } from "./cart.controller.js";

import { authorization } from "../../Middlewares/authorization.js";
import expressAsyncHandler from "express-async-handler";

const router = Router();

router.post(
  "/addProductToCart",
  authorization(systemRoles.User),
  expressAsyncHandler(addProductToCart)
);

router.delete(
  "/removeProductFromCart/:productId",
  authorization(systemRoles.User),
  expressAsyncHandler(removeProductFromCart)
);

export default router;
