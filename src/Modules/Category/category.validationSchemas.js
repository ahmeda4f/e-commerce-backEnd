import Joi from "joi";

import { Types } from "mongoose";

const idVlidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid id");
};

export const getAllCategoriesSchema = {
  headers: Joi.object({
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
};

export const deleteCategorySchema = {
  params: Joi.object({
    categoryId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
};

export const addCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(15),
  }),
  headers: Joi.object({
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
};

export const updateCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(15),
    oldPublicId: Joi.string(),
  }),
  params: Joi.object({
    categoryId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
};

export const categoryIdInParamsAndTokenInHeadersSchema = {
  params: Joi.object({
    categoryId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
};
