const express = require('express');
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/auth-endpoint', auth, userController.authEndpoint);

module.exports = router;
