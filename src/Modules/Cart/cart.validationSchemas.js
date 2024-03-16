import Joi from "joi";
import { Types } from "mongoose";

const idVlidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid id");
};

export const addProductToCartSchema = {
  body: Joi.object({
    productId: Joi.string().custom(idVlidation).required(),
    quantity: Joi.number().required().min(1),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const removeProductFromCartSchema = {
  params: Joi.object({
    productId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};
