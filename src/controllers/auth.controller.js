const UserModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function googleLoginUserController(req, res) {
  const { username, email, picture } = req.body;

  if (!username || !email || !picture) {
    return res
      .status(400)
      .json({ message: "Please provide username, email and picture" });
  }

  const isUserAlreadyExists = await UserModel.findOne({ email });

  if (isUserAlreadyExists) {
    const token = jwt.sign(
      {
        id: isUserAlreadyExists._id,
        email: isUserAlreadyExists.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10h" },
    );

    res.cookie("token", token, {
      httpOnly: true, //  Prevents XSS (JS can't read it)
      secure: process.env.NODE_ENV === "production", // 🔒 Required for HTTPS (Vercel)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //  Cross-origin support
      maxAge: 10 * 60 * 60 * 1000, // ️ 10 hours (matches JWT expiresIn)
      path: "/",
    });
    return res.status(200).json({
      message: "User authenticated successfully",
      user: {
        id: isUserAlreadyExists._id,
        email: isUserAlreadyExists.email,
        username: isUserAlreadyExists.username,
        picture: isUserAlreadyExists.picture,
      },
    });
  }
  const user = new UserModel({
    username,
    email,
    picture,
  });
  const savedUser = await user.save();
  const token = jwt.sign(
    {
      id: savedUser._id,
      email: savedUser.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "10h" },
  );

  res.cookie("token", token, {
    httpOnly: true, //  Prevents XSS (JS can't read it)
    secure: process.env.NODE_ENV === "production", // 🔒 Required for HTTPS (Vercel)
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //  Cross-origin support
    maxAge: 10 * 60 * 60 * 1000, // ️ 10 hours (matches JWT expiresIn)
    path: "/",
  });

  res.status(201).json({
    message: "User authenticated successfully",
    user: {
      id: savedUser._id,
      email: savedUser.email,
      username: savedUser.username,
      picture: user.picture,
    },
  });
}

async function logoutUserController(req, res) {
  const token = req.cookies.token;
  if (token) {
    const blacklistToken = new tokenBlacklistModel({ token });
    await blacklistToken.save();
  }
  res.clearCookie("token");
  res.status(201).json({ message: "User is logged out" });
}

async function getMeController(req, res) {
  const user = await UserModel.findById(req.user.id);

  res.status(201).json({
    message: "User details fetched successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      picture: user.picture,
    },
  });
}

module.exports = {
  googleLoginUserController,
  logoutUserController,
  getMeController,
};
