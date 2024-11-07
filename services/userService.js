const nodemailer = require('nodemailer');
const StudentModel = require("../db/studentModel");
const RoomModel = require("../db/roomModel");
const UserModel = require("../db/userModel");
const BillModel = require("../db/billModel");
const departmentModel = require('../db/departmentModel');

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
exports.getAllWaitingStudents = async () => {
    return await StudentModel.find(
        {
            trangthai: "pending"
        }
    )
}
exports.getAllRooms = async () => {
    return await RoomModel.find().sort({ department: 1 });
}
/*
exports.getAllRoomsOfDepartment = async (data) => {
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
*/
exports.getAllRoomsOfDepartment = async (data) => {
    const { page = 1, limit = 10, department } = data;
    // Tạo filter, nếu department có giá trị thì thêm điều kiện, nếu không thì lấy tất cả
    const filter = department ? { department: department } : {};

    const listRoom = await RoomModel.find(filter)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    
    // Đếm tổng số phòng theo filter
    const totalRoom = await RoomModel.countDocuments(filter);

     // Tính tổng số trang
     const totalPages = Math.ceil(totalRoom / limit);

    return {
        total: totalRoom,
        totalPages: totalPages,
        page: parseInt(page),
        pageSize: parseInt(limit),
        listRoom
    };
};

exports.approveStudentToRoom = async (email) => {
    const student = await StudentModel.findOne(
        {
            email: email,
        }
    );
    const acc = await UserModel.findOne(
        {
            email: email,
        }
    );
    acc.role = "Sinh viên";
    student.trangthai = "approved";

    return await student.save();
}
exports.declineStudent = async (email) => {
    const student = await StudentModel.findOne(
        {
            email: email,
        }
    );
    const room = await RoomModel.findOne(
        {
            name: student[0].roomselected,
            department: student[0].departmentselected,
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
    const student = await StudentModel.findOne(
        {
            email: email,
        }
    );

    const acc = await UserModel.findOne(
        {
            email: email,
        }
    );

    const r = await RoomModel.findOne(
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
    const std = await StudentModel.findOne(
        {
            email: email,
        }
    );
    const r = await RoomModel.findOne(
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
    return await BillModel.find({ handong: { $lt: ngaydong } }); // trả về một mảng
}

exports.approvedBill = async (id) => {
    const bill = await BillModel.findById(id);
    bill.trangthai = 'Đã đóng';
    await (bill.save())
}
// Khởi tạo hóa đơn 
exports.createBill = async () => {
    const rooms = await RoomModel.find(
        {
            tinhtrang: 'Bình thường',
        },
        {
            department: 1,
            name: 1,
            sodiencuoi: 1,
            dongiadien: 1,
        }
    ).sort({ department: 1 });
    const bills = rooms.map(room => {
        const handong = new Date();
        handong.setDate(handong.getDate() + 15);
        return {
            department: room.department,
            room: room.name,
            sodiendau: room.sodiencuoi,
            sodiencuoi: 0,
            dongia: room.dongiadien,
            thanhtien: 0,
            handong: handong,
            trangthai: "Chưa đóng",
            anhminhchung: "",
        };
    });
    return bills;
}
exports.insertBills = async (data) => {
    return await BillModel.insertMany(data);
}
exports.sendBills = async (data) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.mailUser,
            pass: process.env.mailPass
        }
    });
    let mailOptions = {
        from: `BQL KTX ĐHBKHN <${process.env.mailUser}>`,
        subject: `Tiền phòng KTX tháng ${data[0].handong.getMonth() + 1}`,
    };

    for (const item of data) {
        const department = departmentModel.findOne({ name: item.department });
        const room = RoomModel.findOne({ department: item.department, name: item.room });
        const emails = StudentModel.find(
            {
                roomselected: room.name,
                departmentselected: department.name
            },
            {
                email: 1,
            }
        );
        mailOptions.to = emails.join(", ");
        mailOptions.html = `
            <h3>Hóa đơn tiền điện</h3>
            <table border="1" cellpadding="10" cellspacing="0">
            <thead>
                <tr>
                    <th>Phòng</th>
                    <th>Tòa</th>
                    <th>Số điện đầu</th>
                    <th>Số điện cuối</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th>Hạn đóng</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${item.department}</td>
                    <td>${item.room}</td>
                    <td>${item.sodiendau}</td>
                    <td>${item.sodiencuoi}</td>
                    <td>${item.dongia}</td>
                    <td>${item.thanhtien}</td>
                    <td>${item.handong}</td>
                </tr>
            </tbody>
            </table>
        `;
        transporter.sendMail(mailOptions);
    }
    return;
}
// Xuất hóa đơn cho từng phòng, danh sách pdf, excel, up pdf, excel