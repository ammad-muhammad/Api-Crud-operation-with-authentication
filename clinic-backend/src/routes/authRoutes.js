const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, registerValidation, loginValidation } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
