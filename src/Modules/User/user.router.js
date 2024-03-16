import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { authorization } from "../../Middlewares/authorization.js";
import { systemRoles } from "../../Utils/systemRoles.js";
import { validationHandler } from "../../Middlewares/validation.js";

import {
  addUser,
  deleteUser,
  forgotPassword,
  generateAccessToken,
  getAccountData,
  login,
  resetPassword,
  softDelete,
  updatePassword,
  updateUser,
  verifyEmail,
} from "./user.controller.js";

import {
  changePasswordSchema,
  emailInBodySchema,
  loginSchema,
  refreshTokenInBodySchema,
  resetPasswordSchema,
  signUpSchema,
  softDeleteSchema,
  tokenInHeadersSchema,
  updateUserSchema,
} from "./user.validataionSchemas.js";

const router = Router();

router.get(
  "/accountData",
  authorization([systemRoles.Admin, systemRoles.superAdmin, systemRoles.User]),
  expressAsyncHandler(getAccountData)
);
router.get("/verifyEmail", expressAsyncHandler(verifyEmail));

router.post(
  "/login",
  validationHandler(loginSchema),
  expressAsyncHandler(login)
);
router.post(
  "/signUp",
  validationHandler(signUpSchema),
  expressAsyncHandler(addUser)
);
router.post(
  "/forgotPassword",
  validationHandler(emailInBodySchema),
  expressAsyncHandler(forgotPassword)
);

router.post(
  "/generateAccessToken",
  // authorization([systemRoles.User, systemRoles.superAdmin, systemRoles.Admin]),
  validationHandler(refreshTokenInBodySchema),
  expressAsyncHandler(generateAccessToken)
);

router.post(
  "/resetPassword",
  validationHandler(resetPasswordSchema),
  expressAsyncHandler(resetPassword)
);

router.put(
  "/updateAccount",
  validationHandler(updateUserSchema),
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(updateUser)
);

router.put(
  "/updatePassword",
  validationHandler(changePasswordSchema),
  authorization(systemRoles.User),
  expressAsyncHandler(updatePassword)
);

router.delete(
  "/deleteAccount",
  validationHandler(tokenInHeadersSchema),
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(deleteUser)
);
router.delete(
  "/softDelete/:userId",
  validationHandler(softDeleteSchema),
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(softDelete)
);

export default router;
