const StudentModel = require("../db/studentModel");
const RoomModel = require("../db/roomModel");
const UserModel = require("../db/userModel");
const BillModel = require("../db/billModel")

// Guest Service 
exports.writeInfo = async (info) => {
    return await StudentModel.create(info);
}
// Student Service 
exports.getListRoommates = async (department, room) => {
    return await StudentModel.find(
        {
            roomselected: room,
            departmentselected: department,
        }
    );
};
exports.getMyInfo = async (email) => {
    return await StudentModel.find(
        {
            email: email,
        }
    );
};
exports.transferPayment = async (req, res) => {
    return {
        ok: 'ok'
    };//chuyen trang thai thanh toan,vv
};

// Manager Service 
exports.getAllStudents = async () => {
    return await StudentModel.find()
}
exports.getAllRooms = async () => {
    return await RoomModel.find();
}
exports.approveStudentToRoom = async (email) => {
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
exports.declineStudent = async (email) => {
    const student = await StudentModel.find(
        {
            email: email,
        }
    );
    const room = await RoomModel.find(
        {
            name: student.roomselected,
            department: student.departmentselected,
        }
    );
    student.roomselected = "none";
    student.departmentselected = "none";
    student.trangthai = "none";
    room.occupiedSlots++;

    await room.save();
    return await student.save();
}
exports.kickOneStudents = async () => {
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
            department: student.departmentselected,
        }
    )
    r.occupiedSlots--;
    acc.role = "Khách";
    student.trangthai = "kicked";
    student.roomselected = "none";
    student.departmentselected = "none";

    r.save();
    acc.save();
    student.save();

    return;
}
exports.kickAllStudents = async () => {
    await StudentModel.updateMany(
        { roomselected: { $ne: "none" } },
        {
            $set: {
                roomselected: "none",
                departmentselected: "none",
                status: "none",
            },
        }
    );
    await RoomModel.updateMany(
        { occupiedSlots: { $gt: 0 } },
        {
            $set: {
                occupiedSlots: 0,
            },
        }
    );
    await UserModel.updateMany(
        { role: "Student" },
        {
            $set: {
                role: "Guest",
            },
        }
    );
    return;
}
exports.transferRoom = async (email, department, room) => {
    const r_change = await RoomModel.find(
        {
            name: room,
            department: department,
        }
    );
    if (r_change.occupiedSlots == r_change.capacity) throw new Error("New room is full!");
    const std = await StudentModel.find(
        {
            email: email,
        }
    );
    const r = await RoomModel.find(
        {
            department: std.departmentselected,
            name: std.roomselected,
        }
    )

    std.roomselected = room;
    std.departmentselected = department;
    r.occupiedSlots--;
    r_change.occupiedSlots++;

    r.save(); r_change.save();
    return await std.save();
}
exports.getAllBills = async () => {
    return await BillModel.find();
}
exports.approvedBill = async (bill) => {
    bill.trangthai = 'Đã đóng'
}

