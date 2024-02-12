import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { allowedExtensions } from "../../Utils/allowedExtensions.js";
import { authorization } from "../../Middlewares/authorization.js";
import { systemRoles } from "../../Utils/systemRoles.js";
import {
  addUser,
  deleteUser,
  getAccountData,
  login,
  updateUser,
  verifyEmail,
} from "./user.controller.js";

const router = Router();

// router.get("/allUsers", allUsers);

router.post("/signUp", expressAsyncHandler(addUser));
router.get("/verifyEmail", expressAsyncHandler(verifyEmail));
router.post("/login", expressAsyncHandler(login));

router.get(
  "/accountData",
  authorization([systemRoles.Admin, systemRoles.superAdmin, systemRoles.User]),
  expressAsyncHandler(getAccountData)
);
router.put(
  "/updateAccount",
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(updateUser)
);

router.delete(
  "/deleteAccount",
  authorization([systemRoles.User, systemRoles.superAdmin]),
  expressAsyncHandler(deleteUser)
);

export default router;
