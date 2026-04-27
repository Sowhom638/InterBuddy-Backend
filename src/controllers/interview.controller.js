// backend/src/controllers/interview.controller.js
const mongoose = require("mongoose");
const InterviewReportModel = require("../models/InterviewReport.model");
const { generateInterviewReport } = require("../services/ai.service");
const pdfParse = require("pdf-parse");

async function generateInterviewReportController(req, res) {
  console.log(" [REQUEST] Generate Interview Report");
  console.log("  - Has file:", !!req.file);
  console.log("  - File name:", req.file?.originalname);
  console.log("  - Body keys:", Object.keys(req.body || {}));
  console.log("  - User:", req.user);

  try {
    // 1. Validate file
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ message: "Resume PDF is required" });
    }

    // 2. Parse PDF
    console.log("📄 Parsing PDF...");
    const pdfData = await pdfParse(req.file.buffer);
    const resumeContent = pdfData.text?.trim();
    
    if (!resumeContent) {
      console.error("❌ No text extracted from PDF");
      return res.status(400).json({ message: "Failed to extract text from PDF" });
    }
    console.log(`✅ PDF parsed (${resumeContent.length} characters)`);

    // 3. Get form data
    const { selfDescription, jobDescription } = req.body;
    console.log("📝 Form data:", {
      selfDescription: selfDescription?.substring(0, 50) + "...",
      jobDescription: jobDescription?.substring(0, 50) + "...",
    });

    if (!selfDescription || !jobDescription) {
      console.error("❌ Missing form fields");
      return res.status(400).json({
        message: "selfDescription and jobDescription are required",
        received: { selfDescription: !!selfDescription, jobDescription: !!jobDescription }
      });
    }

    // // 4. Validate user
    // if (!req.user?.id) {
    //   console.error("❌ No authenticated user");
    //   return res.status(401).json({ message: "Authentication required" });
    // }

    // 5. Call AI service
    console.log("🤖 Calling AI service...");
    let aiResult;
    try {
      aiResult = await generateInterviewReport({
        resume: resumeContent,
        selfDescription,
        jobDescription,
      });
      console.log("✅ AI service completed");
      console.log("  - AI result keys:", Object.keys(aiResult || {}));
    } catch (aiError) {
      console.error("❌ AI service failed:", aiError.message);
      throw new Error(`AI service error: ${aiError.message}`);
    }

    // 6. Create and save report
    console.log("💾 Creating MongoDB document...");
    const interviewReport = new InterviewReportModel({
      user: req.user.id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      ...aiResult,
    });

    console.log("💾 Saving to database...");
    const savedReport = await interviewReport.save();
    console.log("✅ Saved successfully! ID:", savedReport._id);

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport: savedReport,
    });
  } catch (error) {
    console.error("❌ GENERATE CONTROLLER ERROR:");
    console.error("  - Name:", error.name);
    console.error("  - Message:", error.message);
    console.error("  - Stack:", error.stack);

    res.status(500).json({
      message: "Failed to generate interview report",
      error: error.message,
      errorName: error.name,
    });
  }
}

async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;
    console.log("📥 [REQUEST] Get Report by ID:", interviewId);

    // Validate ID
    if (!interviewId || !mongoose.Types.ObjectId.isValid(interviewId)) {
      console.error("❌ Invalid ID:", interviewId);
      return res.status(400).json({ 
        message: "Invalid or missing interview ID",
        received: interviewId 
      });
    }

    const interviewReport = await InterviewReportModel.findOne({
      _id: interviewId,
      user: req.user?.id,
    });

    if (!interviewReport) {
      console.error("❌ Report not found");
      return res.status(404).json({ message: "Interview report not found" });
    }

    console.log("✅ Report found:", interviewReport._id);
    return res.status(200).json({
      message: "Interview report fetched successfully",
      interviewReport,
    });
  } catch (error) {
    console.error("❌ GET CONTROLLER ERROR:", error.message);
    res.status(500).json({ 
      message: "Failed to fetch interview report",
      error: error.message 
    });
  }
}

async function getAllInterviewReportController(req, res) {
  try {
    console.log("📥 [REQUEST] Get All Reports for user:", req.user?.id);
    
    const interviewReports = await InterviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
      );

    console.log(`✅ Found ${interviewReports.length} reports`);

    if (interviewReports?.length === 0) {
      return res.status(404).json({ message: "Interview reports are not found" });
    }

    return res.status(200).json({
      message: "Interview reports are fetched successfully",
      interviewReports,
    });
  } catch (error) {
    console.error("❌ GET ALL CONTROLLER ERROR:", error.message);
    res.status(500).json({ 
      message: "Failed to fetch interview reports",
      error: error.message 
    });
  }
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportController,
};