const express = require('express');
const router = express.Router();
const {
  createAppointment, getAppointments, getAppointmentById,
  updateAppointment, cancelAppointment, getTodayAppointments,
} = require('../controllers/appointmentController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

router.get('/today', authenticate, requireRole('admin', 'doctor', 'receptionist'), getTodayAppointments);
router.post('/', authenticate, requireRole('admin', 'doctor', 'receptionist'), createAppointment);
router.get('/', authenticate, getAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.put('/:id', authenticate, requireRole('admin', 'doctor', 'receptionist'), updateAppointment);
router.delete('/:id', authenticate, requireRole('admin', 'doctor', 'receptionist'), cancelAppointment);

module.exports = router;
