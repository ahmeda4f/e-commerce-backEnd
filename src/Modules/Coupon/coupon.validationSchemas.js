import Joi from "joi";
import { Types } from "mongoose";

const idVlidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid id");
};

export const addCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().required().alphanum(),
    couponAmount: Joi.number().required().min(1),
    fromDate: Joi.date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .required(),
    toDate: Joi.date().greater(Joi.ref("fromDate")).required(),
    isFixed: Joi.boolean(),
    isPercentage: Joi.boolean(),
    Users: Joi.array().items(
      Joi.object({
        userId: Joi.string().required(),
        maxUsage: Joi.number().required().min(1),
      })
    ),
  }),
};

export const updateCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().alphanum(),
    couponAmount: Joi.number().min(1),
    fromDate: Joi.date().greater(Date.now() - 24 * 60 * 60 * 1000),
    toDate: Joi.date().greater(Joi.ref("fromDate")),
    isFixed: Joi.boolean(),
    isPercentage: Joi.boolean(),
    Users: Joi.array().items(
      Joi.object({
        userId: Joi.string(),
        maxUsage: Joi.number().min(1),
      })
    ),
  }),
  params: Joi.object({
    couponId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const getAllCouponsFeaturesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(0),
    size: Joi.number().integer().min(1).max(100),
    sort: Joi.string().valid("asc", "desc"),
    searchOptions: Joi.string(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const getCouponSchema = {
  params: Joi.object({
    couponId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const disableEnableSchema = {
  params: Joi.object({
    couponId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};
