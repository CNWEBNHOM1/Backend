const StudentModel = require("../db/studentModel");

// Student Service 
exports.getListRoommates = async(room) => {
    return await StudentModel.find(
       {
        room: room,
       } 
    );
};
exports.getMyInfo = async(id) => {
    return await StudentModel.find(
       {
        id: id,
       } 
    );
};
// Manager Service 