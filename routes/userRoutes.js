const express = require('express');
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// Student route 
router.get('/', auth(['Sinh viên']), userController.getListRoommates);
router.get('/info', auth(['Sinh viên']), userController.getMyInfo);
// Manager route 

module.exports = router;
