const StudentModel = require("../db/studentModel");

// Guest Service 
exports.writeInfo = async(info) => {
    return await StudentModel.create(info);
}
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