import Joi from "joi";
import { Types } from "mongoose";

const idVlidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid id");
};

export const addReviewSchema = {
  body: Joi.object({
    text: Joi.string().required(),
    rate: Joi.number().required().min(1).max(5),
    productId: Joi.string().custom(idVlidation).required(),
  }),
};

export const updateReviewSchema = {
  params: Joi.object({
    reviewId: Joi.string().custom(idVlidation).required(),
  }),
  body: Joi.object({
    text: Joi.string(),
    rate: Joi.number().min(1).max(5),
    productId: Joi.string().custom(idVlidation),
  }),
};

export const getAllReviewsForProductSchema = {
  params: Joi.object({
    productId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const deleteReviewSchema = {
  params: Joi.object({
    reviewId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};
