const nodemailer = require('nodemailer');
const StudentModel = require("../db/studentModel");
const RoomModel = require("../db/roomModel");
const UserModel = require("../db/userModel");
const BillModel = require("../db/billModel");
const DepartmentModel = require('../db/departmentModel');
const ReportModel = require('../db/reportModel');
const RequestModel = require('../db/requestModel');

require('dotenv').config();

const moment = require('moment');

const formatDate = (date) => {
    return moment(date).format('HH:mm:ss DD/MM/YYYY');
};

// Guest Service 
exports.createRequest = async (data, file) => {
    data.minhchung = file ? file.filename : null;
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
    });
    console.log(newRequest);
    return await newRequest.save();
}
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
// exports.getAllWaitingStudents = async () => {
//     return await StudentModel.find(
//         {
//             trangthai: "pending"
//         }
//     )
// }
// sửa 15/11
exports.getAllUsers = async () => {
    return UserModel.find();
}
// sửa 15/11 
exports.createRoom = async (data) => {
    const { name, department, gender, capacity, giatrangbi, tieno, tiennuoc, sodiencuoi, dongiadien, sophongvs, binhnuocnong, dieuhoa } = data;

    // Kiểm tra xem department có tồn tại không
    const departmentExists = await DepartmentModel.findById(department);
    if (!departmentExists) {
        return res.status(404).json({ message: 'Department not found' });
    }

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
// sửa 15/11
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
exports.getAllRooms = async () => {
    return await RoomModel.find().sort({ department: 1 }).populate('department');
}
exports.getAllRoomsOfDepartment = async (data) => {
    const { page = 1, limit = 10, department } = data;

    // Tạo filter, nếu department có giá trị thì thêm điều kiện, nếu không thì lấy tất cả
    const filter = department ? { department: department } : {};

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
};
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
        return res.status(404).json({
            message: "Room not found"
        });
    }
    const dongia = foundRoom.dongiadien;
    // Tìm bill gần nhất để lấy số điện cuối làm số điện đầu
    const lastBill = await BillModel.findOne({ room }).sort({ createdAt: -1 });
    const sodiendau = lastBill ? lastBill.sodiencuoi : 0; // Nếu chưa có bill thì sodiendau = 0

    // Tính tổng tiền
    const thanhtien = (sodiencuoi - sodiendau) * dongiadien;
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
        trangthai: "Chờ xác nhận",
    });

    // Lưu vào database
    return await newBill.save();
}
exports.updateBill = async (id, action) => {
    BillModel.findByIdAndUpdate(id, )
    return await b.save();
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
exports.handleRequest = async (id, action) => {
    const request = await RequestModel.findById(id).populate('user').populate('room');
    request.trangthai = action;
    await request.save();

    if (action === "approved") {
        let student = await StudentModel.findOne({ user: request.user });
        if (!student) {
            // Create new student if not exists
            student = new StudentModel({
                user: request.user,
                email: request.email,
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
                lop: request.class,
                kyhoc: [{
                    ky: '20241',
                    phong: request.room.name,
                    thoigianbatdau: new Date(),
                    trangthai: 'Đang ở',
                }],
                trangthai: 'Đang ở',
            });

            await student.save();
        } else {
            // Add room to kyhoc (room history)
            student.kyhoc.push({
                ky: 'Current',
                phong: request.room.name,
                thoigianbatdau: new Date(),
                trangthai: 'Đang ở',
            });
            student.room = request.room._id; // Update current room
            await student.save();
        }
    } else if (action === "declined") {
        const ROOM = RoomModel.findById(request.room);
        ROOM.occupiedSlots--;
        request.trangthai = "Declined";
    }
    await request.save();
}
// sửa 15/11
exports.createDepartment = async (data) => {
    const { name, room_count, broken_room } = data;
    const newDepartment = new DepartmentModel({
        name,
        room_count,
        broken_room
    });
    return await newDepartment.save();
}
// sửa 15/11
exports.detailStudent = async (id) => {
    const student = await StudentModel.findById(id).populate.apply('user')
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
// Xuất hóa đơn cho từng phòng, danh sách excel