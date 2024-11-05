const nodemailer = require('nodemailer');
const StudentModel = require("../db/studentModel");
const RoomModel = require("../db/roomModel");
const UserModel = require("../db/userModel");
const BillModel = require("../db/billModel");

require('dotenv').config();

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
// Manager Service 
exports.getAllStudents = async () => {
    return await StudentModel.find()
}
exports.getAllWaitingStudents = async() => {
    return await StudentModel.find(
        {
            trangthai: "pending"
        }
    )
}
exports.getAllRooms = async () => {
    return await RoomModel.find().sort({ department: 1 });
}
exports.getAllRoomsOfDepartment = async(data) => {
    const { page = 1, limit = 10, department = "B5" } = data;
    const listRoom = await RoomModel.find(
        {
            department: department,
        }
    ) 
        .skip((page - 1) * limit) 
        .limit(parseInt(limit)); 
    const totalRoom = await RoomModel.countDocuments();
    return {
        total: totalRoom,
        page: parseInt(page),
        pageSize: parseInt(limit),
        listRoom
    };
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
exports.getOutDateBills = async () => {
    return await BillModel.find({ handong: { $lt: ngaydong } });
}

exports.approvedBill = async (bill) => {
    bill.trangthai = 'Đã đóng';
    await(bill.save())
}

exports.createBill = async () => {
    const rooms = await RoomModel.find(
        {
            tinhtrang: 'Bình thường',
        }
    ).sort({ department: 1 });
    const bills = rooms.map(room => {
        return {
            department: room.department,
            room: room.name,
            sodiendau: room.sodiencuoi,
            sodiencuoi: null,
            dongia: null,
            thanhtien: null,
            handong: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            trangthai: 'Chưa đóng',
            ngaydong: null,
            anhminhchung: null,
        };
    });
    await BillModel.insertMany(bills);
} 
exports.sendMail = async (mailOptions) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.mailUser,
            pass: process.env.mailPass
        }
    });
    return transporter.sendMail(mailOptions);
}
// Cập nhật hóa đơn cho các phòng
// Xuất hóa đơn cho từng phòng, 
// danh sách pdf, excel
// Gửi thông báo tiền phòng đến email của sinh viên