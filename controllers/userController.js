const userService = require('../services/userService');

// Guest controller
exports.createRequest = async (req, res) => {
    try {
        const data = req.body;
        data["minhchung"] = req.file ? req.file.filename : null;
        data.holdexpiry = Date() + 15 * 60 * 1000;
        const request = await userService.createRequest(data);
        res.json({ data: request, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Student controller 
// exports.getListRoommates = async (req, res) => {
//     try {
//         const roommates = await userService.getListRoommates(req.body.room);
//         res.json({ data: roommates, status: "success" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
// exports.getMyInfo = async (req, res) => {
//     try {
//         const roommates = await userService.getMyInfo(req.body.email);
//         res.json({ data: roommates, status: "success" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
// Manager controller 
exports.getAllStudents = async (req, res) => {
    try {
        const allstd = await userService.getAllStudents();
        res.status(200).json({ data: allstd, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
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
exports.updateStudent = async (req, res) => {
    try {
        const data = await userService.updateStudent(req.params.id, req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.kickOneStudent = async (req, res) => {
    try {
        const data = await userService.kickOneStudents(req.body.email);
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
        const data = await userService.transferRoom(req.body.email, req.body.department, req.body.room);
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
exports.createBill = async (req, res) => {
    try {
        const bills = await userService.createBill();
        res.status(200).json({ data: bills, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.updateBill = async (req, res) => {
    try {
        const data = await userService.updateBill(req.params.id, req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.insertBills = async (req, res) => {
    try {
        const insertedBills = await userService.insertBills(req.body);
        res.status(200).json({ data: insertedBills, message: `${insertedBills.length} bills were successfully inserted.` });
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
        const data = await userService.getAllDepartments();
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
exports.updateReport = async (req, res) => {
    try {
        const data = await userService.updateReport(req.params.id, req.body);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.updateRequest = async (req, res) => {
    try {
        const data = await userService.updateRequest(req.params.id, req.body, req.file);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}