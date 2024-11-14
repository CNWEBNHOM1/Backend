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
const RequestModel = require('../db/requestModel');

require('dotenv').config();

// Guest Service 
exports.createRequest = async (data) => {
    const room = data.roomselected;
    const department = data.departmentselected;
    const target = await RoomModel.findOne({ name: room, department: department });
    if (target.occupiedSlots === target.capacity)
        throw new Error("This room is full!");
    target.occupiedSlots++;
    target.save();
    data.trangthai = "pending";
    return await RequestModel.create(data);
}
exports.getAllRoomsAvailable = async () => {
    const rooms = await RoomModel.find({
        tinhtrang: 'Bình thường'
    });
    const roomList = rooms.filter(room => {
        return Number(room.occupiedSlots) < Number(room.capacity);
    });
    if (!roomList[0]) throw new Error("Het phong roi");
    return roomList;

};
exports.getOwnRequest = async (email) => {
    return await RequestModel.find(
        {
            email: email,
        }
    )
}
// Student Service 
exports.getListRoommates = async (email) => {

    const student = await StudentModel.findOne(
        {
            email: email
        }
    );
    if (!student) throw new Error("Student not found");
    const listStudent = await StudentModel.find({
        roomselected: student.room,
        department: student.department,
        email: { $ne: email }
    })
    if (!listStudent[0]) throw new Error("phong ko co ai ngoai ban")
    return listStudent;
};
exports.getMyInfo = async (email) => {
    return await StudentModel.find(
        {
            email: email,
        }
    );
};
exports.uploadBillProof = async (email, image, billId) => {
    if (!image) throw new Error('Image is required')
    const student = await studentModel.findOne({
        email: email
    })
    // return student;
    if (!student) throw new Error("Student not found");

    const roomNum = Number(student.room);
    if (isNaN(roomNum)) {
        throw new Error("Undefined room");
    }
    else {
        console.log(roomNum);
    }


    const bill = await BillModel.findById(billId);
    if (!bill) throw new Error("No pending bill found, or the bill may already be paid");
    bill.anhminhchung = image.filename;
    bill.trangthai = "Chờ xác nhận";
    return await bill.save();
    // bill.forEach(ChangeStateBill);
    // for (var i = 0; i < bill.length; i++) {
    //     const bill = bills[i]
    //     bill.anhminhchung = image.filename;
    //     bill.trangthai = "Chờ xác nhận";
    //     await bill.save();
    //     // await bill[i].save;

    // }
    // const bill = await BillModel.find({
    //     trangthai: "Chờ xác nhận",
    //     department: student.department,
    //     room: roomNum
    // })
    // for (var i = 0; i < bill.length; i++) {
    //     bill[i].anhminhchung = "";
    //     bill[i].trangthai = "Chưa đóng";
    //     await bill[i].save;

    // }
    // console.log(bills);
    // return await bills.save;
};
exports.createReport = async (email, noidung) => {
    console.log(email);
    const student = await studentModel.findOne({
        email: email
    })
    if (!student) throw new Error("Student not found");

    const department = student.department;
    const sRoom = student.room;
    if (department === "none" && sRoom === "none") throw new Error("Student not in any room");
    const room = Number(sRoom);
    const ngaygui = Date.now();
    const trangthai = "Chưa xử lý";

    const data =
    {
        department: department,
        room: room,
        ngaygui: ngaygui,
        trangthai: trangthai,
        noidung: noidung,
        ngayxuly: null,
        ghichu: null,

    };
    // const report = await  reportModel.create(data)
    return await ReportModel.create(data)
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
// exports.fix = async (email) => {
//     const student = await studentModel.findOne({
//         email: email
//     })

//     const bill = await ReportModel.find();
//     return {
//         length: bill.length,
//         bill
//     };
// }
exports.getListBills = async (email) => {
    const student = await studentModel.findOne({
        email: email
    })
    if (!student) throw new Error('Student not found');
    if (student.room === "none" && student.department === "none") throw new Error("Student not in any room");
    // console.log(student)
    const bill = await billModel.find({
        department: student.department,
        room: student.room
    })
    if (!bill[0]) throw new Error('Bill not found ');
    return bill;
}
// Manager Service 
exports.getAllStudents = async () => {
    return await StudentModel.find()
}
// exports.getAllWaitingStudents = async () => {
//     return await StudentModel.find(
//         {
//             trangthai: "pending"
//         }
//     )
// }
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

    const totalPages = Math.ceil(totalRoom / limit);

    return {
        total: totalRoom,
        page: parseInt(page),
        pageSize: parseInt(limit),
        totalPages,
        listRoom
    };
};
exports.addStudent = async (data) => {
    return StudentModel.create(data);
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
    return await StudentModel.findByIdAndUpdate(id, data, { new: true });
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
exports.getAllBills = async (data) => {
    const {
        page = 1,
        limit = 10,
        room = null,
        department = null,
        trangthai = null,
        overdue = false,
        fromDate = null,
        toDate = null,
        sortOrder = -1 // Mặc định là giảm dần nếu không có giá trị
    } = data;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    // Tạo đối tượng filter dựa vào department, room, trangthai, overdue, fromDate và toDate
    const filter = {};

    if (department) {
        filter.department = department;
    }

    if (room) {
        filter.$expr = {
            $regexMatch: {
                input: { $toString: "$room" },
                regex: room.toString(),
                options: 'i'
            }
        };
    }

    if (trangthai) {
        filter.trangthai = trangthai;
    }

    if (overdue) {
        const today = new Date();
        filter.handong = { $lt: today };
    }

    if (fromDate || toDate) {
        filter.handong = filter.handong || {};
        if (fromDate) {
            filter.handong.$gte = new Date(fromDate);
        }
        if (toDate) {
            filter.handong.$lte = new Date(toDate);
        }
    }

    // Tính tổng số tài liệu dựa vào filter
    const totalBills = await BillModel.countDocuments(filter);

    // Tính tổng số trang
    const totalPages = Math.ceil(totalBills / limitInt);

    // Lấy danh sách hóa đơn đã phân trang dựa trên filter và sắp xếp theo handong
    const bills = await BillModel.find(filter)
        .sort({ handong: sortOrder }) // Sắp xếp theo handong theo thứ tự người dùng chọn
        .skip((pageInt - 1) * limitInt)
        .limit(limitInt);

    return {
        total: totalBills,
        totalPages,
        page: pageInt,
        pageSize: limitInt,
        listBill: bills
    };
};
exports.getOutDateBills = async () => {
    return await BillModel.find({ trangthai: "Quá hạn" }); // trả về một mảng
}
// Khởi tạo hóa đơn 
exports.createBills = async () => {
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
    const b = await BillModel.findById(id);
    b.sodiencuoi = data.sodiencuoi;
    b.thanhtien = (b.sodiencuoi - b.sodiendau) * b.dongia;
    return await b.save();
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
        const department = await departmentModel.findOne({ name: item.department });
        const room = await RoomModel.findOne({ department: item.department, name: item.room });
        const emails = await StudentModel.find(
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
exports.getAllDepartments = async (data) => {
    const {
        page = 1,
        limit = 10,
        name = ''
    } = data;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    const filter = {};
    if (name) {
        filter.name = { $regex: name, $options: 'i' };
    }

    const totalDepartment = await departmentModel.countDocuments(filter);

    const totalPages = Math.ceil(totalDepartment / limitInt);

    const departments = await departmentModel.find(filter)
        .skip((pageInt - 1) * limitInt)
        .limit(limitInt);

    return {
        total: totalDepartment,
        totalPages,
        page: pageInt,
        pageSize: limitInt,
        listDepartment: departments
    };
}
exports.getAllReports = async (data) => {
    const {
        page = 1,
        limit = 10,
        room = null,
        department = null,
        trangthai = null,
        fromDate = null,
        toDate = null,
        sortOrder = -1 // Mặc định là giảm dần nếu không có giá trị
    } = data;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    // Tạo đối tượng filter dựa vào department, room, trangthai, overdue, fromDate và toDate
    const filter = {};

    if (department) {
        filter.department = department;
    }

    if (room) {
        filter.$expr = {
            $regexMatch: {
                input: { $toString: "$room" },
                regex: room.toString(),
                options: 'i'
            }
        };
    }

    if (trangthai) {
        filter.trangthai = trangthai;
    }


    if (fromDate || toDate) {
        filter.ngaygui = filter.ngaygui || {};
        if (fromDate) {
            filter.ngaygui.$gte = new Date(fromDate);
        }
        if (toDate) {
            filter.ngaygui.$lte = new Date(toDate);
        }
    }

    // Tính tổng số tài liệu dựa vào filter
    const totalReports = await ReportModel.countDocuments(filter);

    // Tính tổng số trang
    const totalPages = Math.ceil(totalReports / limitInt);

    // Lấy danh sách hóa đơn đã phân trang dựa trên filter và sắp xếp theo handong
    const bills = await ReportModel.find(filter)
        .sort({ ngaygui: sortOrder }) // Sắp xếp theo handong theo thứ tự người dùng chọn
        .skip((pageInt - 1) * limitInt)
        .limit(limitInt);

    return {
        total: totalReports,
        totalPages,
        page: pageInt,
        pageSize: limitInt,
        listReport: bills
    };
}
exports.updateReport = async (id, data) => {
    return await ReportModel.findByIdAndUpdate(id, data, { new: true });
}
exports.updateRequest = async (id, data, file) => {
    if (file) {
        data.minhchung = file.filename;
    }
    return await RequestModel.findByIdAndUpdate(id, data, { new: true });
}
exports.handleRequest = async (id, action) => {
    const request = await RequestModel.findById(id);
    if (action === "approved") {
        const std = request;
        std.expiry = "2024-01-29"; delete std.holdexpiry;
        std.ngaybatdau = std.ngaycapnhat;
        delete std.trangthai;
        delete std.ngaytao;
        delete std.minhchung;
        std.room = std.roomselected; delete std.roomselected;
        std.department = std.departmentselected; delete std.departmentselected;
        std.trangthai = "Đang ở";
        await this.addStudent(std);
        const acc = await UserModel.find(data.email);
        acc.role = "Sinh viên";
        acc.save();
        request.trangthai = "approved";
    } else if (action === "declined") {
        const target = await RoomModel.findOne({ name: request.roomselected, department: request.departmentselected });
        target.occupiedSlots--;
        target.save();
        request.trangthai = "Declined";
    }
    await request.save();
}
exports.checkExpiredRequests = async () => {
    const now = new Date();
    try {
        const expiredRequests = await RequestModel.find({
            trangthai: 'pending',
            holdexpiry: { $lte: now },
            minhchung: { $exists: false }
        });

        if (expiredRequests.length > 0) {
            for (const request of expiredRequests) {
                request.trangthai = 'declined';
                await request.save();
            }
            console.log(`Declined ${expiredRequests.length} expired requests.`);
        }
    } catch (error) {
        console.error('Error checking expired requests:', error);
    }
};
exports.createDepartment = async (data) => {
    return await departmentModel.create(data);
}
exports.detailStudent = async (id) => {
    return await StudentModel.findById(id);
}
exports.detailRoom = async (id) => {
    return await RoomModel.findById(id);
}
exports.detailBill = async (id) => {
    return await BillModel.findById(id);
}
exports.detailDepartment = async (id) => {
    return await departmentModel.findById(id);
}
exports.detailRequest = async (id) => {
    return await RequestModel.findById(id);
}
exports.detailReport = async (id) => {
    return await ReportModel.findById(id);
}
// Xuất hóa đơn cho từng phòng, danh sách excel