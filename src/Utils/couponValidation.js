import { DateTime } from "luxon";
import Coupon from "../../DB/Models/coupon.model.js";
import CouponUsers from "../../DB/Models/couponUsers.model.js";

/**
 * Validates a coupon for a specific user
 * @param {string} code - The coupon code to validate
 * @param {string} userId - The ID of the user
 * @returns {Object} - The coupon if valid, or an error object if invalid
 */
export const couponValidation = async (code, userId) => {
  // Find the coupon in the database
  const couponFound = await Coupon.findOne({
    couponCode: code,
    couponDisabled: false,
  });

  // If the coupon is not found, return an error
  if (!couponFound) {
    return {
      message: "Coupon not found",
      status: 404,
    };
  }

  // If the coupon is expired, return an error
  if (
    couponFound.couponStatus === "expired" ||
    DateTime.fromISO(couponFound.toDate) < DateTime.now()
  ) {
    return {
      message: "coupon expired",
      status: 400,
    };
  }

  // If the coupon is not yet valid, return an error
  if (DateTime.fromISO(couponFound.fromDate) > DateTime.now()) {
    return {
      message: "coupon not yet valid",
      status: 400,
    };
  }

  // Check if the user has the coupon
  const couponUsersFound = await CouponUsers.findOne({
    couponId: couponFound._id,
    userId,
  });

  // If the user doesn't have the coupon, return an error
  if (!couponUsersFound) {
    return {
      message: "user doesn't have that coupon",
      status: 409,
    };
  }

  // If the coupon usage limit is reached, return an error
  if (couponUsersFound.usageCount >= couponUsersFound.maxUsage) {
    return {
      message: "coupon limit reached",
      status: 400,
    };
  }

  // Return the valid coupon
  return couponFound;
};
