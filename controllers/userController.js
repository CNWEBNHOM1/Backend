const userService = require('../services/userService');

// Guest controller
exports.writeInfo = async (req, res) => {
    try {
        const std = await userService.writeInfo(req.body);
        res.json({ data: std, status: "success" });
    } catch(err) {
        res.status(500).json({error: err.message});
    }
}

// Student controller 
exports.getListRoommates = async (req, res) => {
    try {
        const roommates = await userService.getListRoommates(req.room);
        res.json({ data: roommates, status: "success" });
    } catch(err) {
        res.status(500).json({error: err.message});
    }
};
exports.getMyInfo = async (req, res) => {
    try {
        const roommates = await userService.getMyInfo(req.email);
        res.json({ data: roommates, status: "success" });
    } catch(err) {
        res.status(500).json({error: err.message});
    }
};
// Manager controller 
exports.getAllStudents = async (req, res) => {
    try {
        const allstd = await userService.getAllStudents();
        res.status(200).json({data: allstd, status: "success"});
    } catch(err) {
        res.status(500).json({error: err.message});
    }
}
exports.getAllRooms = async (req, res) => {
    try {
        const allr = await userService.getAllRooms();
        res.status(200).json({data: allr, status: "success"});
    } catch(err) {
        res.status(500).json({error: err.message});
    }
}
exports.approveStudentToRoom = async (req, res) => {
    try {
        const data = await userService.approveStudentToRoom(req.email);
        res.status(200).json({data: data, status: "success"});
    } catch(err) {
        res.status(500).json({error: err.message});
    }
}
exports.declineStudent = async (req, res) => {
    try {
        const data = await userService.declineStudent(req.body.email)
        res.status(200).json({data: data, status: "success"});
    } catch(err) {
        res.status(500).json({error: err.message});
    }
}
exports.kickOneStudents = async (req, res) => {
    try {
        const data = await userService.kickOneStudents(req.body.email);
        res.status(200).json({data: data, status: "success"});
    } catch(err) {
        res.status(500).json({error: err.message});
    }
}