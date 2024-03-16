import Joi from "joi";
import { Types } from "mongoose";

const idValidation = (value, helpers) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helpers.error("any.invalid");
};

export const addProductSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().required(),
    desc: Joi.string().required(),
    basePrice: Joi.number().required().min(0),
    discount: Joi.number().required().min(0),
    stock: Joi.number().required().min(0),
    specs: Joi.object().required(),
  }),
  query: Joi.object({
    categoryId: Joi.string().custom(idValidation).required(),
    subCategoryId: Joi.string().custom(idValidation).required(),
    brandId: Joi.string().custom(idValidation).required(),
  }),
});

export const updateProductSchema = Joi.object({
  body: Joi.object({
    title: Joi.string(),
    desc: Joi.string(),
    basePrice: Joi.number(),
    discount: Joi.number(),
    stock: Joi.number(),
    specs: Joi.object(),
    oldPublicId: Joi.string(),
  }),
  params: Joi.object({
    productId: Joi.string().custom(idValidation).required(),
  }),
});

export const getAllProductsSchema = {
  headers: Joi.object({
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
};
