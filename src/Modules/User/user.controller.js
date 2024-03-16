import bcrypt from "bcryptjs";

import User from "../../../DB/Models/user.model.js";
import sendEmailService from "../../services/send-email-service.js";
import jsonwebtoken from "jsonwebtoken";
import nodemailer from "nodemailer";

export const addUser = async (req, res) => {
  const { userName, email, password, phoneNumber, address, role, age } =
    req.body;

  const isEmailDuplicate = await User.findOne({ email });
  if (isEmailDuplicate) {
    return res.status(409).json({
      message: "Email already in use",
    });
  }

  const token = jsonwebtoken.sign({ email }, process.env.SECRET, {
    expiresIn: "60s",
  });

  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Email Verification",
    message: `<h2>please click on this link to verify your email</h2>
    <a href="http://localhost:3700/verifyEmail?token=${token}">verify email</a>
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
  const decoded = jsonwebtoken.verify(token, process.env.SECRET);
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
        email,
      },
      process.env.SECRET,
      { expiresIn: "60s" }
    );
    const refreshToken = await jsonwebtoken.sign(
      { email },
      process.env.SECRET,
      {
        expiresIn: "1y",
      }
    );
    refreshTokens.push(refreshToken);
    user.isLoggedIn = true;
    await user.save();
    return res
      .status(200)
      .json({ message: "Login successful", token, refreshToken });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
};

let refreshTokens = [];
export const generateAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      message: "Refresh token is required",
    });
  }
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }
  console.log(refreshTokens);
  const decoded = jsonwebtoken.verify(refreshToken, process.env.SECRET);
  const token = jsonwebtoken.sign(
    {
      email: decoded.email,
    },
    process.env.SECRET,
    { expiresIn: "60s" }
  );
  return res.status(200).json({ token });
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

export const softDelete = async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId, isDeleted: false });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  user.isDeleted = true;
  await user.save();
  return res.status(200).json({ message: "User deleted successfully" });
};

export const updatePassword = async (req, res) => {
  const userId = req.userFound._id;
  const { password } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const hashedPasswordUpdate = bcrypt.hashSync(
    password,
    parseInt(process.env.saltingNumber, 10)
  );
  user.password = hashedPasswordUpdate;
  const updatedPass = await user.save();
  if (updatedPass) {
    return res.status(200).json({
      message: "password updated successfully",
    });
  }
  return res.status(400).json({
    message: "error updating password",
  });
};

export const forgotPassword = async (req, res, next) => {
  if (!req.body.email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  const otpExpire = new Date();
  otpExpire.setMinutes(otpExpire.getMinutes() + 2);

  await User.updateOne({ email: req.body.email }, { $set: { otp, otpExpire } });

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: req.body.email,
    subject: "Password reset OTP",
    text: `Your OTP . It expires after 2 minutes : ${otp}`,
  };

  await transporter.sendMail(mailOptions);

  res.json({
    data: "Your OTP has been sent to the email",
  });
};

export const resetPassword = async (req, res, next) => {
  const { password, confirmPassword, otp } = req.body;
  if (!otp || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ message: "otp, password and confirmPassword are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords doesn't match" });
  }

  const user = await User.findOne({
    otp,
    otpExpire: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  const hashedPasswordUpdate = bcrypt.hashSync(password, 10);

  user.password = hashedPasswordUpdate;
  user.otp = null;
  user.otpExpire = null;
  await user.save();

  res.json({
    data: "Password reset successfully",
  });
};
