import Joi from "joi";
import { systemRoles } from "../../Utils/systemRoles.js";
import { Types } from "mongoose";

const idVlidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid id");
};

export const signUpSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(15).required().messages({
      "string.min": "first name must be at least 2 characters",
      "string.max": "first name must be at most 15 character",
    }),
    lastName: Joi.string().min(2).max(15).required().messages({
      "string.min": "last name must be at least 2 characters",
      "string.max": "last name must be at most 15 character",
    }),
    companyId: Joi.string().custom(idVlidation).required(),
    email: Joi.string()
      .email({ tlds: { allow: ["com", "yahoo", "org"] } })
      .required(),
    recoveryEmail: Joi.string()
      .email({ tlds: { allow: ["com", "yahoo", "org"] } })
      .required(),
    password: Joi.string().required(),
    DOB: Joi.date().required(),
    phoneNumber: Joi.string(),
    role: Joi.string().valid(systemRoles.User, systemRoles.CompanyHr).messages({
      "any.only": "Role must be either user or companyHr",
    }),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email({ tlds: { allow: ["com", "yahoo", "org"] } }),
    phoneNumber: Joi.string(),
    password: Joi.string().required(),
  }),
};

export const changePasswordSchema = {
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
  body: Joi.object({
    password: Joi.string().required(),
  }),
};

export const updateUserSchema = {
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
  body: Joi.object({
    firstName: Joi.string().min(2).max(7).alphanum().messages({
      "string.min": "your first name must be at least 2 characters",
      "string.max": "your first name must be at most 7 characters",
    }),
    lastName: Joi.string().min(2).max(8).alphanum().messages({
      "string.min": "your last name must be at least 2 characters",
      "string.max": "your first name must be at most 8 characters",
    }),
    companyId: Joi.string().custom(idVlidation),
    DOB: Joi.date(),
    email: Joi.string().email({ tlds: { allow: ["com", "yahoo", "org"] } }),

    recoveryEmail: Joi.string().email({
      tlds: { allow: ["com", "yahoo", "org"] },
    }),

    phoneNumber: Joi.string(),
  }),
};

export const tokenInHeadersSchema = {
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const idInParamsSchema = {
  params: Joi.object({
    id: Joi.string().custom(idVlidation).required(),
  }),
};

export const emailInParamsSchema = {
  params: Joi.object({
    recoveryEmail: Joi.string()
      .email({ tlds: { allow: ["com", "yahoo", "org"] } })
      .required(),
  }),
};
