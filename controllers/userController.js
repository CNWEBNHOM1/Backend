const userService = require('../services/userService');
const generateInvoicePdf = require('../middlewares/exportInvoice');
const ExcelJS = require('exceljs');
// VNPAY Controller 
exports.getRoomPaymentUrl = async (req, res) => {
    try {
        const srcAddress =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.ip;
        const url = await userService.getRoomPaymentUrl(srcAddress, req.body);
        res.json({ data: url, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getRoomPaymentReturn = async (req, res) => {
    try {
        const result = await userService.getRoomPaymentReturn(req.query);
        res.json({ data: result, status: "success", message: 'Payment confirmed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getBillPaymentUrl = async (req, res) => {
    try {
        const srcAddress =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.ip;
        const url = await userService.getBillPaymentUrl(srcAddress, req.body);
        res.json({ data: url, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getBillPaymentReturn = async (req, res) => {
    try {
        const result = await userService.getBillPaymentReturn(req.query);
        res.json({ data: result, status: "success", message: 'Payment confirmed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Guest controller
exports.createRequest = async (req, res) => {
    try {
        const request = await userService.createRequest(req.user.userId, req.body);
        res.json({ data: request, status: "success" });
    } catch (err) {
        if (err === "Bạn đang có 1 yêu cầu chờ phê duyệt, không thể tạo thêm yêu cầu mới!")
            res.status(403).json({ error: err.message });
        else if (err === "Phòng này không phù hợp với giới tính của bạn!")
            res.status(404).json({ error: err.message });
        else res.status(500).json({ error: err.message });
    }
}
exports.getAllRoomsAvailable = async (req, res) => {
    try {
        console.log('djdjd');
        const roomsAvailable = await userService.getAllRoomsAvailable();
        res.status(200).json({ data: roomsAvailable, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOwnRequest = async (req, res) => {
    try {
        const data = await userService.getOwnRequest(req.user.userId);
        res.json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getAllRoomsAvailable = async (req, res) => {
    try {
        const roomsAvailable = await userService.getAllRoomsAvailable();
        res.status(200).json({ data: roomsAvailable, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Student controller 
exports.getListRoommates = async (req, res) => {
    try {
        const email = req.user.userEmail;
        const roommates = await userService.getListRoommates(email);
        res.json({ data: roommates, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMyInfo = async (req, res) => {
    try {
        const info = await userService.getMyInfo(req.user.userEmail);
        res.json({ data: info, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.uploadBillProof = async (req, res) => {
    try {
        const email = req.user.userEmail;
        const billId = req.body.id;
        const image = req.file ? req.fileURL : "";
        const paymentInformation = await userService.uploadBillProof(email, image, billId);
        res.status(200).json({ data: paymentInformation, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
exports.createReport = async (req, res) => {
    try {
        const image = req.file ? req.fileURL : "";
        const email = req.user.userEmail;
        const noidung = req.body.noidung;
        const reportInfo = await userService.createReport(email, image, noidung);
        res.status(200).json({ data: reportInfo, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getListBills = async (req, res) => {
    try {
        const { trangthai, page, limit, sortBy, order } = req.query;//sorBy: thanhtien hoặc createdAt
        //trangthai: "Chờ xác nhận", "Đã đóng", "Chưa đóng", "Quá hạn"
        const email = req.user.userEmail;
        const listBills = await userService.getListBills(email, req.query);
        res.json({ data: listBills, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Manager controller 
exports.getAllStudents = async (req, res) => {
    try {
        const { trangthai, room, name, cccd, gender, sid, khoa, page, limit } = req.query;

        // Gọi service với các tham số lọc
        const result = await userService.getAllStudents(
            { trangthai, room, name, cccd, gender, sid, khoa },
            page,
            limit
        );

        // Trả về kết quả cho client
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getAllRooms = async (req, res) => {
    try {
        const data = await userService.getAllRooms(req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// exports.removeStudent = async (req, res) => {
//     try {
//         const data = await userService.removeStudent(req.body.email);
//         res.status(200).json({ data: data, status: "success" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }
exports.removeStudent = async (req, res) => {
    try {
        const data = await userService.removeStudent(req.params.id);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.transferRoom = async (req, res) => {
    try {
        const data = await userService.transferRoom(req.params.student_id, req.params.new_room_id);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        if (err.message === "Gender not match")
            res.status(404).json({ error: err.message });
        else if (err.message === "This student is already in this room")
            res.status(405).json({ error: err.message });
        else res.status(500).json({ error: err.message });
    }
}
exports.transfer2Student = async (req, res) => {
    try {
        const data = await userService.transfer2Student(req.params.student1, req.params.student2);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// sửa 07/12 - ANTU
exports.getAllUsers = async (req, res) => {
    try {
        // Lấy các tham số từ query
        const { page = 1, limit = 10, email = '' } = req.query;

        // Gọi service với tham số
        const data = await userService.getAllUsers(page, limit, email);

        res.status(200).json({
            data: data.users,
            totalUsers: data.totalUsers,
            totalPages: data.totalPages,
            currentPage: page,
            status: "success"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRoom = async (req, res) => {
    try {
        const data = await userService.createRoom(req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        if (err.message === 'Room exist')
            res.status(403).json({ error: err.message });
        else if (err.message === 'Department is full')
            res.status(405).json({ error: err.message });
        else res.status(500).json({ error: err.message });
    }
}
exports.updateRoom = async (req, res) => {
    try {
        const data = await userService.updateRoom(req.params.id, req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getAllBills = async (req, res) => {
    try {
        const data = await userService.getAllBills(req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getAllOutDateBills = async (req, res) => {
    try {
        const data = await userService.getOutDateBills();
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// exports.createBills = async (req, res) => {
//     try {
//         const bills = await userService.createBills();
//         res.status(200).json({ data: bills, status: "success" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }
exports.createBill = async (req, res) => {
    try {
        const bill = await userService.createBill(req.body);
        res.status(200).json({ data: bill, status: "success" });
    } catch (err) {
        if (err.message === "Invalid sodiencuoi")
            res.status(403).json({ error: err.message, sodiendau: err.sodiendau });
        else res.status(500).json({ error: err.message });
    }
}
exports.handleBill = async (req, res) => {
    try {
        const data = await userService.handleBill(req.params.id, req.params.action);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.sendBills = async (req, res) => {
    let data = req.body;
    try {
        await authService.sendBills(data);
        res.status(200).json({ message: "Bills sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send bills" });
    }
}
exports.sendBill = async (req, res) => {
    try {
        await userService.sendBill(req.params.id);
        res.status(200).json({ message: "Bills sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send bills" });
    }
}
exports.searchStudent = async (req, res) => {
    const { query } = req.query;
    try {
        const data = await userService.searchStudents(query);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getAllDepartments = async (req, res) => {
    try {
        const data = await userService.getAllDepartments(req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getAllReports = async (req, res) => {
    try {
        const data = await userService.getAllReports(req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.handleReport = async (req, res) => {
    try {
        const data = await userService.handleReport(req.params.id, req.params.action, req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.handleRequest = async (req, res) => {
    try {
        const data = await userService.handleRequest(req.params.id, req.params.action, req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.createDepartment = async (req, res) => {
    try {
        const data = await userService.createDepartment(req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        if (err.message === "Department with this name already exists")
            res.status(403).json({ error: err.message });
        else res.status(500).json({ error: err.message });
    }
}
exports.getDetailStudent = async (req, res) => {
    try {
        const data = await userService.detailStudent(req.params.id);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getDetailRoom = async (req, res) => {
    try {
        const data = await userService.detailRoom(req.params.id);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getDetailDepartment = async (req, res) => {
    try {
        const data = await userService.detailDepartment(req.params.id);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getDetailBill = async (req, res) => {
    try {
        const data = await userService.detailBill(req.params.id);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getDetailRequest = async (req, res) => {
    try {
        const data = await userService.detailRequest(req.params.id);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getDetailReport = async (req, res) => {
    try {
        const data = await userService.detailReport(req.params.id);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getStudentsOfOneRoom = async (req, res) => {
    try {
        const data = await userService.getStudentsOfOneRoom(req.params.id, req.query);
        res.status(200).json({
            status: "success",
            data: data.students,
            pagination: {
                total: data.total,
                page: data.page,
                limit: data.limit,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// sửa 15/11
exports.getAllRequests = async (req, res) => {
    try {
        const { department, status, room, name, cccd, page, limit } = req.query;
        // Gọi service để lấy dữ liệu với các tham số lọc và phân trang
        const result = await userService.getAllRequest(
            { department, status, room, name, cccd },
            page,
            limit
        );
        // Trả về kết quả cho client
        res.status(200).json(result);
    } catch (error) {
        // console.error('Error in getAllRequests controller:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.handleUser = async (req, res) => {
    try {
        const data = await userService.handleUser(req.params.id, req.params.action);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.statisticBills = async (req, res) => {
    try {
        const data = await userService.statisticBills();
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.statisticReports = async (req, res) => {
    try {
        const data = await userService.statisticReports();
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.statisticRequests = async (req, res) => {
    try {
        const data = await userService.statisticRequests();
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.statisticRooms = async (req, res) => {
    try {
        const data = await userService.statisticRooms();
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.statisticStudents = async (req, res) => {
    try {
        const data = await userService.statisticStudents();
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.exportAllStudent = async (req, res) => {

    try {
        const students = await userService.exportAllStudent();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sách sinh viên');
        worksheet.views = [
            {
                state: 'frozen',
                xSplit: 0,
                ySplit: 1
            }
        ];
        const headers = [
            'STT', 'Email', 'Họ và tên', 'Ngày sinh', 'Giới tính',
            'CCCD', 'Ưu tiên', 'Số điện thoại', 'Địa chỉ',
            'Phòng', 'Khóa', 'Trường', 'Lớp', 'Trạng thái', 'Ngày bắt đầu'
        ];
        let stt = 1;
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };

        students.forEach((student) => {
            // console.log(student);
            worksheet.addRow([
                stt++,
                student.Email,
                student.Name,
                student.DOB,
                student.Gender,
                student.IDCard,
                student.Priority,
                student.Phone,
                student.Address,
                student.Room,
                student.AcademicYear,
                student.School,
                student.Class,
                student.Status,
                student.CreatedAt
            ]);
        });
        // console.log(students);
        res.setHeader('Content-Disposition', `attachment; filename="${Date.now()}_DSSV.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.exportAllStudentByDepartment = async (req, res) => {

    try {
        let departmentName = req.body.department;
        // departmentName = "B9";
        const students = await userService.exportAllStudentByDepartment(departmentName);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Danh sách sinh viên tòa ${departmentName}`);
        worksheet.views = [
            {
                state: 'frozen',
                xSplit: 0,
                ySplit: 1
            }
        ];
        const headers = [
            'STT', 'Email', 'Họ và tên', 'Ngày sinh', 'Giới tính',
            'CCCD', 'Ưu tiên', 'Số điện thoại', 'Địa chỉ',
            'Phòng', 'Khóa', 'Trường', 'Lớp', 'Trạng thái', 'Ngày bắt đầu'
        ];
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        let stt = 1;
        students.forEach(student => {
            worksheet.addRow([
                stt++,
                student.Email,
                student.Name,
                student.DOB,
                student.Gender,
                student.IDCard,
                student.Priority,
                student.Phone,
                student.Address,
                student.Room,
                student.AcademicYear,
                student.School,
                student.Class,
                student.Status,
                student.CreatedAt
            ]);
        });
        res.setHeader('Content-Disposition', `attachment; filename="${departmentName}_${Date.now()}_DSSV.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.exportAllStudentByRoom = async (req, res) => {
    try {
        let department = req.body.department;
        let room = req.body.room;
        // room = "101";
        // department = "B9";
        const students = await userService.exportAllStudentByRoom(department, room);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Danh sách sinh viên ${department}-${room}`);
        worksheet.views = [
            {
                state: 'frozen',
                xSplit: 0,
                ySplit: 1
            }
        ];
        const headers = [
            'STT', 'Email', 'Họ và tên', 'Ngày sinh', 'Giới tính',
            'CCCD', 'Ưu tiên', 'Số điện thoại', 'Địa chỉ',
            'Phòng', 'Khóa', 'Trường', 'Lớp', 'Trạng thái', 'Ngày bắt đầu'
        ];
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        let stt = 1;
        students.forEach(student => {
            worksheet.addRow([
                stt++,
                student.Email,
                student.Name,
                student.DOB,
                student.Gender,
                student.IDCard,
                student.Priority,
                student.Phone,
                student.Address,
                student.Room,
                student.AcademicYear,
                student.School,
                student.Class,
                student.Status,
                student.CreatedAt
            ]);
        });
        // ${billData.department}_${billData.room}_${Date.now()}_Invoice.pdf
        res.setHeader('Content-Disposition', `attachment; filename="${department}_${room}_${Date.now()}_DSSV.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.exportBills = async (req, res, next) => {
    try {
        let billId = req.body.billId;
        // billId = "6736ae6da885f02a9bd15b38";
        // console.log(billId);
        const billData = await userService.getBills(billId);

        if (!billData) {
            return res.status(404).json({ message: 'Hóa đơn không tồn tại.' });
        }
        // console.log("2");
        generateInvoicePdf(res, billData);

    } catch (err) {
        res.status(500).json({ error: 'Lỗi xuất hóa đơn.', details: err.message });
    }
}