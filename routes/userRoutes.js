const express = require('express');
const auth = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const { uploadBillProof, uploadGuestProof } = require('../middlewares/uploadImage');
const upload = require('../middlewares/uploadImg');

const router = express.Router();

// Guest route 
router.post('/createRequest', auth(['Khách']), uploadGuestProof.single('minhchung'), userController.createRequest);
router.put('/updateRequest/:id', auth(['Khách']), upload.single('minhchung'), userController.updateRequest);
router.get('/myRequest', auth(['Khách']), userController.getOwnRequest);
// Ví dụ nếu form ở frontend như sau:
// <form action="/add" method="POST" enctype="multipart/form-data">
//     <input type="file" name="minhchung" />
//     <input type="submit" value="Upload Avatar" />
// </form>
router.get('/roomAvailable', auth(['Khách']), userController.getAllRoomsAvailable);
// Student route 
router.get('/info', auth(['Sinh viên']), userController.getMyInfo);//
router.get('/roomMates', auth(['Sinh viên']), userController.getListRoommates);//
router.get('/listBills', auth(['Sinh viên']), userController.getListBills)//

// router.post('/fix', auth(['Sinh viên']), userController.fix);
router.post('/uploadProof', auth(['Sinh viên']), uploadBillProof.single('minhchung'), userController.uploadBillProof);//file
router.post('/createReport', auth(['Sinh viên']), userController.createReport);//noidun



// Manager route
// router.get ('/pendingStudent', auth(['Quản lý']), userController.getAllWaitingStudents);
router.get('/room', auth(['Quản lý', 'Khách', 'Sinh viên']), userController.getAllRooms);
router.get('/outdateBills', auth(['Quản lý']), userController.getAllOutDateBills);
router.get('/createBills', auth(['Quản lý']), userController.createBills);
router.get('/', auth(['Quản lý']), userController.getAllStudents);
router.get('/searchStudent', auth(['Quản lý']), userController.searchStudent);
router.get('/detailStudent/:id', auth(['Quản lý']), userController.getDetailStudent);
router.get('/detailRoom/:id', auth(['Quản lý']), userController.getDetailRoom);
router.get('/detailBill/:id', auth(['Quản lý']), userController.getDetailBill);
router.get('/detailRequest/:id', auth(['Quản lý']), userController.getDetailRequest);
router.get('/detailReport/:id', auth(['Quản lý']), userController.getDetailReport);
router.get('/detailDepartment/:id', auth(['Quản lý']), userController.getDetailDepartment);

router.post('/getAllDepartments', auth(['Quản lý']), userController.getAllDepartments);
router.post('/getAllReports', auth(['Quản lý']), userController.getAllReports);
router.post('/allBills', auth(['Quản lý']), userController.getAllBills);
router.post('/roomd', auth(['Quản lý']), userController.getAllRoomsOfDepartment);
router.post('/declineStundet', auth(['Quản lý']), userController.declineStudent);
router.post('/kickOne', auth(['Quản lý']), userController.kickOneStudent);
router.post('/kickAll', auth(['Quản lý']), userController.kickAllStudents);
router.post('/transferRoom', auth(['Quản lý']), userController.transferRoom);
router.post('/sendBills', auth(['Quản lý']), userController.sendBills);
router.post('/createRoom', auth(['Quản lý']), userController.createRoom);
router.post('/createDepartment', auth(['Quản lý']), userController.createDepartment);

router.put('/handleRequest/:id', auth(['Quản lý']), userController.handleRequest);
router.put('/updateStudent/:id', auth(['Quản lý', 'Sinh viên']), userController.updateStudent);
router.put('/updateRoom/:id', auth(['Quản lý']), userController.updateRoom);
router.put('/updateBill/:id', auth(['Quản lý', 'Sinh viên']), userController.updateBill);
router.put('/updateReport/:id', auth(['Quản lý', 'Sinh viên']), userController.updateReport);

module.exports = router;
