const StudentModel = require("../db/studentModel");
const RoomModel = require("../db/roomModel");
const UserModel = require("../db/userModel");

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
exports.approveStudentToRoom = async(email) => {
    const student = await StudentModel.find(
        {
            email: email,
        }
    );
    const acc = await UserModel.find(
        {
            email: email,
        }
    );
    acc.role = "Sinh viên";
    student.trangthai = "approved";
    
    return await student.save();
}
exports.declineStudent = async(email) => {
    const student = await StudentModel.find(
        {
            email: email,
        }
    );
    const room = await RoomModel.find(
        {
            name: student.roomselected,
        }
    );
    student.roomselected = "none";
    student.trangthai = "none";
    room.occupiedSlots++;

    await room.save();
    return await student.save();
}
exports.kickOneStudents = async() => {
    const student = await StudentModel.find(
        {
            email: email,
        }
    );

    const acc = UserModel.find(
        {
            email: email,
        }
    );

    const r = RoomModel.find(
        {
            name: student.roomselected,
        }
    )
    r.occupiedSlots--;
    acc.role = "Khách";
    student.trangthai = "kicked";
    student.roomselected = "none";

    r.save();
    acc.save();
    student.save();

    return;
}