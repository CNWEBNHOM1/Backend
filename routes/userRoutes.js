const express = require('express');
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// Guest route 
router.post('/', auth(['Khách']), userController.writeInfo);
// Student route 
router.get('/info', auth(['Sinh viên']), userController.getMyInfo);//student info
router.get('/', auth(['Sinh viên']), userController.getListRoommates);

router.post('/transfer', auth(['Sinh viên']), userController.transferPayment);//thanh toan phong
router.post('/createReport', auth(['Sinh viên']), userController.createReport);//tao report
router.get('/roomAvailable', auth(['Sinh viên']), userController.getAllRoomsAvailable);//done
router.post('/updateProfile', auth(['Sinh viên']), userController.updateStudentProfile);//update ttcn
router.post('/roomRegister', auth(['Sinh viên']), userController.roomRegister);//done
// Manager route
router.get('/pendingStudent', auth(['Quản lý']), userController.getAllWaitingStudents);
router.get('/roomd', auth(['Quản lý']), userController.getAllRoomsOfDepartment);
router.get('/room', auth(['Quản lý']), userController.getAllRooms);
router.get('/allBills', auth(['Quản lý']), userController.getAllBills);
router.get('/outDateBills', auth(['Quản lý']), userController.getAllOutDateBills);
router.get('/createBills', auth(['Quản lý']), userController.createBill);
router.get('/', auth(['Quản lý']), userController.getAllStudents);
router.post('/approvedStudent', auth(['Quản lý']), userController.approveStudentToRoom);
router.post('/declineStundet', auth(['Quản lý']), userController.declineStudent);
router.post('/kickOne', auth(['Quản lý']), userController.kickOneStudent);
router.post('/kickAll', auth(['Quản lý']), userController.kickAllStudents);
router.post('/transferRoom', auth(['Quản lý']), userController.transferRoom);
router.post('/insertBills', auth(['Quản lý']), userController.insertBills);
router.post('/sendBills', auth(['Quản lý']), userController.sendBills);
router.post('/approveBill', auth(['Quản lý']), userController.approvedBill);

module.exports = router;
