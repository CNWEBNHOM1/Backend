const express = require('express');
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// Guest route 
router.post('/', auth(['Khách']), userController.writeInfo);
// Student route 
router.get('/info', auth(['Sinh viên']), userController.getMyInfo);
router.get('/', auth(['Sinh viên']), userController.getListRoommates);

router.post('/transfer', auth(['Sinh viên']), userController.transferPayment);//thanh toan phong
// Manager route 

module.exports = router;
