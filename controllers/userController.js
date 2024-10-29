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
        const roommates = await userService.getMyInfo(req.id);
        res.json({ data: roommates, status: "success" });
    } catch(err) {
        res.status(500).json({error: err.message});
    }
};
// Manager controller 
