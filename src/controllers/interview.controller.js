const InterviewReportModel = require("../models/InterviewReport.model");
const { generateInterviewReport } = require("../services/ai.service");
const { PDFParse } = require("pdf-parse");

async function generateInterviewReportController(req, res) {
  try {
    const parser = new PDFParse(Uint8Array.from(req.file.buffer));
    const result = await parser.getText();
    const resumeContent = result.text;
    const { selfDescription, jobDescription } = req.body;

    const interviewReportByAi = await generateInterviewReport({
      resume: resumeContent,
      selfDescription,
      jobDescription,
    });

    const interviewReport = new InterviewReportModel({
      user: req.user.id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      ...interviewReportByAi,
    });
    const savedInterviewReport = await interviewReport.save();

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport: savedInterviewReport,
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;

  const interviewReport = await InterviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });
  if (!interviewReport) {
    return res.status(404).json({ message: "Interview report is not found" });
  }
  return res
    .status(200)
    .json({
      message: "Interview report is fetched successfully",
      interviewReport,
    });
}

async function getAllInterviewReportController(req, res) {
  const interviewReports = await InterviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    );
  if (interviewReports?.length === 0) {
    return res.status(404).json({ message: "Interview reports are not found" });
  }
  return res
    .status(200)
    .json({
      message: "Interview reports are fetched successfully",
      interviewReports,
    });
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportController,
};
