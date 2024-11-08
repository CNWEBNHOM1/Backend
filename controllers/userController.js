const userService = require('../services/userService');

// Guest controller
exports.writeInfo = async (req, res) => {
    try {
        const std = await userService.writeInfo(req.body);
        res.json({ data: std, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Student controller 
exports.getListRoommates = async (req, res) => {
    try {
        const roommates = await userService.getListRoommates(req.body.room);
        res.json({ data: roommates, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMyInfo = async (req, res) => {
    try {
        const roommates = await userService.getMyInfo(req.body.email);
        res.json({ data: roommates, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.uploadProof = async (req, res) => {
    try {
        const semail = req.body;
        const image = req.file;
        const paymentInformation = await userService.uploadProof(semail, image);
        res.status(200).json({ data: paymentInformation, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
exports.createReport = async (req, res) => {
    try {
        const reportInfo = await userService.createReport();
        res.status(200).json({ data: reportInfo, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllRoomsAvailable = async (req, res) => {
    try {
        const roomsAvailable = await userService.getAllRoomsAvailable();
        res.status(200).json({ data: roomsAvailable, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.roomRegister = async (req, res) => {
    try {
        const { email, roomName, department } = req.body;
        const roomRegister = await userService.roomRegister({ email, roomName, department });
        res.status(200).json({ data: roomRegister, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateStudentProfile = async (req, res) => {
    try {
        // const email = req.body.email;
        const studentInfo = await userService.updateStudentProfile(req.body);
        res.status(200).json({ data: studentInfo, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getListBills = async (req, res) => {
    try {
        const email = req.body.email;
        const listBills = await userService.getListBills(email);
        res.json({ data: listBills, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


// Manager controller 
exports.getAllStudents = async (req, res) => {
    try {
        const allstd = await userService.getAllStudents();
        res.status(200).json({ data: allstd, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getAllWaitingStudents = async (req, res) => {
    try {
        const data = await userService.getAllWaitingStudents();
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
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
        const data = await userService.getAllRoomsOfDepartment({ page: req.body.page, limit: req.body.page, department: req.body.department });
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.approveStudentToRoom = async (req, res) => {
    try {
        const data = await userService.approveStudentToRoom(req.email);
        res.status(200).json({ data: data, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.declineStudent = async (req, res) => {
    try {
        const data = await userService.declineStudent(req.body.email)
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
exports.getAllBills = async (req, res) => {
    try {
        const data = await userService.getAllBills();
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
exports.approvedBill = async (req, res) => {
    try {
        res.json(200).json({ status: "success" });
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
        await authService.resetPasswordMail(data);
        res.status(200).json({ message: "Bills sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send bills" });
    }
}
