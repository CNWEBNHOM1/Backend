const express = require('express');
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const { uploadBillProof, uploadGuestProof } = require('../middlewares/uploadImage');

const router = express.Router();

// Guest route 
router.post('/', auth(['Khách']), userController.writeInfo);
router.get('/roomAvailable', auth(['Khách']), userController.getAllRoomsAvailable);//xem phong trong
// Student route 
router.get('/info', auth(['Sinh viên']), userController.getMyInfo);//student info
router.get('/roomMates', auth(['Sinh viên']), userController.getListRoommates);//xem ng cung phong
router.get('/listBills', auth(['Sinh viên']), userController.getListBills)//xem ds hoa don

router.post('/uploadProof', auth(['Sinh viên']), uploadBillProof.single('image'), userController.uploadBillProof);//nop mc
// router.post('/createReport', auth(['Sinh viên']), userController.createReport);//tao report
// router.post('/updateProfile', auth(['Sinh viên']), userController.updateStudentProfile);//update ttcn
// router.post('/roomRegister', auth(['Sinh viên']), userController.roomRegister);//done


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
