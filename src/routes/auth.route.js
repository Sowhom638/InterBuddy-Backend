const express = require("express");
const authRouter = express.Router();
const {
    googleLoginUserController,
    logoutUserController,
    getMeController
} = require("../controllers/auth.controller");
const {authUser} = require("../middlewares/auth.middleware");
authRouter.post("/google-login", googleLoginUserController);
authRouter.get("/logout", authUser, logoutUserController);
authRouter.get("/get-me", authUser, getMeController);

module.exports = authRouter;