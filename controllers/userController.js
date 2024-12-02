const userService = require('../services/userService');
const bodyParser = require('body-parser')

// Guest controller
exports.createRequest = async (req, res) => {
    try {
        req.body.userId = req.user.userId;
        const request = await userService.createRequest(req.body, req.file);
        res.json({ data: request, status: "success" });
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

exports.getOwnRequest = async (req, res) => {
    try {
        const data = await userService.getOwnRequest(req.user.email);
        res.json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.updateRequest1 = async (req, res) => {
    try {
        const data = await userService.updateRequest1(req.body.roomId);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.updateRequest2 = async (req, res) => {
    try {
        const data = await userService.updateRequest2(req.body.roomId);
        res.status(200).json({ data: data, status: "success" });
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
        const image = req.file;
        const paymentInformation = await userService.uploadBillProof(email, image, billId);
        res.status(200).json({ data: paymentInformation, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
exports.createReport = async (req, res) => {
    try {
        const image = req.file;
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

// exports.requestChangeRoom = async (req, res) => {
//     try {
//         const email = req.user.userEmail;
//         const noidung = req.body.noidung;
//         const roomId = req.body.roomId;
//         const data = await userService.requestChangeRoom(email, noidung, roomId);
//         res.json({ data: data, status: "success" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }


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
};
// exports.getAllWaitingStudents = async (req, res) => {
//     try {
//         const data = await userService.getAllWaitingStudents();
//         res.status(200).json({ data: data, status: "success" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }
exports.getAllRooms = async (req, res) => {
    try {
        const allr = await userService.getAllRooms();
        res.status(200).json({ data: allr, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getAllRoomsOfDepartment = async (req, res) => {
    try {
        const data = await userService.getAllRoomsOfDepartment(req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.declineStudent = async (req, res) => {
    try {
        const data = await userService.declineStudent(req.body.email);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.handleStudent = async (req, res) => {
    try {
        const data = await userService.handleStudent(req.params.id, req.params.action);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.kickAllStudents = async (req, res) => {
    try {
        await userService.kickAllStudents();
        res.status(200).json({ message: 'All students have been kicked from their rooms' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.transferRoom = async (req, res) => {
    try {
        const data = await userService.transferRoom(req.params.student_id, req.params.new_room_id);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
// sửa 15/11
exports.getAllUsers = async (req, res) => {
    try {
        const data = await userService.getAllUsers();
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.createRoom = async (req, res) => {
    try {
        const data = await userService.createRoom(req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
exports.createBills = async (req, res) => {
    try {
        const bills = await userService.createBills();
        res.status(200).json({ data: bills, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.createBill = async (req, res) => {
    try {
        const bill = await userService.createBill(req.body);
        res.status(200).json({ data: bill, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        const data = await userService.handleRequest(req.params.id, req.params.action);
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
        res.status(500).json({ error: err.message });
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
        const { query } = req.query;
        const data = await userService.getStudentsOfOneRoom(query);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// sửa 15/11
exports.getAllRequests = async (req, res) => {
    try {
        const { status, room, name, cccd, page, limit } = req.query;
        // Gọi service để lấy dữ liệu với các tham số lọc và phân trang
        const result = await userService.getAllRequest(
            { status, room, name, cccd },
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