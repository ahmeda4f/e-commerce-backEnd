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
import {
  addCouponSchema,
  disableEnableSchema,
  getAllCouponsFeaturesSchema,
  getCouponSchema,
  updateCouponSchema,
} from "./coupon.validationSchemas.js";
import { validationHandler } from "../../Middlewares/validation.js";
import {
  idInParamsSchema,
  tokenInHeadersSchema,
} from "../User/user.validataionSchemas.js";

const router = Router();

router.post(
  "/addCoupon",
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  validationHandler(addCouponSchema),
  expressAsyncHandler(addCoupon)
);

router.put(
  "/updateCoupon/:couponId",
  validationHandler(updateCouponSchema),
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  expressAsyncHandler(updateCoupon)
);

router.get(
  "/validateCoupon",
  authorization([systemRoles.superAdmin, systemRoles.Admin, systemRoles.User]),
  expressAsyncHandler(validateCoupon)
);

router.get(
  "/getCoupon/:couponId",
  validationHandler(getCouponSchema),
  authorization([systemRoles.superAdmin, systemRoles.Admin, systemRoles.User]),
  expressAsyncHandler(getCoupon)
);

router.get(
  "/getEnabledCoupons",
  validationHandler(tokenInHeadersSchema),
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  expressAsyncHandler(getAllEnabledCoupons)
);

router.get(
  "/getDisabledCoupons",
  validationHandler(tokenInHeadersSchema),
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  expressAsyncHandler(getAllDiabledCoupons)
);

router.put(
  "/disableOrEnableCoupon/:couponId",
  validationHandler(disableEnableSchema),
  authorization([systemRoles.superAdmin, systemRoles.Admin]),
  expressAsyncHandler(disableOrEnableCoupon)
);

router.get(
  "/allCouponsFeatures",
  // validationHandler(getAllCouponsFeaturesSchema),
  authorization([systemRoles.superAdmin, systemRoles.Admin, systemRoles.User]),
  expressAsyncHandler(getAllCouponsFeatures)
);
export default router;
