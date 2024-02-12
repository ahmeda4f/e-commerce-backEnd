import bcrypt from "bcryptjs";

import User from "../../../DB/Models/user.model.js";
import sendEmailService from "../../services/send-email-service.js";
import jsonwebtoken from "jsonwebtoken";

export const addUser = async (req, res) => {
  const { userName, email, password, phoneNumber, address, role, age } =
    req.body;

  const isEmailDuplicate = await User.findOne({ email });
  if (isEmailDuplicate) {
    return res.status(409).json({
      message: "Email already in use",
    });
  }

  const userToken = jsonwebtoken.sign({ email }, "secret");
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Email Verification",
    message: `<h2>please click on this link to verify your email</h2>
    <a href="http://localhost:3700/verifyEmail?token=${userToken}">verify email</a>
    `,
  });
  if (!isEmailSent) {
    return res.status(400).json({
      message: "error sending email",
    });
  }
  const hashedPassword = bcrypt.hashSync(
    password,
    parseInt(process.env.SALTINGNUMBER, 10)
  );
  const newUser = await User.create({
    userName,
    age,
    email,
    password: hashedPassword,
    phoneNumber,
    address,
    role,
  });
  if (!newUser) {
    return res.status(401).json({
      message: "error creating user",
    });
  }
  return res.status(200).json({
    message: "success",
    user: newUser,
  });
};
export const verifyEmail = async (req, res) => {
  console.log("here");
  const { token } = req.query;
  const decoded = jsonwebtoken.verify(token, "secret");
  const user = await User.findOneAndUpdate(
    { email: decoded.email, isEmailVerified: false },
    { isEmailVerified: true },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  return res.status(200).json({
    message: "Email verified successfully",
    user,
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required for login",
    });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const passwordCorrect = bcrypt.compareSync(password, user.password);

  if (passwordCorrect) {
    const token = jsonwebtoken.sign(
      {
        id: user._id,
        userEmail: user.email,
      },
      "secret"
    );
    user.isLoggedIn = true;
    await user.save();
    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
};

export const getAccountData = async (req, res) => {
  const userFound = await User.findOne({ _id: req.userFound._id });

  if (userFound) {
    return res.status(200).json({
      message: "Account data retrieved successfully",
      data: userFound,
    });
  } else {
    return res.status(404).json({ message: "Failed to find user account" });
  }
};

export const deleteUser = async (req, res) => {
  const deletedUser = await User.findOneAndDelete({
    _id: req.userFound._id,
  });
  if (deletedUser) {
    return res.status(200).json({ message: "User deleted successfully" });
  } else {
    return res.status(404).json({ message: "Failed to delete User" });
  }
};

export const updateUser = async (req, res) => {
  const { userName, email, password, phoneNumber, address, role, age } =
    req.body;

  console.log(userName);
  if (email) {
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(401).json({
        message: "Email already exists",
      });
    }
  } else {
    const user = await User.findOne({
      _id: req.userFound._id,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userName) user.userName = userName;
    if (address) user.address = address;
    if (role) user.role = role;
    if (age) user.age = age;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (password) {
      const hashedPasswordUpdate = bcrypt.hashSync(
        password,
        parseInt(process.env.SALTINGNUMBER, 10)
      );
      user.password = hashedPasswordUpdate;
    }

    const updatedUser = await user.save();

    return res
      .status(200)
      .json({ message: "User updated successfully", updatedUser });
  }
};
