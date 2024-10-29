const express = require('express');
const authController = require('../controllers/authController');
const isAuth = require('../middlewares/authMiddleware')

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/changePassword', isAuth, authController.changePassword);
module.exports = router;
