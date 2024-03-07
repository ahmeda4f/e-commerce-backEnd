import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { authorization } from "../../Middlewares/authorization.js";
import { systemRoles } from "../../Utils/systemRoles.js";

import {
  cancelOrder,
  cartToOrder,
  createOrder,
  deliverOrder,
  payWithStripe,
  refundPayment,
  stripeWebHookLocal,
} from "./order.controller.js";

const router = Router();

router.post(
  "/createOrder",
  authorization(systemRoles.User),
  expressAsyncHandler(createOrder)
);

router.put(
  "/deliverOrder/:orderId",
  authorization(systemRoles.Delivery),
  expressAsyncHandler(deliverOrder)
);

router.post(
  "/cartToOrder",
  authorization(systemRoles.User),
  expressAsyncHandler(cartToOrder)
);

router.post(
  "/stripePay/:orderId",
  authorization(systemRoles.User),
  expressAsyncHandler(payWithStripe)
);

router.post("/orderWebHook", expressAsyncHandler(stripeWebHookLocal));

router.post(
  "/refundOrder/:orderId",
  authorization([systemRoles.Admin, systemRoles.superAdmin]),
  expressAsyncHandler(refundPayment)
);

router.put(
  "/cancelOrder/:orderId",
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(cancelOrder)
);
export default router;
