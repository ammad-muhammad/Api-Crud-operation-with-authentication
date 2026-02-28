const express = require('express');
const router = express.Router();
const {
  getAllUsers, getDoctors, createUser,
  getUserById, updateUser, deleteUser, updateSubscription,
} = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

// Public-ish: list doctors for appointment booking
router.get('/doctors', authenticate, getDoctors);

// Admin-only routes
router.get('/', authenticate, requireRole('admin'), getAllUsers);
router.post('/', authenticate, requireRole('admin'), createUser);
router.get('/:id', authenticate, requireRole('admin'), getUserById);
router.put('/:id', authenticate, requireRole('admin'), updateUser);
router.delete('/:id', authenticate, requireRole('admin'), deleteUser);
router.put('/:id/subscription', authenticate, requireRole('admin'), updateSubscription);

module.exports = router;
