const app = require("./src/app");
const connectDB = require("./src/config/database");
const {resume, selfDescription, jobDescription} = require("./src/services/temp");
const generateInterviewReport = require("./src/services/ai.service");
require("dotenv").config();
connectDB();
// generateInterviewReport({resume, selfDescription, jobDescription});
const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server is connencted to http://localhost:${PORT}`);
    
})