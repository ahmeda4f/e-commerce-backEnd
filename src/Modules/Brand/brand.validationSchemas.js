import joi from "joi";

import { Types } from "mongoose";

const idVlidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid id");
};

export const deleteBrandSchema = {
  params: joi.object({
    brandId: joi.string().custom(idVlidation).required(),
  }),
  headers: joi.object({
    token: joi
      .string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
  }),
};

export const addBrandSchema = {
  body: joi.object({
    name: joi.string().min(2).max(15),
  }),
  headers: joi.object({
    token: joi
      .string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
  }),
  query: joi.object({
    subCategoryId: joi.string().custom(idVlidation).required(),
    categoryId: joi.string().custom(idVlidation).required(),
  }),
};

export const updateBrandSchema = {
  body: joi.object({
    name: joi.string(),
  }),
  headers: joi.object({
    token: joi
      .string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
  }),
  query: joi.object({
    subCategoryId: joi.string().custom(idVlidation),
    cateroryId: joi.string().custom(idVlidation),
  }),
};
