import Joi from "joi";

import { Types } from "mongoose";
import { paymentMethods } from "../../Utils/paymentMethods.js";

const idVlidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid id");
};

export const createOrderSchema = {
  body: Joi.object({
    product: Joi.string().custom(idVlidation).required(),
    address: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    quantity: Joi.number().required().min(1),
    couponCode: Joi.string(),
    city: Joi.string(),
    postalCode: Joi.string(),
    country: Joi.string(),
    paymentMethod: Joi.string()
      .valid(paymentMethods.Cash, paymentMethods.Paymob, paymentMethods.Stripe)
      .required()
      .messages({
        "any.only": "payment method must be cash or paymob or stripe",
      }),
    phoneNumbers: Joi.array().items(Joi.string()),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const deliverOrderSchema = {
  params: Joi.object({
    orderId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const cartToOrderSchema = {
  body: Joi.object({
    address: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    couponCode: Joi.string(),
    city: Joi.string(),
    postalCode: Joi.string(),
    country: Joi.string(),
    paymentMethod: Joi.string()
      .valid(paymentMethods.Cash, paymentMethods.Paymob, paymentMethods.Stripe)
      .required()
      .messages({
        "any.only": "payment method must be cash or paymob or stripe",
      }),
    phoneNumbers: Joi.array().items(Joi.string()),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const payWithStripeSchema = {
  params: Joi.object({
    orderId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const cancelOrderSchema = {
  params: Joi.object({
    orderId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const refundOrderSchema = {
  params: Joi.object({
    orderId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const generateInvoiceSchema = {
  params: Joi.object({
    orderId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};
