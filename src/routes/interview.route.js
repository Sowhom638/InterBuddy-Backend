const express = require("express");
const interviewRouter = express.Router();
const { authUser } = require("../middlewares/auth.middleware");
const {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportController
} = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware")

interviewRouter.post("/", authUser, upload.single("resume"), generateInterviewReportController);
interviewRouter.get("/", authUser, getAllInterviewReportController);
interviewRouter.get("/report/:interviewId", authUser, getInterviewReportByIdController);

module.exports = interviewRouter;