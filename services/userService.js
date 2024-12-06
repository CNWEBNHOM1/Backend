const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const StudentModel = require("../db/studentModel");
const RoomModel = require("../db/roomModel");
const UserModel = require("../db/userModel");
const BillModel = require("../db/billModel");
const DepartmentModel = require('../db/departmentModel');
const ReportModel = require('../db/reportModel');
const RequestModel = require('../db/requestModel');
const SemeterModel = require('../db/semesterModel');

require('dotenv').config();

const moment = require('moment');

const formatDate = (date) => {
    return moment(date).format('HH:mm:ss DD/MM/YYYY');
};

// Guest Service 
exports.createRequest = async (uid, data, fileURL) => {
    data.minhchung = fileURL;
    data.userId = uid;
    const { userId, roomId, name, ngaysinh, gender, sid, cccd, priority, phone, address, khoa, school, lop, minhchung } = data;
    const room = await RoomModel.findById(roomId);
    sotienphaitra = room.giatrangbi + room.tieno + room.tiennuoc;

    const newRequest = new RequestModel({
        user: userId,
        room: roomId,
        name,
        ngaysinh,
        gender,
        sid,
        cccd,
        priority,
        phone,
        address,
        khoa,
        school,
        lop,
        sotienphaitra,
        trangthai: 'pending',
        minhchung
    });
    return await newRequest.save();
}
exports.getAllRoomsAvailable = async () => {
    const rooms = await RoomModel.find({
        tinhtrang: 'Bình thường'
    }).populate('department');
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
exports.updateRequest1 = async (roomId) => {
    const room = await RoomModel.findById(roomId);
    return await RoomModel.findOneAndUpdate(
        { _id: roomId, occupiedSlots: { $lt: room.capacity } },
        { $inc: { occupiedSlots: 1 } },
        { new: true },
    );
}
exports.updateRequest2 = async (roomId) => {
    return await RoomModel.findByIdAndUpdate(
        roomId,
        { $inc: { occupiedSlots: -1 } },
        { new: true },
    );
}
exports.getAllRoomsAvailable = async () => {
    const rooms = await RoomModel.find({
        tinhtrang: 'Bình thường'
    }).populate('department');
    const roomList = rooms.filter(room => {
        return Number(room.occupiedSlots) < Number(room.capacity);
    });
    if (!roomList[0]) throw new Error("Het phong roi");
    return roomList;

};
// Student Service 
exports.getListRoommates = async (email) => {
    const user = await UserModel.findOne({
        email: email
    });
    if (!user) throw new Error('User not exist');

    const student = await StudentModel.findOne({ user: user._id }).populate('user');

    if (!student) throw new Error("Student not found");
    const listStudent = await StudentModel.find({
        room: student.room,
        // user: { $ne: student.user }
    })
    if (!listStudent[1]) throw new Error("phong ko co ai ngoai ban")
    return listStudent;
};
exports.getMyInfo = async (email) => {
    const user = await UserModel.findOne({
        email: email
    });
    if (!user) throw new Error('User not exist');

    const student = await StudentModel.findOne({ user: user._id }).populate('user').populate('room');
    if (!student) throw new Error('Student not found');
    return student;
}
exports.uploadBillProof = async (email, image, billId) => {
    if (image === "") throw new Error('Image is required');
    const user = await UserModel.findOne({
        email: email
    });
    if (!user) throw new Error('User not exist');

    const student = await StudentModel.findOne({ user: user._id }).populate('user');
    if (!student) throw new Error("Student not found");


    const bill = await BillModel.findOne({
        room: student.room,
        _id: billId
    });
    if (!bill) throw new Error("No pending bill found, or the bill may already be paid");
    console.log(bill);
    bill.anhminhchung = image;
    bill.trangthai = "Chờ xác nhận";
    console.log(bill);
    return await bill.save();
}
exports.createReport = async (email, image, noidung) => {
    if (image === "") throw new Error('Image is required');
    const user = await UserModel.findOne({
        email: email
    });
    if (!user) throw new Error('User not exist');

    const student = await StudentModel.findOne({ user: user._id }).populate('user');
    if (!student) throw new Error("Student not found");

    const ghichu = "";
    const trangthai = "Chưa xử lý";

    const data =
    {

        room: student.room,
        trangthai: trangthai,
        noidung: noidung,
        ghichu: ghichu,
        minhchung: image

    };
    return await ReportModel.create(data)
}
exports.getListBills = async (email, query) => {
    const user = await UserModel.findOne({ email: email });
    if (!user) throw new Error('User not exist');

    const student = await StudentModel.findOne({ user: user._id }).populate('user');
    if (!student) throw new Error("Student not found");

    const { trangthai, page, limit, sortBy = 'createAt', order = 'asc' } = query;

    const validSortBy = ['thanhtien', 'createAt'];
    const validOrder = ['asc', 'desc'];

    const filters = { room: student.room };
    if (trangthai) filters.trangthai = trangthai;


    const sort = validSortBy.includes(sortBy) ? sortBy : 'createAt';
    const direction = validOrder.includes(order) ? order : 'asc';


    const pageNumber = Math.max(1, parseInt(page) || 1);
    const pageLimit = Math.max(1, parseInt(limit) || 10);

    const bills = await BillModel.find(filters)
        .populate('room')
        .sort({ [sort]: direction === 'desc' ? -1 : 1 })
        .skip((pageNumber - 1) * pageLimit)
        .limit(pageLimit);

    if (!bills.length) throw new Error('Bill not found');

    return {
        total: bills.length,
        bills
    };
}
// Manager Service 
exports.getAllStudents = async (filters = {}, page = 1, limit = 10) => {
    // Convert page và limit thành số
    const pageNumber = parseInt(page, 10) || 1;
    const pageLimit = parseInt(limit, 10) || 10;

    // Tính toán các thông số phân trang
    const skip = (pageNumber - 1) * pageLimit;

    // Lọc theo các tham số filters
    const filterConditions = {};

    // Lọc theo name (không phân biệt hoa thường)
    if (filters.name) {
        filterConditions.name = { $regex: filters.name, $options: 'i' };
    }

    if (filters.trangthai) {
        filterConditions.trangthai = filters.trangthai;
    }

    // Lọc theo room
    if (filters.room) {
        filterConditions.room = filters.room;
    }

    // Lọc theo department (nối từ room)
    // if (filters.department) {
    //     filterConditions['room.department'] = filters.department;
    // }
    if (filters.department) {
        const roomsInDepartment = await RoomModel.find({ department: filters.department }).select('_id');
        filterConditions.room = { $in: roomsInDepartment.map(room => room._id) };
    }

    // Lọc theo gender
    if (filters.gender) {
        filterConditions.gender = filters.gender;
    }

    // Lọc theo sid
    if (filters.sid) {
        filterConditions.sid = { $regex: filters.sid, $options: 'i' };
    }

    // Lọc theo cccd
    if (filters.cccd) {
        filterConditions.cccd = filters.cccd;
    }

    // Lọc theo khoa
    if (filters.khoa) {
        filterConditions.khoa = filters.khoa;
    }
    // Lấy danh sách sinh viên
    const students = await StudentModel.find(filterConditions)
        .populate({
            path: 'room',
            populate: {
                path: 'department', // Nối với department
                model: 'Departments'
            }
        })
        // .populate({
        //     path: 'kyhoc.semester',
        //     model: 'Semesters' // Nối với model Semesters
        // })
        // .populate({
        //     path: 'kyhoc.room',
        //     model: 'Rooms' // Nối với model Rooms trong kyhoc
        // })
        .populate('user') // Nối với thông tin user
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 });

    // Tổng số sinh viên khớp với điều kiện lọc
    const totalStudents = await StudentModel.countDocuments(filterConditions);

    // Tổng số trang
    const totalPages = Math.ceil(totalStudents / pageLimit);

    // Trả về kết quả
    return {
        data: students,
        totalStudents,
        totalPages,
        currentPage: pageNumber,
        pageLimit
    };
}
exports.getAllUsers = async () => {
    return UserModel.find();
}
exports.createRoom = async (data) => {
    const { name, department, gender, capacity, giatrangbi, tieno, tiennuoc, sodiencuoi, dongiadien, sophongvs, binhnuocnong, dieuhoa } = data;

    const roomExists = await RoomModel.find({ name: name, department: department });
    if (roomExists)
        throw new Error('Room exist');
    const newRoom = new RoomModel({
        name,
        department,
        gender,
        capacity,
        giatrangbi,
        tieno,
        tiennuoc,
        sodiencuoi,
        dongiadien,
        sophongvs,
        binhnuocnong,
        dieuhoa
    });

    return await newRoom.save();
}
exports.updateRoom = async (id, data) => {
    const {
        name, department, gender, capacity, occupiedSlots, giatrangbi, tieno, tiennuoc, sodiencuoi,
        dongiadien, sophongvs, binhnuocnong, dieuhoa, tinhtrang
    } = data;
    // Tìm và cập nhật room dựa vào id
    const updatedRoom = await RoomModel.findByIdAndUpdate(
        id,
        {
            name, department, gender, capacity, occupiedSlots, giatrangbi, tieno, tiennuoc, sodiencuoi,
            dongiadien, sophongvs, binhnuocnong, dieuhoa, tinhtrang
        },
        { new: true, runValidators: true } // Trả về phòng đã được cập nhật và kiểm tra validation
    );
    return updatedRoom;
}
exports.getAllRooms = async (data) => {
    const { page = 1, limit = 10, name = null, department = null } = data;

    const filter = {};
    if (name) {
        filter.name = { $regex: name, $options: 'i' };
    }
    if (department) {
        filter.department = department;
    }
    const listRoom = await RoomModel.find(filter).populate('department')
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
}
exports.removeStudent = async (id) => {
    const student = await StudentModel.findById(id).populate('user')
        .populate({
            path: 'room', // Nối thông tin phòng
            populate: {
                path: 'department', // Nối thông tin department trong room
                model: 'Departments' // Đảm bảo đúng model cho department
            }
        });
    student.trangthai = 'Dừng trước hạn';
    await student.save();
    await UserModel.findByIdAndUpdate(
        student.user,
        { role: 'Khách' }
    )
    await RoomModel.findByIdAndUpdate(
        student.room,
        { $inc: { occupiedSlots: -1 } }
    )
}
exports.handleUser = async (id, action) => {
    await UserModel.findByIdAndUpdate(
        id,
        { status: action },
        { new: true }
    )
}
exports.transferRoom = async (student_id, new_room_id) => {
    const student = await StudentModel.findById(student_id);
    const new_room = await RoomModel.findById(new_room_id);

    if (new_room_id.toString() === student.room.toString())
        throw new Error('This student is already in this room')
    if (new_room.gender !== student.gender)
        throw new Error('Gender not match')
    if (new_room.occupiedSlots < new_room.capacity) {
        await RoomModel.findByIdAndUpdate(student.room, { $inc: { occupiedSlots: -1 } });
        student.room = new_room_id;
        await RoomModel.findByIdAndUpdate(new_room_id, { $inc: { occupiedSlots: 1 } });
        await student.save();
    } else {
        throw new Error("New room is full");
    }
    return;
}
exports.transfer2Student = async (student1, student2) => {
    const s1 = StudentModel.findById(student1);
    const s2 = StudentModel.findById(student2);
    const tmp = s1.room;
    s1.room = s2.room; await s1.save();
    s2.room = tmp; await s2.save();
    return;
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
            filter.handong.$lt = new Date(toDate);
        }
    }

    // Tính tổng số tài liệu dựa vào filter
    const totalBills = await BillModel.countDocuments(filter);

    // Tính tổng số trang
    const totalPages = Math.ceil(totalBills / limitInt);

    // Lấy danh sách hóa đơn đã phân trang dựa trên filter và sắp xếp theo handong
    const bills = await BillModel.find(filter).populate({
        path: 'room', // Nối thông tin phòng
        populate: {
            path: 'department', // Nối thông tin department trong room
            model: 'Departments' // Đảm bảo đúng model cho department
        }
    })
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
}
exports.getOutDateBills = async () => {
    return await BillModel.find({ trangthai: "Quá hạn" }); // trả về một mảng
}
// Khởi tạo hóa đơn 
// exports.createBills = async () => {
//     const rooms = await RoomModel.find(
//         {
//             tinhtrang: 'Bình thường',
//         },
//         {
//             department: 1,
//             name: 1,
//             sodiencuoi: 1,
//             dongiadien: 1,
//         }
//     ).sort({ department: 1 });
//     const bills = rooms.map(room => {
//         const handong = new Date();
//         handong.setDate(handong.getDate() + 15);
//         return {
//             department: room.department,
//             room: room.name,
//             sodiendau: room.sodiencuoi,
//             sodiencuoi: 0,
//             dongia: room.dongiadien,
//             thanhtien: 0,
//             handong: handong,
//             trangthai: "Chưa đóng",
//             anhminhchung: "",
//         };
//     });
//     BillModel.insertMany(bills);
//     return bills;
// }
// sửa 15/11 - post
exports.createBill = async (data) => {
    const { room, sodiencuoi } = data;

    // Tìm phòng để lấy giá trị 'dongiadien'
    const foundRoom = await RoomModel.findById(room);
    if (!foundRoom) {
        throw new Error('Room not found')
    }
    const dongia = foundRoom.dongiadien;
    // Tìm bill gần nhất để lấy số điện cuối làm số điện đầu
    const lastBill = await BillModel.findOne({ room }).sort({ createdAt: -1 });
    const sodiendau = lastBill ? lastBill.sodiencuoi : 0; // Nếu chưa có bill thì sodiendau = 0

    // Tính tổng tiền
    if (sodiencuoi <= sodiendau)
        return new Error('Invalid sodiencuoi');
    const thanhtien = (sodiencuoi - sodiendau) * dongia;
    const handong = new Date();
    handong.setDate(handong.getDate() + 15);
    // Tạo bill mới
    const newBill = new BillModel({
        room,
        sodiendau,
        sodiencuoi,
        dongia,
        thanhtien,
        handong,
        trangthai: "Chưa đóng",
    });

    // Lưu vào database
    return await newBill.save();
}
exports.handleBill = async (id, action) => {
    return BillModel.findByIdAndUpdate(id, { trangthai: action }, { new: true });
}

// exports.sendBills = async (data) => {
//     let transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.mailUser,
//             pass: process.env.mailPass
//         }
//     });
//     let mailOptions = {
//         from: `BQL KTX ĐHBKHN <${process.env.mailUser}>`,
//         subject: `Tiền phòng KTX tháng ${data[0].handong.getMonth() + 1}`,
//     };

//     for (const item of data) {
//         const department = await DepartmentModel.findOne({ name: item.department });
//         const room = await RoomModel.findOne({ department: item.department, name: item.room });
//         const emails = await StudentModel.find(
//             {
//                 roomselected: room.name,
//                 departmentselected: department.name
//             },
//             {
//                 email: 1,
//             }
//         );
//         mailOptions.to = emails.join(", ");
//         mailOptions.html = `
//             <h3>Hóa đơn tiền điện</h3>
//             <table border="1" cellpadding="10" cellspacing="0">
//             <thead>
//                 <tr>
//                     <th>Phòng</th>
//                     <th>Tòa</th>
//                     <th>Số điện đầu</th>
//                     <th>Số điện cuối</th>
//                     <th>Đơn giá</th>
//                     <th>Thành tiền</th>
//                     <th>Hạn đóng</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 <tr>
//                     <td>${item.department}</td>
//                     <td>${item.room}</td>
//                     <td>${item.sodiendau}</td>
//                     <td>${item.sodiencuoi}</td>
//                     <td>${item.dongia}</td>
//                     <td>${item.thanhtien}</td>
//                     <td>${item.handong}</td>
//                 </tr>
//             </tbody>
//             </table>
//         `;
//         transporter.sendMail(mailOptions);
//     }
//     return;
// }
exports.sendBill = async (id) => {
    const bill = await BillModel.findById(id)
        .populate({
            path: 'room', // Nối thông tin phòng
            populate: {
                path: 'department', // Nối thông tin department trong room
                model: 'Departments' // Đảm bảo đúng model cho department
            }
        });
    const room = bill.room;
    const department = room.department;
    const studentsInRoom = await StudentModel.find({ room: room._id }).populate('user');
    const emails = studentsInRoom.map(student => student.user.email);
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.mailUser,
            pass: process.env.mailPass
        }
    });
    let mailOptions = {
        from: `BQL KTX ĐHBKHN <${process.env.mailUser}>`,
        subject: `Tiền điện phòng ${department.name} - ${room.name} tháng ${bill.handong.getMonth() + 1}`,
        to: emails.join(", "),  // Gửi đến tất cả sinh viên trong phòng
        html: `
            <h3>Hóa đơn tiền điện</h3>
            <table border="1" cellpadding="10" cellspacing="0">
                <thead>
                    <tr>
                        <th>Tòa</th>
                        <th>Phòng</th>
                        <th>Số điện đầu</th>
                        <th>Số điện cuối</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                        <th>Hạn đóng</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${department.name}</td>
                        <td>${room.name}</td>
                        <td>${bill.sodiendau}</td>
                        <td>${bill.sodiencuoi}</td>
                        <td>${bill.dongia} đ</td>
                        <td>${bill.thanhtien} đ</td>
                        <td>Trước ${formatDate(bill.handong)}</td>
                    </tr>
                </tbody>
            </table>
        `,
    };
    await transporter.sendMail(mailOptions);
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

    const totalDepartment = await DepartmentModel.countDocuments(filter);

    const totalPages = Math.ceil(totalDepartment / limitInt);

    const departments = await DepartmentModel.find(filter)
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
    const reports = await ReportModel.find(filter)
        .populate({
            path: 'room', // Nối thông tin phòng
            populate: {
                path: 'department', // Nối thông tin department trong room
                model: 'Departments' // Đảm bảo đúng model cho department
            }
        })
        .sort({ ngaygui: sortOrder }) // Sắp xếp theo handong theo thứ tự người dùng chọn
        .skip((pageInt - 1) * limitInt)
        .limit(limitInt);

    return {
        total: totalReports,
        totalPages,
        page: pageInt,
        pageSize: limitInt,
        listReport: reports
    };
}
exports.handleReport = async (id, action, data) => {
    const { ghichu } = data;
    return await ReportModel.findByIdAndUpdate(id, { trangthai: action, ghichu: ghichu }, { new: true });
}
exports.handleRequest = async (id, action) => {
    const request = await RequestModel.findById(id).populate('user')
        .populate({
            path: 'room',
            populate: {
                path: 'department', // Nối với department
                model: 'Departments'
            }
        });
    request.trangthai = action;
    await request.save();

    if (action === "approved") {
        let student = await StudentModel.findOne({ user: request.user });
        if (!student) {
            // Create new student if not exists
            student = new StudentModel({
                user: request.user._id,
                email: request.user.email,
                name: request.name,
                ngaysinh: request.ngaysinh,
                gender: request.gender,
                sid: request.sid,
                cccd: request.cccd,
                priority: request.priority,
                phone: request.phone,
                address: request.address,
                room: request.room._id,
                khoa: request.khoa,
                school: request.school,
                lop: request.lop,
                // kyhoc: [{
                //     ky: '20241',
                //     phong: request.room.name,
                //     thoigianbatdau: new Date(),
                //     trangthai: 'Đang ở',
                // }],
                trangthai: 'Đang ở',
            });
            await student.save();
        } else {
            // Add room to kyhoc (room history)
            // student.kyhoc.push({
            //     ky: 'Current',
            //     phong: request.room.name,
            //     thoigianbatdau: new Date(),
            //     trangthai: 'Đang ở',
            // });
            student.room = request.room._id; // Update current room
            student.trangthai = 'Đang ở';
            await student.save();
        }
        // const newPassword = crypto.randomBytes(16).toString('hex');
        const newPassword = '1234';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await UserModel.findOneAndUpdate({ _id: student.user }, { role: "Sinh viên", password: hashedPassword });
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.mailUser,
                pass: process.env.mailPass
            }
        });
        let mailOptions = {
            from: `BQL KTX ĐHBKHN <${process.env.mailUser}>`,
            subject: `Xác nhận đăng ký phòng ở ký túc xá`,
            to: request.user.email,
            html: `
                <h1>Đăng ký thành công</h1>
                <p><strong>Xin chào ${request.name}!</strong></p>
                <p>Cảm ơn bạn đã lựa chọn ký túc xá làm nơi lưu trú. Nhóm 1 môn Công nghệ Web xin xác nhận nội dung đăng ký phòng thành công của bạn.</p>
                <p><strong>Thông tin về phòng ở bao gồm:</strong></p>
                <ul>
                    <li><strong>Tòa nhà đăng ký: </strong>${request.room.department.name}</li>
                    <li><strong>Phòng đăng ký: </strong>${request.room.name}</li>
                    <li><strong>Mức thu xác nhận đã đóng: </strong>${request.sotienphaitra} VNĐ</li>
                    <li><strong>Thời gian sử dụng:</strong> Kỳ 2024.1 - ${formatDate(Date.now())} - 31/1/2025</li>
                    <li><strong>Địa điểm nhận phòng:</strong> D3-5 - 201, Đại học Bách khoa Hà Nội.</li>
                </ul>

                <p>Sinh viên không cần mang theo giấy tờ gì khi đến nhận phòng.</p>
                <p>Tài khoản bạn sử dụng để đăng ký đã được đặt lại mật khẩu. Mật khẩu mới là: <strong>${newPassword}</strong>. Từ bây giờ, bạn sẽ đăng nhập hệ thống với vai trò là: <strong>Khách</strong></p>
                <p>Mọi thắc mắc vui lòng liên hệ đến số: +84 394 305 264 (giờ hành chính).</p>
                <p>Trân trọng,</p>
                <p><strong>Nhóm 1, học phần Công nghệ Web, học kỳ 2024.1</strong></p>
            `,
        };
        await transporter.sendMail(mailOptions);
    } else if (action === "declined") {
        const ROOM = RoomModel.findById(request.room);
        ROOM.occupiedSlots--;
        ROOM.save();
        request.trangthai = "declined";
    }

    await request.save();
}
// sửa 15/11
exports.createDepartment = async (data) => {
    const { name, room_count, broken_room } = data;
    const existingDepartment = await DepartmentModel.findOne({ name: name });
    if (existingDepartment) {
        // Nếu phòng đã tồn tại, ném ngoại lệ
        throw new Error('Department with this name already exists');
    }
    const newDepartment = new DepartmentModel({
        name,
        room_count,
        broken_room
    });
    return await newDepartment.save();
}
// sửa 15/11
exports.detailStudent = async (id) => {
    const student = await StudentModel.findById(id).populate('user')
        .populate({
            path: 'room', // Nối thông tin phòng
            populate: {
                path: 'department', // Nối thông tin department trong room
                model: 'Departments' // Đảm bảo đúng model cho department
            }
        });
    if (student) return student;
}
exports.detailRoom = async (id) => {
    const room = await RoomModel.findById(id).populate('department');
    if (room) return room;
}
exports.detailBill = async (id) => {
    const bill = await BillModel.findById(id)
        .populate({
            path: 'room', // Nối thông tin phòng
            populate: {
                path: 'department', // Nối thông tin department trong room
                model: 'Departments' // Đảm bảo đúng model cho department
            }
        });
    if (bill) return bill;
}
exports.detailDepartment = async (id) => {
    const department = await DepartmentModel.findById(id);
    if (department) return department;
}
exports.detailRequest = async (id) => {
    const request = await RequestModel.findById(id).populate('user')
        .populate({
            path: 'room', // Nối thông tin phòng
            populate: {
                path: 'department', // Nối thông tin department trong room
                model: 'Departments' // Đảm bảo đúng model cho department
            }
        });
    if (request) return request;
}
exports.detailReport = async (id) => {
    const report = await ReportModel.findById(id)
        .populate({
            path: 'room', // Nối thông tin phòng
            populate: {
                path: 'department', // Nối thông tin department trong room
                model: 'Departments' // Đảm bảo đúng model cho department
            }
        });
    if (report) return report;
}
// --------
exports.getStudentsOfOneRoom = async (id) => {
    const room = await RoomModel.findById(id);
    return await StudentModel.find(
        { room: room.name }
    )
}
// sửa 15/11
exports.getAllRequest = async (filters = {}, page = 1, limit = 10) => {
    // Convert page và limit thành số
    const pageNumber = parseInt(page, 10) || 1;
    const pageLimit = parseInt(limit, 10) || 10;

    // Tính toán các thông số phân trang
    const skip = (pageNumber - 1) * pageLimit;

    // Lọc theo các tham số filters
    const filterConditions = {};

    // Nếu có status, thêm vào điều kiện lọc
    if (filters.status) {
        filterConditions.trangthai = filters.status;
    }
    // Nếu có room, thêm vào điều kiện lọc
    if (filters.room) {
        filterConditions.room = filters.room;
    }
    // Nếu có tên, thêm vào điều kiện lọc
    if (filters.name) {
        filterConditions.name = { $regex: filters.name, $options: 'i' }; // Lọc tên không phân biệt hoa thường
    }
    // Nếu có cccd, thêm vào điều kiện lọc
    if (filters.cccd) {
        filterConditions.cccd = filters.cccd;
    }

    // Tìm các request với các điều kiện lọc và phân trang
    const requests = await RequestModel.find(filterConditions)
        .populate({
            path: 'room', // Nối thông tin phòng
            populate: {
                path: 'department', // Nối thông tin department trong room
                model: 'Departments' // Đảm bảo đúng model cho department
            }
        })
        .populate('user')
        .skip(skip)  // Bỏ qua các kết quả trước đó
        .limit(pageLimit)  // Giới hạn số kết quả trả về
        .sort({ createdAt: -1 });  // Sắp xếp theo thời gian tạo (mới nhất trước)

    // Lấy tổng số request để tính số trang
    const totalRequests = await RequestModel.countDocuments(filterConditions);

    // Tính toán tổng số trang
    const totalPages = Math.ceil(totalRequests / pageLimit);
    return {
        data: requests,
        totalRequests,
        totalPages,
        currentPage: pageNumber,
        pageLimit
    };
};
exports.statisticBills = async () => {
    const count_pending = await BillModel.countDocuments({ trangthai: 'Chờ xác nhận' });
    const count_paid = await BillModel.countDocuments({ trangthai: 'Đã đóng' });
    const count_notYetPaid = await BillModel.countDocuments({ trangthai: 'Chưa đóng' });
    const count_overdue = await BillModel.countDocuments({ trangthai: 'Quá hạn' });
    const total = await BillModel.countDocuments();
    return { count_pending, count_paid, count_notYetPaid, count_overdue, total }
}
exports.statisticReports = async () => {
    const count_pending = await ReportModel.countDocuments({ trangthai: 'Chưa xử lý' });
    const count_done = await ReportModel.countDocuments({ trangthai: 'Đã xử lý' });
    const total = await ReportModel.countDocuments();
    return { count_pending, count_done, total }
}
exports.statisticRequests = async () => {
    const count_pending = await RequestModel.countDocuments({ trangthai: 'pending' });
    const count_approved = await RequestModel.countDocuments({ trangthai: 'approved' });
    const count_declined = await RequestModel.countDocuments({ trangthai: 'declined' });
    const total = await RequestModel.countDocuments();
    return { count_pending, count_approved, count_declined, total }
}
exports.statisticRooms = async () => {
    const count_male_available = await RoomModel.countDocuments({ tinhtrang: 'Bình thường', gender: 'Nam' });
    const count_male_unavailable = await RoomModel.countDocuments({ tinhtrang: 'Bị hỏng', gender: 'Nam' });
    const count_female_available = await RoomModel.countDocuments({ tinhtrang: 'Bình thường', gender: 'Nữ' });
    const count_female_unavailable = await RoomModel.countDocuments({ tinhtrang: 'Bị hỏng', gender: 'Nữ' });
    const total = await RoomModel.countDocuments();
    return { count_male_available, count_male_unavailable, count_female_available, count_female_unavailable, total }
}
exports.statisticStudents = async () => {
    const count_male_living = await StudentModel.countDocuments({ gender: 'Nam', trangthai: 'Đang ở' })
    const count_male_stop_living = await StudentModel.countDocuments({ gender: 'Nam', trangthai: 'Dừng trước hạn' })
    const count_female_living = await StudentModel.countDocuments({ gender: 'Nữ', trangthai: 'Đang ở' })
    const count_female_stop_living = await StudentModel.countDocuments({ gender: 'Nữ', trangthai: 'Dừng trước hạn' })
    const total = await StudentModel.countDocuments();
    return { count_male_living, count_male_stop_living, count_female_living, count_female_stop_living, total };
}
// Xuất hóa đơn cho từng phòng, danh sách excel
exports.exportAllStudents = async () => {
    let Students = [];
    const StudentData = await StudentModel.find().populate({
        path: 'room',
        populate: {
            path: 'department', // Nối với department
            model: 'Departments'
        }
    })
    StudentData.forEach((student) => {
        const { user, email, name, ngaysinh, gender, cccd, priority, phone, address, room, khoa, school, lop, trangthai, createdAt } = student;
        const stringAddress = `${address.xa}, ${address.thanh}, ${address.tinh}`;
        const stringRoom = `${room.department.name} - ${room.name}`;
        const stringNgaySinh = ngaysinh.toLocaleDateString('vi-VN');
        Students.push({
            UserID: user,
            Email: email,
            Name: name,
            DOB: stringNgaySinh,
            Gender: gender,
            IDCard: cccd,
            Priority: priority,
            Phone: phone,
            Address: stringAddress,
            Room: stringRoom,
            AcademicYear: khoa,
            School: school,
            Class: lop,
            Status: trangthai,
            CreatedAt: createdAt
        });
    });
    // not implemented 

    return csvData;
};
exports.exportAllStudentsByDepartment = async (departmentId) => {
    // departmentId = "6736a1cba7e99f28cae7bf8f";
    let Students = [];

    const StudentData = await StudentModel.find().populate({
        path: 'room',
        populate: {
            path: 'department', // Nối với department
            model: 'Departments'
        }
    })
    StudentData.forEach((student) => {
        const { user, email, name, ngaysinh, gender, cccd, priority, phone, address, room, khoa, school, lop, trangthai, createdAt } = student;
        const stringAddress = `xã: ${address.xa}, thành: ${address.thanh}, tỉnh: ${address.tinh}`;
        const stringRoom = `${room.department.name} - ${room.name}`;
        const stringNgaySinh = ngaysinh.toLocaleDateString('vi-VN');
        if (room.department._id !== departmentId) return;
        Students.push({
            UserID: user,
            Email: email,
            Name: name,
            DOB: stringNgaySinh,
            Gender: gender,
            IDCard: cccd,
            Priority: priority,
            Phone: phone,
            Address: stringAddress,
            Room: stringRoom,
            AcademicYear: khoa,
            School: school,
            Class: lop,
            Status: trangthai,
            CreatedAt: createdAt
        });
    });
    // not implemented 
    return csvData;
};
exports.exportAllStudentByRoom = async (roomId) => {
    let Students = [];

    const StudentData = await StudentModel.find({
        room: roomId
    }).populate({
        path: 'room',
        populate: {
            path: 'department', // Nối với department
            model: 'Departments'
        }
    })
    StudentData.forEach((student) => {
        const { user, email, name, ngaysinh, gender, cccd, priority, phone, address, room, khoa, school, lop, trangthai, createdAt } = student;
        const stringAddress = `${address.xa}, ${address.thanh}, ${address.tinh}`;
        const stringRoom = `${room.department.name} - ${room.name}`;
        const stringNgaySinh = ngaysinh.toLocaleDateString('vi-VN');
        Students.push({
            UserID: user,
            Email: email,
            Name: name,
            DOB: stringNgaySinh,
            Gender: gender,
            IDCard: cccd,
            Priority: priority,
            Phone: phone,
            Address: stringAddress,
            Room: stringRoom,
            AcademicYear: khoa,
            School: school,
            Class: lop,
            Status: trangthai,
            CreatedAt: createdAt
        });
    });
    // not implemented 
    return csvData;
};
