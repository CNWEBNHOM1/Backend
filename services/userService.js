const StudentModel = require("../db/studentModel");
const RoomModel = require("../db/roomModel");

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
exports.getMyInfo = async(email) => {
    return await StudentModel.find(
       {
        email: email,
       } 
    );
};
// Manager Service 
exports.getAllStudents = async() => {
    return await StudentModel.find()
}
exports.getAllRooms = async() => {
    return await RoomModel.find();
}
exports.pendingStudent= async(email, room, minhchung) => {
    const usr = StudentModel.find()
}
exports.addStudentToRoom = async() => {

}
exports.removeStudentFromRoom = async() => {

}