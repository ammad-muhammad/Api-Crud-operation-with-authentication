const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics, getDoctorAnalytics, getPredictiveAnalytics,
  getPatientAnalytics, getReceptionistAnalytics
} = require('../controllers/analyticsController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');
const { requirePro } = require('../middlewares/subscription');

router.get('/admin', authenticate, requireRole('admin'), getAdminAnalytics);
router.get('/doctor', authenticate, requireRole('doctor', 'admin'), getDoctorAnalytics);
router.get('/patient', authenticate, requireRole('patient'), getPatientAnalytics);
router.get('/receptionist', authenticate, requireRole('receptionist'), getReceptionistAnalytics);
router.get('/predictive', authenticate, requireRole('admin', 'doctor'), requirePro, getPredictiveAnalytics);

module.exports = router;
