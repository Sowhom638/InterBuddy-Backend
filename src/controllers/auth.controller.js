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
      },
      process.env.JWT_SECRET,
      { expiresIn: "10h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 10 * 60 * 60 * 1000, // 10 hours
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
      id: savedUser._id
    },
    process.env.JWT_SECRET,
    { expiresIn: "10h" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 10 * 60 * 60 * 1000, // 10 hours
  });

  res.status(201).json({
    message: "User authenticated successfully",
    user: {
      id: savedUser._id,
      email: savedUser.email,
      username: savedUser.username,
      picture: savedUser.picture,
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
