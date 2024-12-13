const express = require('express');
const authController = require('../controllers/authController');
const isAuth = require('../middlewares/authMiddleware');
const limiter = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/changePassword', isAuth(['Quản lý', 'Sinh viên', 'Khách']), authController.changePassword);
router.post('/forgotPassword', limiter, authController.sendMailToResetPassword);
router.get('/verify-email', authController.verifyEmail);
module.exports = router;
