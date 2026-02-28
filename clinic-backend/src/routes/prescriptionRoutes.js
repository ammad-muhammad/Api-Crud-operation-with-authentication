const express = require('express');
const router = express.Router();
const {
  createPrescription, getPatientPrescriptions, getDoctorPrescriptions,
  getPrescriptionById, downloadPrescriptionPDF, regenerateAiExplanation,
} = require('../controllers/prescriptionController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
const { requirePro } = require('../middlewares/subscription');

router.post('/', authenticate, requireRole('doctor'), createPrescription);
router.get('/my', authenticate, requireRole('doctor'), getDoctorPrescriptions);
router.get('/patient/:patientId', authenticate, requireRole('admin', 'doctor', 'patient'), getPatientPrescriptions);
router.get('/:id', authenticate, getPrescriptionById);
router.get('/:id/pdf', authenticate, downloadPrescriptionPDF);
router.put('/:id/ai-explain', authenticate, requireRole('doctor'), requirePro, regenerateAiExplanation);

module.exports = router;
