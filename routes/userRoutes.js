const express = require('express');
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// Guest route 
router.post('/', auth(['Khách']), userController.writeInfo);
// Student route 
router.get('/info', auth(['Sinh viên']), userController.getMyInfo);
router.get('/', auth(['Sinh viên']), userController.getListRoommates);
// Manager route 

module.exports = router;
