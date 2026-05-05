const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
const authRouter = require("./routes/auth.route");
const interviewRouter = require("./routes/interview.route");
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
module.exports = app;
