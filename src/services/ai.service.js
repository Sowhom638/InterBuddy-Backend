const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `You are an expert technical recruiter and career coach. Generate a comprehensive interview report based on:

**Inputs:**
- Resume: ${resume}
- Self-description: ${selfDescription}  
- Job Description: ${jobDescription}

**Critical Output Rules:**
1. Return ONLY raw, valid JSON — no markdown, no code blocks, no explanatory text
2. Use DOUBLE quotes for ALL keys and string values (JSON standard)
3. Populate EVERY array with actual content — no placeholders like [Array]
4. Use EXACT enum values: "low", "medium", "high" (lowercase only)
5. Ensure the output can be parsed by JSON.parse() without errors

**Return ONLY a valid JSON object with this exact structure:**
{
  "matchScore": number,
  "title": "string" [Here is the title of the job role for which interview is taken],
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string", 
      "answer": "string"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "severity": "low" | "medium" | "high"
    }
  ],
  "preparationPlan": [
    {
      "day": number,
      "focus": "string",
      "tasks": ["string", "string", "string"]
    }
  ]
}

**Content Guidelines:**
- matchScore: 0-100 integer based on holistic fit assessment
- technicalQuestions: 5 role-specific questions with actionable ideal answers
- behavioralQuestions: 5 compatible questions evaluating soft skills
- skillGaps: List only meaningful gaps; avoid trivial items
- preparationPlan: 7 phased entries; tasks array must contain ≥3 concrete, actionable strings per phase. "days" will be continued like 1, 2, 3, ....
- Tone: Professional, constructive, growth-oriented

⚠️ Before responding: Validate that your output is syntactically valid JSON. If uncertain, regenerate.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });
  console.log(response.text);
  return JSON.parse(response.text);
}

module.exports = {
  generateInterviewReport
};
