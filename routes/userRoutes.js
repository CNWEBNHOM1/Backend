const express = require('express');
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const upload = require('../middlewares/uploadImg');

const router = express.Router();

// Guest route 
router.post ('/createRequest', auth(['Khách']), upload.single('minhchung'), userController.createRequest);
// Ví dụ nếu form ở frontend như sau:
// <form action="/add" method="POST" enctype="multipart/form-data">
//     <input type="file" name="minhchung" />
//     <input type="submit" value="Upload Avatar" />
// </form>
// Student route 
// router.get('/info', auth(['Sinh viên']), userController.getMyInfo);
// router.get('/roomate', auth(['Sinh viên']), userController.getListRoommates);
// Manager route
// router.get ('/pendingStudent', auth(['Quản lý']), userController.getAllWaitingStudents);
router.get ('/room', auth(['Quản lý', 'Khách', 'Sinh viên']), userController.getAllRooms);
router.get ('/outdateBills', auth(['Quản lý']), userController.getAllOutDateBills);
router.get ('/createBills', auth(['Quản lý']), userController.createBill);
router.get ('/', auth(['Quản lý']), userController.getAllStudents);
router.get ('/searchStudent', auth(['Quản lý']), userController.searchStudent);
router.get ('/getAllDepartments', auth(['Quản lý']), userController.getAllDepartments);
router.get ('/getAllReports', auth(['Quản lý']), userController.getAllReports);
router.post ('/allBills', auth(['Quản lý']), userController.getAllBills);
router.post ('/roomd', auth(['Quản lý']), userController.getAllRoomsOfDepartment);
router.post ('/declineStundet', auth(['Quản lý']), userController.declineStudent);
router.post ('/kickOne', auth(['Quản lý']), userController.kickOneStudent);
router.post ('/kickAll', auth(['Quản lý']), userController.kickAllStudents);
router.post ('/transferRoom', auth(['Quản lý']), userController.transferRoom);
router.post ('/insertBills', auth(['Quản lý']), userController.insertBills);
router.post ('/sendBills', auth(['Quản lý']), userController.sendBills);
router.post ('/createRoom', auth(['Quản lý']), userController.createRoom);

router.put ('/updateRequest/:id', auth(['Quản lý', 'Khách']), upload.single('minhchung'), userController.updateRequest);
router.put ('/updateStudent/:id', auth(['Quản lý', 'Sinh viên']), userController.updateStudent);
router.put ('/updateRoom/:id', auth(['Quản lý']), userController.updateRoom);
router.put ('/updateBill/:id', auth(['Quản lý', 'Sinh viên']), userController.updateBill);
router.put ('/updateReport/:id', auth(['Quản lý', 'Sinh viên']), userController.updateReport);

module.exports = router;
