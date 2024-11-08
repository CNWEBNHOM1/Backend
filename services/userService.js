const nodemailer = require('nodemailer');
const StudentModel = require("../db/studentModel");
const RoomModel = require("../db/roomModel");
const UserModel = require("../db/userModel");
const BillModel = require("../db/billModel");
const departmentModel = require('../db/departmentModel');
const studentModel = require('../db/studentModel');
const roomModel = require('../db/roomModel');
const billModel = require('../db/billModel');
const ReportModel = require('../db/reportModel');

require('dotenv').config();

// Guest Service 
exports.writeInfo = async (info) => {
    return await StudentModel.create(info);
}
exports.getAllRoomsAvailable = async () => {
    const rooms = await RoomModel.find({
        tinhtrang: 'Bình thường'
    });
    const roomList = rooms.filter(room => {
        return Number(room.occupiedSlots) < Number(room.capacity);
    });

    return roomList;
};

// Student Service 
exports.getListRoommates = async (email) => {

    const student = await StudentModel.findOne(
        {
            email: email
        }
    );
    if (!student) throw new Error("Student not found");
    const listStudent = await StudentModel.find({
        roomselected: student.roomselected,
        department: student.department,
        email: { $ne: email }
    })
    return listStudent;
};
exports.getMyInfo = async (email) => {
    return await StudentModel.find(
        {
            email: email,
        }
    );
};
exports.uploadBillProof = async (email, image) => {
    if (!image) throw new Error('Image is required')
    const student = await studentModel.find({
        email: email
    })
    // return student;
    if (!student[0]) throw new Error("Student not found");

    const roomNum = Number(student[0].roomselected);
    if (isNaN(roomNum)) {
        throw new Error("Undefined room");
    }
    else {
        console.log(roomNum);
    }


    const bill = await billModel.find({
        trangthai: "Chưa đóng",
        department: student[0].departmentselected,
        room: roomNum
    })
    if (!bill[0]) throw new Error("No pending bill found, or the bill may already be paid");
    bill.anhminhchung = image.path;
    bill.trangthai = "Chờ xác nhận";
    await bill.save;
    return bill;
};
exports.createReport = async () => {
    return {

    }
}
exports.roomRegister = async (data) => {
    const student = await studentModel.findOne({
        email: data.email
    });
    if (!student) {
        throw new Error('Student not found');
    };
    if (student.roomselected && student.trangthai === "approved") {
        throw new Error('Student has already been assigned a room and approved');
    }
    const room = await roomModel.findOne({
        name: data.roomName,
        department: data.department
    });
    if (!room) {
        throw new Error('Room not found');
    };
    if (room.occupiedSlots >= room.capacity) {
        throw new Error('Room is fully occupied');
    };
    student.roomselected = room.name;
    student.departmentselected = room.department;
    student.trangthai = "pending";
    room.occupiedSlots += 1;
    await student.save();
    await room.save();
    return {
        student, room
    };
}
exports.updateStudentProfile = async (data) => {
    const student = await studentModel.findOne({
        email: data.email
    })
    student.family = data.family;
    student.trangthai = data.trangthai;
    await student.save();
    return student;
}
exports.getListBills = async (email) => {
    const student = await studentModel.findOne({
        email: email
    })
    if (!student) throw new Error('Student not found');
    const bill = await billModel.findOne({
        department: student.departmentselected,
        room: student.roomselected
    })
    if (!bill) throw new Error('Bill not found');
    return bill;
}
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
exports.createRoom = async (data) => {
    return await RoomModel.create(data);
}
exports.updateRoom = async (id, data) => {
    return await RoomModel.findByIdAndUpdate(id, data);
}
exports.getAllRooms = async () => {
    return await RoomModel.find().sort({ department: 1 });
}
exports.getAllRoomsOfDepartment = async (data) => {
    const { page = 1, limit = 10, department } = data;

    // Tạo filter, nếu department có giá trị thì thêm điều kiện, nếu không thì lấy tất cả
    const filter = department ? { department: department } : {};

    const listRoom = await RoomModel.find(filter)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    // Đếm tổng số phòng theo filter
    const totalRoom = await RoomModel.countDocuments(filter);

    return {
        total: totalRoom,
        page: parseInt(page),
        pageSize: parseInt(limit),
        listRoom
    };
};
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
exports.updateStudent = async (id, data) => {
    if (data.trangthai === "approved") {
        UserModel.findOneAndUpdate(
            { email: data.email },
            { $set: { role: "Sinh viên" } },
            { returnDocument: "before" | "after" },
        );
    } else if (data.trangthai === "pending") {

    }
    return StudentModel.findByIdAndUpdate(id, data, { new: true });
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
    const data = await BillModel.find();
    for (item of data) {
        if (item.trangthai === "Chưa đóng" && item.handong < new Date()) {
            item.trangthai = "Quá hạn";
        };
        item.save();
    }

    return data;
}
exports.getOutDateBills = async () => {
    return await BillModel.find({ trangthai: "Quá hạn" }); // trả về một mảng
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
    BillModel.insertMany(bills);
    return bills;
}
exports.updateBill = async (id, data) => {
    return await BillModel.findByIdAndUpdate(id, data);
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
exports.searchStudents = async (query) => {
    const searchConditions = [];
    if (!isNaN(query) && query.trim() !== "") {
        searchConditions.push({ "sid": Number(query) });
    }

    if (query.trim() !== "") {
        searchConditions.push({ "name": { $regex: new RegExp(query + '.*'), $options: 'i' } });
    }

    return await StudentModel.find({
        $or: searchConditions
    });
};
exports.getAllDepartments = async () => {
    return departmentModel.find();
}
exports.getAllReports = async () => {
    return ReportModel.find();
}
exports.updateReport = async (id, data) => {
    return await ReportModel.findByIdAndUpdate(id, data);
}
// Xuất hóa đơn cho từng phòng, danh sách pdf, excel, up pdf, excel