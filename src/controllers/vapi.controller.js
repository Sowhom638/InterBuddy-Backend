const { generateMockInterviewText } = require("../services/ai.service");
const VapiInterviewReportModel = require("../models/InterviewReport.model");
async function generateReportController(req, res) {
  const { type, role, level, techStack, amount, userId } = req.body;

  try {
    const questions = await generateMockInterviewText();
    const vapiInterviewReport = new VapiInterviewReportModel({
      user: req.user.id,
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions,
      finalized: true,
    });
    const savedVapiInterviewReport = await vapiInterviewReport.save();
    res.status(201).json({
      message: "Mock nterview questions generated successfully.",
      mockInterviewReport: savedInterviewReport,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error while generating mock interview questions." });
  }
}

module.exports = {
  generateReportController,
};
