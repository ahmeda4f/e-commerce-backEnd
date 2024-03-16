import Joi from "joi";
import { systemRoles } from "../../Utils/systemRoles.js";
import { Types } from "mongoose";

const idVlidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid id");
};

export const signUpSchema = {
  body: Joi.object({
    userName: Joi.string().min(2).max(15).required().messages({
      "string.min": "user name must be at least 2 characters",
      "string.max": "user name must be at most 15 character",
    }),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    age: Joi.number().min(16).max(100).required(),
    phoneNumber: Joi.string(),
    address: Joi.string().required(),
    role: Joi.string()
      .valid(
        systemRoles.User,
        systemRoles.Admin,
        systemRoles.superAdmin,
        systemRoles.Delivery
      )
      .messages({
        "any.only": "Role must be admin or superadmin or delivery or user",
      }),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
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
  headers: Joi.object({}),
  body: Joi.object({
    userName: Joi.string().min(2).max(15).alphanum().messages({
      "string.min": "your user Name must be at least 2 characters",
      "string.max": "your user Name must be at most 15 characters",
    }),
    age: Joi.number().min(16).max(100),
    email: Joi.string().email(),
    phoneNumber: Joi.string(),
    password: Joi.string(),
    address: Joi.string(),
    role: Joi.string()
      .valid(
        systemRoles.User,
        systemRoles.Admin,
        systemRoles.superAdmin,
        systemRoles.Delivery
      )
      .messages({
        "any.only": "Role must be admin or superadmin or delivery or user",
      }),
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

export const idInBodychema = {
  body: Joi.object({
    id: Joi.string().custom(idVlidation).required(),
  }),
};
export const emailInBodySchema = {
  body: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: ["com", "yahoo", "org"] } })
      .required(),
  }),
};

export const tokenInBodySchema = {
  body: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const refreshTokenInBodySchema = {
  body: Joi.object({
    refreshToken: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    password: Joi.string().required(),
    confirmPassword: Joi.string().required().valid(Joi.ref("password")),
    otp: Joi.number().required(),
  }),
};

export const softDeleteSchema = {
  params: Joi.object({
    userId: Joi.string().custom(idVlidation).required(),
  }),
  headers: Joi.object({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
    ),
  }),
};
