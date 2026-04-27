const mongoose = require('mongoose');

const VapiInterviewReportSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  techstack: {
    type: [String],
    default: []
  },
  questions: {
    type: [String],
    default: []
  },
  finalized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const VapiInterviewReportModel = mongoose.model('VapiInterviewReport', VapiInterviewReportSchema);

module.exports = VapiInterviewReportModel;