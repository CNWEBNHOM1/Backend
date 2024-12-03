const express = require('express');
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const { uploadBillProof, uploadGuestProof, uploadReportProof } = require('../middlewares/uploadImage');
const upload = require('../middlewares/uploadImg');
const limiter = require('../middlewares/rateLimiter');

const router = express.Router();

// Guest route 
router.post('/createRequest', auth(['Khách']), upload.single('minhchung'), userController.createRequest);
router.post('/updateRequest-1', auth(['Khách']), limiter, userController.updateRequest1);
router.post('/updateRequest-2', auth(['Khách']), userController.updateRequest2);
router.get('/myRequest', auth(['Khách', 'Sinh viên']), userController.getOwnRequest);
// Ví dụ nếu form ở frontend như sau:
// <form action="/add" method="POST" enctype="multipart/form-data">
//     <input type="file" name="minhchung" />
//     <input type="submit" value="Upload Avatar" />
// </form>
router.get('/roomAvailable', auth(['Khách']), userController.getAllRoomsAvailable);
// Student route 
router.get('/info', auth(['Sinh viên']), userController.getMyInfo);//studentInfo+room
router.get('/roomMates', auth(['Sinh viên']), userController.getListRoommates);//
router.get('/listBills', auth(['Sinh viên']), userController.getListBills)//
//them getImage 

router.post('/uploadProof', auth(['Sinh viên']), uploadBillProof.single('minhchung'), userController.uploadBillProof);//file
router.post('/createReport', auth(['Sinh viên']), uploadReportProof.single('minhchung'), userController.createReport);//noidun
// router.post('/changeRoomRequest', auth(['Sinh viên']), userController.requestChangeRoom);


// Manager route
// router.get ('/pendingStudent', auth(['Quản lý']), userController.getAllWaitingStudents);
router.get('/allUsers', auth(['Quản lý']), userController.getAllUsers);
router.get('/room', auth(['Quản lý', 'Khách']), userController.getAllRooms);
router.get('/outdateBills', auth(['Quản lý']), userController.getAllOutDateBills);
router.get('/createBills', auth(['Quản lý']), userController.createBills);
router.get('/', auth(['Quản lý']), userController.getAllStudents);
router.get('/searchStudent', auth(['Quản lý']), userController.searchStudent);
router.get('/detailStudent/:id', auth(['Quản lý']), userController.getDetailStudent);
router.get('/detailRoom/:id', auth(['Quản lý']), userController.getDetailRoom);
router.get('/detailBill/:id', auth(['Quản lý']), userController.getDetailBill);
router.get('/allRequests', auth(['Quản lý']), userController.getAllRequests);

router.get('/detailRequest/:id', auth(['Quản lý']), userController.getDetailRequest);
router.get('/detailReport/:id', auth(['Quản lý']), userController.getDetailReport);
router.get('/detailDepartment/:id', auth(['Quản lý']), userController.getDetailDepartment);
router.get('/getStudentsOfRoom/', auth(['Quản lý']), userController.getStudentsOfOneRoom);

router.get('/exportAllStudent', auth(['Quản lý']), userController.exportAllStudent);

router.post('/createBill', auth(['Quản lý']), userController.createBill);
router.post('/getAllDepartments', auth(['Quản lý']), userController.getAllDepartments);
router.post('/getAllReports', auth(['Quản lý']), userController.getAllReports);
router.post('/allBills', auth(['Quản lý']), userController.getAllBills);
router.post('/roomd', auth(['Quản lý']), userController.getAllRoomsOfDepartment);
router.post('/declineStudent', auth(['Quản lý']), userController.declineStudent);
router.post('/kickAll', auth(['Quản lý']), userController.kickAllStudents);
// router.post ('/sendBills', auth(['Quản lý']), userController.sendBills);
router.get('/sendBill/:id', auth(['Quản lý']), userController.sendBill);
router.post('/createRoom', auth(['Quản lý']), userController.createRoom);
router.post('/createDepartment', auth(['Quản lý']), userController.createDepartment);

router.put('/handleRequest/:id/:action', auth(['Quản lý']), userController.handleRequest);
router.put('/handleStudent/:id/:action', auth(['Quản lý']), userController.handleStudent);
router.put('/handleUser/:id/:action', auth(['Quản lý']), userController.handleUser);
router.put('/updateRoom/:id', auth(['Quản lý']), userController.updateRoom);
router.put('/handleBill/:id/:action', auth(['Quản lý']), userController.handleBill);
router.put('/handleReport/:id/:action', auth(['Quản lý']), userController.handleReport);
router.put('/transferRoom/:student_id/:new_room_id', auth(['Quản lý']), userController.transferRoom);
router.put('/transfer2Student/:student1/:student2', auth(['Quản lý']), userController.transfer2Student);
module.exports = router;
