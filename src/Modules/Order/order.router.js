import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { authorization } from "../../Middlewares/authorization.js";
import { systemRoles } from "../../Utils/systemRoles.js";

import {
  cancelOrder,
  cartToOrder,
  createOrder,
  deliverOrder,
  generateInvoices,
  payWithStripe,
  refundPayment,
  stripeWebHookLocal,
} from "./order.controller.js";
import { validationHandler } from "../../Middlewares/validation.js";
import {
  cancelOrderSchema,
  cartToOrderSchema,
  createOrderSchema,
  deliverOrderSchema,
  generateInvoiceSchema,
  payWithStripeSchema,
  refundOrderSchema,
} from "./order.validationSchemas.js";

const router = Router();

router.post(
  "/createOrder",
  validationHandler(createOrderSchema),
  authorization(systemRoles.User),
  expressAsyncHandler(createOrder)
);

router.put(
  "/deliverOrder/:orderId",
  validationHandler(deliverOrderSchema),
  authorization(systemRoles.Delivery),
  expressAsyncHandler(deliverOrder)
);

router.post("/orderWebHook", expressAsyncHandler(stripeWebHookLocal));

router.post(
  "/cartToOrder",
  validationHandler(cartToOrderSchema),
  authorization(systemRoles.User),
  expressAsyncHandler(cartToOrder)
);

router.post(
  "/stripePay/:orderId",
  validationHandler(payWithStripeSchema),
  authorization(systemRoles.User),
  expressAsyncHandler(payWithStripe)
);

router.post(
  "/refundOrder/:orderId",
  validationHandler(refundOrderSchema),
  authorization([systemRoles.Admin, systemRoles.superAdmin]),
  expressAsyncHandler(refundPayment)
);

router.put(
  "/cancelOrder/:orderId",
  validationHandler(cancelOrderSchema),
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(cancelOrder)
);
router.post(
  "/generateInvoice/:orderId",
  validationHandler(generateInvoiceSchema),
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(generateInvoices)
);

export default router;
