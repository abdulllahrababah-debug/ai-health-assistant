const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;