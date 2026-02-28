const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },      // e.g. "500mg"
  frequency: { type: String, required: true },   // e.g. "Twice daily"
  duration: { type: String, default: '' },       // e.g. "7 days"
  instructions: { type: String, default: '' },   // e.g. "After meals"
});

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    diagnosis: {
      type: String,
      trim: true,
      default: '',
    },
    medicines: {
      type: [medicineSchema],
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    aiExplanation: {
      // AI-generated patient-friendly explanation
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    pdfUrl: {
      // Cloudinary URL if PDF is stored
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
