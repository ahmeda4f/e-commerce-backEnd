import Joi from "joi";
import { Types } from "mongoose";

const idVlidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid id");
};

export const addSubCategorySchema = {
  body: Joi.object({
    name: Joi.string(),
  }).unknown(true),
  params: Joi.object({
    categoryId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
};

export const updateSubCategorySchema = {
  body: Joi.object({
    name: Joi.string(),
    oldPublicId: Joi.string(),
  }),
  params: Joi.object({
    subCategoryId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
};

export const deleteSubCategorySchema = {
  params: Joi.object({
    subCategoryId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
};

export const getAllSubCategoriesSchema = {
  headers: Joi.object({
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
};

export const idInParamsTokenInHeadersSchema = {
  params: Joi.object({
    subCategoryId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string()
      .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
      .required(),
  }),
};
