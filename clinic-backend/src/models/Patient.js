const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
  condition: String,
  diagnosedAt: Date,
  notes: String,
  treatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true },
      address: { type: String, trim: true },
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    medicalHistory: [medicalHistorySchema],
    allergies: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    linkedUser: {
      // If patient has a system account
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for faster searches
patientSchema.index({ name: 'text', 'contact.phone': 1 });

module.exports = mongoose.model('Patient', patientSchema);
