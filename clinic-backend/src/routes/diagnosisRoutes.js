const express = require('express');
const router = express.Router();
const {
  aiSymptomCheck, getDiagnosisLogs,
  detectPatientRiskPatterns, getDiagnosisLogById,
} = require('../controllers/diagnosisController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
// Restricted AI features (now free)
router.post('/symptoms', authenticate, requireRole('doctor', 'admin'), aiSymptomCheck);
router.post('/risk-patterns/:patientId', authenticate, requireRole('doctor', 'admin'), detectPatientRiskPatterns);

// Logs available to doctor & admin without Pro restriction
router.get('/logs', authenticate, requireRole('admin', 'doctor'), getDiagnosisLogs);
router.get('/logs/:id', authenticate, requireRole('admin', 'doctor'), getDiagnosisLogById);

module.exports = router;
