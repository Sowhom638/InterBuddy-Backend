const express = require("express");
const vapiRouter = express.Router();
const { authUser } = require("../middlewares/auth.middleware");
const { generateReportController } = require("../controllers/vapi.controller");

vapiRouter.post("/", authUser, generateReportController);

module.exports = vapiRouter;