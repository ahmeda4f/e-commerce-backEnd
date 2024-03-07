import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { systemRoles } from "../../Utils/systemRoles.js";
import { authorization } from "../../Middlewares/authorization.js";

import {
  addCoupon,
  disableOrEnableCoupon,
  getAllCouponsFeatures,
  getAllDiabledCoupons,
  getAllEnabledCoupons,
  getCoupon,
  updateCoupon,
  validateCoupon,
} from "./coupon.controller.js";
import { addCouponSchema } from "./coupon.validationSchemas.js";
import { validationHandler } from "../../Middlewares/validation.js";

const router = Router();

router.post(
  "/addCoupon",
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  validationHandler(addCouponSchema),
  expressAsyncHandler(addCoupon)
);

router.put(
  "/updateCoupon/:couponId",
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  validationHandler(addCouponSchema),
  expressAsyncHandler(updateCoupon)
);

router.get(
  "/validateCoupon",
  authorization([systemRoles.superAdmin, systemRoles.Admin, systemRoles.User]),
  expressAsyncHandler(validateCoupon)
);

router.get(
  "/getCoupon/:couponId",
  authorization([systemRoles.superAdmin, systemRoles.Admin, systemRoles.User]),
  expressAsyncHandler(getCoupon)
);

router.get(
  "/getEnabledCoupons",
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  expressAsyncHandler(getAllEnabledCoupons)
);

router.get(
  "/getDisabledCoupons",
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  expressAsyncHandler(getAllDiabledCoupons)
);

router.put(
  "/disableOrEnableCoupon/:couponId",
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  expressAsyncHandler(disableOrEnableCoupon)
);

router.get(
  "/allCouponsFeatures",
  authorization([systemRoles.superAdmin, systemRoles.Admin, systemRoles.User]),
  expressAsyncHandler(getAllCouponsFeatures)
);
export default router;
