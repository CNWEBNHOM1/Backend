const express = require('express');
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
// const { upload, uploadRequestHandler, uploadBillHandler, uploadReportHandler } = require('../middlewares/imageGoogleUpload');
// const { uploadBillProof, uploadGuestProof, uploadReportProof } = require('../middlewares/uploadImage');
// const upload = require('../middlewares/uploadImg');
const { upload, uploadRequestHandler, uploadBillHandler, uploadReportHandler } = require('../middlewares/imageCloudinaryUpload');
const limiter = require('../middlewares/rateLimiter');

const router = express.Router();

// VNPAY route 
router.post('/getBillPaymentUrl', auth(['Sinh viên']), userController.getBillPaymentUrl);
router.get('/getBillPaymentReturn', auth(['Sinh viên']), userController.getBillPaymentReturn);
// Guest route 
// router.post('/createRequest', auth(['Khách']), upload.single('minhchung'), userController.createRequest);
router.post('/createRequest', auth(['Khách']), upload, uploadRequestHandler, userController.createRequest);
router.post('/updateRequest-1', auth(['Khách']), limiter, userController.updateRequest1);
// router.post('/updateRequest-1', auth(['Khách']), userController.updateRequest1);
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

router.post('/uploadProof', auth(['Sinh viên']), upload, uploadBillHandler, userController.uploadBillProof);//file
router.post('/createReport', auth(['Sinh viên']), upload, uploadReportHandler, userController.createReport);//noidun
// router.post('/uploadProof', auth(['Sinh viên']), uploadBillProof.single('minhchung'), userController.uploadBillProof);//file
// router.post('/createReport', auth(['Sinh viên']), uploadReportProof.single('minhchung'), userController.createReport);//noidun
// router.post('/changeRoomRequest', auth(['Sinh viên']), userController.requestChangeRoom);


// Manager route
// router.get ('/pendingStudent', auth(['Quản lý']), userController.getAllWaitingStudents);
router.get('/allUsers', auth(['Quản lý']), userController.getAllUsers);
// router.get('/room', auth(['Quản lý', 'Khách']), userController.getAllRooms);
router.get('/outdateBills', auth(['Quản lý']), userController.getAllOutDateBills);
// router.get('/createBills', auth(['Quản lý']), userController.createBills);
router.get('/', auth(['Quản lý']), userController.getAllStudents);
router.get('/searchStudent', auth(['Quản lý']), userController.searchStudent);
router.get('/detailStudent/:id', auth(['Quản lý']), userController.getDetailStudent);
router.get('/detailRoom/:id', auth(['Quản lý']), userController.getDetailRoom);
router.get('/detailBill/:id', auth(['Quản lý']), userController.getDetailBill);
router.get('/allRequests', auth(['Quản lý']), userController.getAllRequests);

router.get('/detailRequest/:id', auth(['Quản lý']), userController.getDetailRequest);
router.get('/detailReport/:id', auth(['Quản lý']), userController.getDetailReport);
router.get('/detailDepartment/:id', auth(['Quản lý']), userController.getDetailDepartment);
router.get('/getStudentsOfRoom/:id', auth(['Quản lý']), userController.getStudentsOfOneRoom);
router.get('/statisticBills/', auth(['Quản lý']), userController.statisticBills);
router.get('/statisticReports/', auth(['Quản lý']), userController.statisticReports);
router.get('/statisticRequests/', auth(['Quản lý']), userController.statisticRequests);
router.get('/statisticRooms/', auth(['Quản lý']), userController.statisticRooms);
router.get('/statisticStudents/', auth(['Quản lý']), userController.statisticStudents);

//export ra excel
router.get('/exportAllStudent', auth(['Quản lý']), userController.exportAllStudent);
router.get('/exportAllStudentByDepartment', auth(['Quản lý']), userController.exportAllStudentByDepartment);//truyền tên tòa
router.get('/exportAllStudentByRoom', auth(['Quản lý']), userController.exportAllStudentByRoom);//truyền tên tòa(string) + tên phòng(number)
//exports pdf hoá đơn theo id
router.get('/exportBills', auth(['Quản lý']), userController.exportBills);//truyền id


router.post('/createBill', auth(['Quản lý']), userController.createBill);
router.post('/getAllDepartments', auth(['Quản lý']), userController.getAllDepartments);
router.post('/getAllReports', auth(['Quản lý']), userController.getAllReports);
router.post('/allBills', auth(['Quản lý']), userController.getAllBills);
router.post('/roomd', auth(['Quản lý']), userController.getAllRooms);
// router.post ('/sendBills', auth(['Quản lý']), userController.sendBills);
router.get('/sendBill/:id', auth(['Quản lý']), userController.sendBill);
router.post('/createRoom', auth(['Quản lý']), userController.createRoom);
router.post('/createDepartment', auth(['Quản lý']), userController.createDepartment);

router.put('/handleRequest/:id/:action', auth(['Quản lý']), userController.handleRequest);
router.put('/removeStudent/:id', auth(['Quản lý']), userController.removeStudent);
router.put('/handleUser/:id/:action', auth(['Quản lý']), userController.handleUser);
router.put('/updateRoom/:id', auth(['Quản lý']), userController.updateRoom);
router.put('/handleBill/:id/:action', auth(['Quản lý']), userController.handleBill);
router.put('/handleReport/:id/:action', auth(['Quản lý']), userController.handleReport);
router.put('/transferRoom/:student_id/:new_room_id', auth(['Quản lý']), userController.transferRoom);
router.put('/transfer2Student/:student1/:student2', auth(['Quản lý']), userController.transfer2Student);
// export billModel, excel 
router.get('/exportAllStudent', auth(['Quản lý']), userController.exportAllStudent);
router.get('/exportAllStudentByDepartment', auth(['Quản lý']), userController.exportAllStudentByDepartment);//truyền tên tòa
router.get('/exportAllStudentByRoom', auth(['Quản lý']), userController.exportAllStudentByRoom);//truyền tên tòa(string) + tên phòng(number)
router.get('/exportBills', auth(['Quản lý', 'Sinh viên', 'Khách']), userController.exportBills);//truyền id
module.exports = router;
