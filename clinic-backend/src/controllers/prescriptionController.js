const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { generatePrescriptionPDF } = require('../services/pdfService');
const { explainPrescription } = require('../services/aiService');

/**
 * POST /api/prescriptions
 * Doctor: create prescription, optionally get AI explanation.
 */
const createPrescription = async (req, res, next) => {
  try {
    const {
      patientId, appointmentId, diagnosis,
      medicines, notes, followUpDate,
      generateAiExplanation = false, urduMode = false,
    } = req.body;

    if (!patientId || !medicines || medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'patientId and at least one medicine are required.' });
    }

    // Optionally generate AI explanation
    let aiExplanation = '';
    if (generateAiExplanation && req.user.subscriptionPlan === 'pro') {
      const aiResult = await explainPrescription(medicines, notes, diagnosis, urduMode);
      aiExplanation = aiResult.explanation || '';
    }

    const prescription = await Prescription.create({
      patientId, doctorId: req.user._id,
      appointmentId: appointmentId || null,
      diagnosis: diagnosis || '',
      medicines, notes: notes || '',
      aiExplanation,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    });

    const populated = await prescription.populate([
      { path: 'patientId', select: 'name age gender' },
      { path: 'doctorId', select: 'name specialization' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Prescription created.',
      prescription: populated,
      aiGenerated: !!aiExplanation,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/prescriptions/patient/:patientId
 * Doctor / Patient: get prescription history for a patient.
 */
const getPatientPrescriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Prescription.countDocuments({ patientId: req.params.patientId });
    return res.json({ success: true, total, page: Number(page), prescriptions });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/prescriptions/my
 * Doctor: their own issued prescriptions.
 */
const getDoctorPrescriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const prescriptions = await Prescription.find({ doctorId: req.user._id })
      .populate('patientId', 'name age gender')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Prescription.countDocuments({ doctorId: req.user._id });
    return res.json({ success: true, total, page: Number(page), prescriptions });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/prescriptions/:id
 */
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name age gender contact bloodGroup')
      .populate('doctorId', 'name specialization email');

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });
    return res.json({ success: true, prescription });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/prescriptions/:id/pdf
 * Patient / Doctor: download prescription as PDF.
 */
const downloadPrescriptionPDF = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name age gender contact bloodGroup')
      .populate('doctorId', 'name specialization email');

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });

    // Patient can only download their own
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ linkedUser: req.user._id });
      if (!patient || prescription.patientId._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    const pdfBuffer = await generatePrescriptionPDF({
      prescription: prescription.toObject(),
      patient: prescription.patientId,
      doctor: prescription.doctorId,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="prescription_${prescription._id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/prescriptions/:id/ai-explain
 * Add/regenerate AI explanation for existing prescription (Pro).
 */
const regenerateAiExplanation = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });

    if (prescription.doctorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { urduMode = false } = req.body;
    const aiResult = await explainPrescription(
      prescription.medicines, prescription.notes, prescription.diagnosis, urduMode
    );

    prescription.aiExplanation = aiResult.explanation || '';
    await prescription.save();

    return res.json({
      success: true,
      message: 'AI explanation updated.',
      aiExplanation: prescription.aiExplanation,
      isFallback: aiResult.isFallback,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPrescription, getPatientPrescriptions, getDoctorPrescriptions,
  getPrescriptionById, downloadPrescriptionPDF, regenerateAiExplanation,
};
