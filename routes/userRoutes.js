const express = require('express');
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/auth-endpoint', auth, userController.authEndpoint);
// router.get('/auth-endpoint', userController.authEndpoint);

module.exports = router;
