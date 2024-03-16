import { DateTime } from "luxon";
import Coupon from "../../../DB/Models/coupon.model.js";
import CouponUsers from "../../../DB/Models/couponUsers.model.js";
import User from "../../../DB/Models/user.model.js";

import { couponValidation } from "../../Utils/couponValidation.js";
import { ApiFeatures } from "../../Utils/apiFeatures.js";

/**
 * Add a new coupon
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
export const addCoupon = async (req, res) => {
  // Destructure request body
  const {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isFixed,
    isPercentage,
    Users,
  } = req.body;

  // Get the ID of the user adding the coupon
  const addedBy = req.userFound._id;

  // Check if the coupon code already exists
  const couponExist = await Coupon.findOne({ couponCode });
  if (couponExist) {
    return res.status(409).json({
      message: "Coupon code already exist",
    });
  }

  // Check if isFixed and isPercentage are both true or false
  if (isFixed == isPercentage) {
    return res.status(400).json({
      message: "Please select either Fixed or Percentage",
    });
  }

  // Check if coupon amount is greater than 100 when isPercentage is true
  if (isPercentage) {
    if (couponAmount > 100) {
      return res.status(400).json({
        message: "Coupon amount should not be greater than 100",
      });
    }
  }

  // Create coupon object
  const coupon = {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isFixed,
    isPercentage,
    addedBy,
  };

  // Get array of user IDs
  let usersArray = [];
  for (const user of Users) {
    usersArray.push(user.userId);
  }

  // Find users with the provided user IDs
  const usersFound = await User.find({ _id: { $in: usersArray } });

  // Check if all users were found
  if (usersFound.length !== usersArray.length) {
    return res.status(404).json({
      message: "Users not found",
    });
  }

  // Create new coupon
  const newCoupon = await Coupon.create(coupon);

  // Map user objects to include the new coupon ID
  const users = Users.map((user) => ({
    ...user,
    couponId: newCoupon._id,
  }));

  // Save new coupon ID to request object
  req.savedDocument = { model: Coupon, _id: newCoupon._id };

  // Create entries in the CouponUsers collection for the users
  const couponUsers = await CouponUsers.create(users);

  // Return success or error message
  if (newCoupon) {
    return res.status(201).json({
      message: "coupon added successfully",
      coupon: newCoupon,
    });
  }
  return res.status(400).json({
    message: "error adding coupon",
  });
};

/**
 * Validate a coupon and return the result
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
export const validateCoupon = async (req, res) => {
  // Extract couponCode and userId from the request body and userFound
  const { couponCode } = req.body;
  const userId = req.userFound._id;

  // Call couponValidation function to validate the coupon
  const { message, status } = await couponValidation(couponCode, userId);

  // Log the message and status
  console.log(message, status);

  // If validation is successful, return the message as JSON response
  if (message && status) {
    console.log(message, status);
    return res.status(status).json({
      message,
    });
  }

  // If validation fails, find the coupon details and return as JSON response
  const couponFound = await couponValidation(couponCode, userId);
  console.log(couponFound + "controller");
  return res.status(200).json({
    message: "done",
    couponFound,
  });
};

export const getCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const couponFound = await Coupon.findById(couponId);
  if (!couponFound) {
    return res.status(404).json({ message: "coupon not found" });
  }
  return res
    .status(200)
    .json({ message: "coupon found successfully", couponFound });
};

export const updateCoupon = async (req, res) => {
  const { couponId } = req.params;
  const {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isFixed,
    Users,
    isPercentage,
  } = req.body;
  let couponExist = await Coupon.findOne({ _id: couponId });
  if (!couponExist) {
    return res.status(404).json({
      message: "Coupon  not exist",
    });
  } else {
    // Get the ID of the user adding the coupon
    const updatedBy = req.userFound._id;

    // Check if isFixed and isPercentage are both true or false
    if (isFixed == isPercentage) {
      return res.status(400).json({
        message: "Please select either Fixed or Percentage",
      });
    }

    // Check if coupon amount is greater than 100 when isPercentage is true
    if (isPercentage) {
      if (couponAmount > 100) {
        return res.status(400).json({
          message: "Coupon amount should not be greater than 100",
        });
      }
    }

    if (couponCode) couponExist.couponCode = couponCode;
    if (couponAmount) couponExist.couponAmount = couponAmount;

    if (fromDate) couponExist.fromDate = fromDate;
    if (toDate) {
      couponExist.toDate = toDate;
      couponExist.couponStatus = "valid";
    }
    if (isFixed == true) {
      couponExist.isFixed = true;
      couponExist.isPercentage = false;
    }
    if (isPercentage == true) {
      couponExist.isPercentage = true;
      couponExist.isFixed = false;
    }

    couponExist.updatedBy = updatedBy;
    let users;
    if (Users) {
      // Get array of user IDs

      let usersArray = [];
      for (const user of Users) {
        usersArray.push(user.userId);
      }

      // Find users with the provided user IDs
      const usersFound = await User.find({ _id: { $in: usersArray } });

      // Check if all users were found
      if (usersFound.length !== usersArray.length) {
        return res.status(404).json({
          message: "Users not found",
        });
      }
    }

    const updatedCoupon = await couponExist.save();
    if (Users) {
      users = Users.map((user) => ({
        ...user,
        couponId: updatedCoupon._id,
      }));
    }

    // Save new coupon ID to request object
    req.savedDocument = { model: Coupon, _id: updatedCoupon._id };

    // Create entries in the CouponUsers collection for the users
    const couponUsers = await CouponUsers.create(users);
    return res.status(201).json({
      message: "Success",
      updatedCoupon,
    });
  }
};

export const disableOrEnableCoupon = async (req, res) => {
  const { couponId } = req.params;
  const couponFound = await Coupon.findById(couponId);
  if (!couponFound) {
    return res.status(404).json({ message: "coupon not found" });
  } else {
    if (couponFound.couponDisabled == true) {
      couponFound.couponDisabled = false;
      couponFound.enabledAt = DateTime.now();
      couponFound.enabledBy = req.userFound._id;
    } else if (couponFound.couponDisabled == false) {
      couponFound.couponDisabled = true;
      couponFound.disabledAt = DateTime.now();
      couponFound.disabledBy = req.userFound._id;
    }

    const updatedCoupon = await couponFound.save();
    if (updatedCoupon) {
      return res.status(200).json({
        message: "coupon updated successfully",
        updatedCoupon,
      });
    }
    return res.status(400).message({
      message: "error updating coupon",
    });
  }
};

export const getAllDiabledCoupons = async (req, res) => {
  const coupons = await Coupon.find({ couponDisabled: true });
  return res.status(200).json({ coupons });
};

export const getAllEnabledCoupons = async (req, res) => {
  const coupons = await Coupon.find({ couponDisabled: false });
  return res.status(200).json({ coupons });
};

export const getAllCouponsFeatures = async (req, res) => {
  // Destructure query parameters
  const { page, size, sort, ...searchOptions } = req.query;

  // Apply pagination and filter based on search options
  const apiFeatures = new ApiFeatures(req.query, Coupon.find())
    .pagination({
      page,
      size,
    })
    .filter(searchOptions)
    .sort(sort);

  // Log the page and size
  console.log(page + "" + size + "getAll");

  // Execute the query and return the coupons
  const coupons = await apiFeatures.mongooseQuery;
  return res.status(200).json({ coupons });
};
