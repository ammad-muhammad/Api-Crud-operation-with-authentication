const express = require('express');
const router = express.Router();
const {
  createPatient, getAllPatients, getPatientById, updatePatient, deletePatient,
} = require('../controllers/patientController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

router.post('/', authenticate, requireRole('admin', 'doctor', 'receptionist'), createPatient);
router.get('/', authenticate, getAllPatients);
router.get('/:id', authenticate, getPatientById);
router.put('/:id', authenticate, requireRole('admin', 'doctor', 'receptionist'), updatePatient);
router.delete('/:id', authenticate, requireRole('admin'), deletePatient);

module.exports = router;
