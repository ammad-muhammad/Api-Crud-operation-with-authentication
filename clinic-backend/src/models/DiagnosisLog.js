const mongoose = require('mongoose');

const diagnosisLogSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    symptoms: {
      type: [String],
      required: true,
    },
    additionalInfo: {
      age: Number,
      gender: String,
      history: String,
    },
    aiResponse: {
      possibleConditions: [String],
      riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
      suggestedTests: [String],
      advice: String,
      rawResponse: String,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    isAiFallback: {
      // true if AI failed and fallback was used
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

diagnosisLogSchema.index({ doctorId: 1, createdAt: -1 });
diagnosisLogSchema.index({ patientId: 1, createdAt: -1 });
diagnosisLogSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('DiagnosisLog', diagnosisLogSchema);
