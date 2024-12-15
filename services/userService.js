const nodemailer = require('nodemailer');
const crypto = require('crypto'); // sửa lại khi hoàn thiện prj
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

// ---- Thanh toán VNPAY ----
const { VNPay, ignoreLogger, VnpLocale, verifyReturnUrl } = require('vnpay');

const vnpay = new VNPay({
    tmnCode: process.env.vnpay_tmnCode,
    secureSecret: process.env.vnpay_secureSecret,
    vnpayHost: process.env.vnpay_vnpayHost,
    testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
    hashAlgorithm: 'SHA512', // tùy chọn

    /**
     * Sử dụng enableLog để bật/tắt logger
     * Nếu enableLog là false, loggerFn sẽ không được sử dụng trong bất kỳ phương thức nào
     */
    enableLog: true, // optional

    /**
     * Hàm `loggerFn` sẽ được gọi để ghi log
     * Mặc định, loggerFn sẽ ghi log ra console
     * Bạn có thể ghi đè loggerFn để ghi log ra nơi khác
     *
     * `ignoreLogger` là một hàm không làm gì cả
     */
    loggerFn: ignoreLogger, // optional
})
exports.getRoomPaymentUrl = async (ip, data) => {
    const { returnUrl, requestId } = data;
    const request = await RequestModel.findById(requestId)
        .populate({
            path: 'room',
            populate: {
                path: 'department'
            }
        });
    const sotienphaitra = request.room.giatrangbi + request.room.tieno + request.room.tiennuoc;
    const date = new Date();
    const roomPaymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: sotienphaitra,
        vnp_IpAddr: ip,
        vnp_TxnRef: requestId + moment(date).format('YYYYMMDDHHmmss'),
        vnp_OrderInfo: `Thanh toan tien phong ${request.room.department.name}-${request.room.name}`,
        vnp_OrderType: '170003',
        vnp_ReturnUrl: returnUrl,
        vnp_Locale: VnpLocale.VN,
    });
    return roomPaymentUrl;
}
exports.getRoomPaymentReturn = async (queries) => {
    const { vnp_TxnRef, vnp_Amount, vnp_ResponseCode, vnp_OrderInfo, vnp_TransactionDate } = queries;
    const requestId = vnp_TxnRef.slice(0, -14);
    const request = await RequestModel.findById(requestId);
    if (vnp_ResponseCode === '00') {
        request.trangthai = 'pending';
        await RoomModel.findByIdAndUpdate(request.room, { $inc: { occupiedSlots: 1 } });
    } else {
        request.trangthai = 'declined';
    }
    await request.save();
    return {
        magiaodich: requestId,
        sotien: vnp_Amount,
        thongtingiaodich: vnp_OrderInfo,
        ngaygiaodich: vnp_TransactionDate,
        trangthai: vnp_ResponseCode === '00' ? 'Thành công' : 'Không thành công',
    }
}
exports.getBillPaymentUrl = async (ip, data) => {
    const { returnUrl, billId } = data;
    const date = new Date();
    const bill = await BillModel.findById(billId);
    const billPaymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: bill.thanhtien,
        vnp_IpAddr: ip,
        vnp_TxnRef: billId + moment(date).format('YYYYMMDDHHmmss'),
        vnp_OrderInfo: "Thanh toan tien dien",
        vnp_OrderType: '170003',
        vnp_ReturnUrl: returnUrl,
        vnp_Locale: VnpLocale.VN,
    });
    return billPaymentUrl;
}
exports.getBillPaymentReturn = async (queries) => {
    const { vnp_TxnRef, vnp_Amount, vnp_ResponseCode, vnp_OrderInfo, vnp_TransactionDate } = queries;
    const billId = vnp_TxnRef.slice(0, -14);
    if (vnp_ResponseCode === '00') {
        const bill = await BillModel.findById(billId);
        bill.trangthai = 'Đã đóng';
        await bill.save();
    }
    return {
        magiaodich: billId,
        sotien: vnp_Amount,
        thongtingiaodich: vnp_OrderInfo,
        ngaygiaodich: vnp_TransactionDate,
        trangthai: vnp_ResponseCode === '00' ? 'Thành công' : 'Không thành công',
    }
}
// #### Thanh toán VNPAY ####
// Guest Service 
exports.createRequest = async (uid, data) => {
    data.userId = uid;
    const { userId, roomId, name, ngaysinh, gender, sid, cccd, priority, phone, address, khoa, school, lop } = data;
    const request_by_userId = await RequestModel.findOne({ user: userId, trangthai: "pending" });
    if (request_by_userId)
        throw new Error("Bạn đang có 1 yêu cầu chờ phê duyệt, không thể tạo thêm yêu cầu mới!");
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
exports.getOwnRequest = async (userId) => {
    return await RequestModel.find({
        user: userId,
    })
        .populate('user')
        .populate({
            path: 'room',
            populate: {
                path: 'department',
            },
        });
}
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

    const student = await StudentModel.findOne({ user: user._id }).populate('user')
        .populate({
            path: 'room',
            populate: {
                path: 'department', // Nối với department
                model: 'Departments'
            }
        });
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
        .populate({
            path: 'room',
            populate: {
                path: 'department', // Nối với department
                model: 'Departments'
            }
        })
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
// sửa 07/12 - ANTU
exports.getAllUsers = async (page, limit, email) => {
    // Chuyển các tham số thành số nguyên
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Tính offset
    const skip = (pageNumber - 1) * limitNumber;

    // Sử dụng bộ lọc để tìm kiếm theo email
    const filter = email ? { email: { $regex: email, $options: 'i' } } : {};

    // Đếm tổng số user phù hợp với bộ lọc
    const totalUsers = await UserModel.countDocuments(filter);

    // Lấy dữ liệu user theo phân trang và bộ lọc
    const users = await UserModel.find(filter)
        .skip(skip)
        .limit(limitNumber);

    // Tính tổng số trang
    const totalPages = Math.ceil(totalUsers / limitNumber);

    return {
        users,
        totalUsers,
        totalPages
    };
};
exports.createRoom = async (data) => {
    const { name, department, gender, capacity, giatrangbi, tieno, tiennuoc, dongiadien, sophongvs, binhnuocnong, dieuhoa } = data;

    const roomExists = await RoomModel.findOne({ name: name, department: department });
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
    if (tinhtrang === 'Bị hỏng')
        await DepartmentModel.findByIdAndUpdate(
            department,
            { $inc: { broken_room: 1 } }
        )
    else if (tinhtrang === 'Bình thường')
        await DepartmentModel.findByIdAndUpdate(
            department,
            { $inc: { broken_room: -1 } }
        )
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
        roomName = null, // tên phòng
        departmentName = null, // department id
        trangthai = null,
        sortOrder = -1 // Mặc định là giảm dần nếu không có giá trị
    } = data;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    // Sử dụng facet để làm đếm và phân trang trong một truy vấn
    const bills = await BillModel.aggregate([
        {
            $lookup: {
                from: 'rooms',
                localField: 'room',
                foreignField: '_id',
                as: 'roomDetails'
            }
        },
        { $unwind: '$roomDetails' },
        {
            $lookup: {
                from: 'departments',
                localField: 'roomDetails.department',
                foreignField: '_id',
                as: 'departmentDetails'
            }
        },
        { $unwind: '$departmentDetails' },
        {
            $match: {
                ...(roomName && { "roomDetails.name": { $regex: roomName, $options: 'i' } }),  // Lọc theo tên phòng
                ...(departmentName && { "departmentDetails.name": departmentName }),  // Lọc theo departmentId
                ...(trangthai && { trangthai })  // Lọc theo trạng thái nếu có
            }
        },
        {
            $facet: {
                totalCount: [ // Facet cho đếm số bản ghi
                    {
                        $count: 'total'
                    }
                ],
                bills: [ // Facet cho phân trang và sắp xếp
                    {
                        $sort: {
                            handong: sortOrder // Sắp xếp theo `handong`
                        }
                    },
                    {
                        $skip: (pageInt - 1) * limitInt // Bỏ qua các bản ghi trước đó
                    },
                    {
                        $limit: limitInt // Giới hạn số lượng bản ghi trả về
                    },
                    {
                        $project: {
                            _id: 1,
                            sodiendau: 1,
                            sodiencuoi: 1,
                            thanhtien: 1,
                            handong: 1,
                            trangthai: 1,
                            anhminhchung: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            "roomDetails._id": 1,
                            "roomDetails.name": 1,  // Thông tin tên phòng
                            "roomDetails.department": 1,
                            "departmentDetails.name": 1,  // Tên phòng ban
                        }
                    }
                ]
            }
        },
        {
            $project: {
                totalCount: { $arrayElemAt: ["$totalCount.total", 0] }, // Lấy tổng số bản ghi từ facet
                bills: 1
            }
        }
    ]);

    const totalCount = bills.length > 0 ? bills[0].totalCount : 0;
    const resultBills = bills.length > 0 ? bills[0].bills : [];

    const totalPages = Math.ceil(totalCount / limitInt);
    return {
        total: totalCount,
        totalPages,
        page: pageInt,
        pageSize: limitInt,
        listBill: resultBills,
    };
};

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
    if (sodiencuoi <= sodiendau) {
        const error = new Error("Invalid sodiencuoi");
        error.sodiendau = sodiendau;
        throw error;
    }
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
            <div style="position: relative;">
                <!-- Thêm ảnh ở góc trên trái -->
                <img src="https://res.cloudinary.com/dovfk4xet/image/upload/v1733940012/logo-soict_xdgose.png" alt="Logo" style="position: absolute; top: 10px; left: 10px; width: 100px; height: auto;">
                
                <!-- Nội dung email -->
                <h3 style="text-align: center;">Hóa đơn tiền điện</h3>
                <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: center;">Tòa</th>
                            <th style="text-align: center;">Phòng</th>
                            <th style="text-align: center;">Số điện đầu</th>
                            <th style="text-align: center;">Số điện cuối</th>
                            <th style="text-align: center;">Đơn giá</th>
                            <th style="text-align: center;">Thành tiền</th>
                            <th style="text-align: center;">Hạn đóng</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align: center; vertical-align: middle;">${department.name}</td>
                            <td style="text-align: center; vertical-align: middle;">${room.name}</td>
                            <td style="text-align: center; vertical-align: middle;">${bill.sodiendau}</td>
                            <td style="text-align: center; vertical-align: middle;">${bill.sodiencuoi}</td>
                            <td style="text-align: center; vertical-align: middle;">${bill.dongia} đ</td>
                            <td style="text-align: center; vertical-align: middle;">${bill.thanhtien} đ</td>
                            <td style="text-align: center; vertical-align: middle;">Trước ${formatDate(bill.handong)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
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
        name = '',
        department
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
        roomName = null, // tên phòng
        departmentName = null, // department id
        trangthai = null,
        sortOrder = -1 // Mặc định là giảm dần nếu không có giá trị
    } = data;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    // Tạo đối tượng filter dựa vào department, room, trangthai, overdue, fromDate và toDate
    const reports = await ReportModel.aggregate([
        {
            $lookup: {
                from: 'rooms',
                localField: 'room',
                foreignField: '_id',
                as: 'roomDetails'
            }
        },
        { $unwind: '$roomDetails' },
        {
            $lookup: {
                from: 'departments',
                localField: 'roomDetails.department',
                foreignField: '_id',
                as: 'departmentDetails'
            }
        },
        { $unwind: '$departmentDetails' },
        {
            $match: {
                ...(roomName && { "roomDetails.name": { $regex: roomName, $options: 'i' } }),  // Lọc theo tên phòng
                ...(departmentName && { "departmentDetails.name": departmentName }),  // Lọc theo departmentId
                ...(trangthai && { trangthai })  // Lọc theo trạng thái nếu có
            }
        },
        {
            $facet: {
                totalCount: [ // Facet cho đếm số bản ghi
                    {
                        $count: 'total'
                    }
                ],
                reports: [ // Facet cho phân trang và sắp xếp
                    {
                        $sort: {
                            createAt: sortOrder // Sắp xếp theo `handong`
                        }
                    },
                    {
                        $skip: (pageInt - 1) * limitInt // Bỏ qua các bản ghi trước đó
                    },
                    {
                        $limit: limitInt // Giới hạn số lượng bản ghi trả về
                    },
                    {
                        $project: {
                            _id: 1,
                            noidung: 1,
                            minhchung: 1,
                            trangthai: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            ghichu: 1,
                            "roomDetails._id": 1,
                            "roomDetails.name": 1,  // Thông tin tên phòng
                            "roomDetails.department": 1,
                            "departmentDetails.name": 1,  // Tên phòng ban
                        }
                    }
                ]
            }
        },
        {
            $project: {
                totalCount: { $arrayElemAt: ["$totalCount.total", 0] }, // Lấy tổng số bản ghi từ facet
                reports: 1
            }
        }
    ]);
    // Tính tổng số trang
    const totalCount = reports.length > 0 ? reports[0].totalCount : 0;
    const resultReports = reports.length > 0 ? reports[0].reports : [];

    const totalPages = Math.ceil(totalCount / limitInt);
    return {
        total: totalCount,
        totalPages,
        page: pageInt,
        pageSize: limitInt,
        listReport: resultReports,
    };
}
exports.handleReport = async (id, action, data) => {
    const { ghichu } = data;
    return await ReportModel.findByIdAndUpdate(id, { trangthai: action, ghichu: ghichu }, { new: true });
}
exports.handleRequest = async (id, action, data) => {
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
                <p>Tài khoản bạn sử dụng để đăng ký đã được đặt lại mật khẩu. Mật khẩu mới là: <strong>${newPassword}</strong>. Từ bây giờ, bạn sẽ đăng nhập hệ thống với vai trò là: <strong>Sinh viên</strong></p>
                <p>Mọi thắc mắc vui lòng liên hệ đến số: +84 394 305 264 (giờ hành chính).</p>
                <p>Trân trọng,</p>
                <p><strong>Nhóm 1, học phần Công nghệ Web, học kỳ 2024.1</strong></p>
            `,
        };
        await transporter.sendMail(mailOptions);
    } else if (action === "declined") {
        const ROOM = await RoomModel.findById(request.room);
        ROOM.occupiedSlots--;
        // console.log(ROOM);
        await ROOM.save();
        request.trangthai = "declined";
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.mailUser,
                pass: process.env.mailPass
            }
        });
        let mailOptions = {
            from: `BQL KTX ĐHBKHN <${process.env.mailUser}>`,
            subject: `Từ chối đăng ký phòng ở ký túc xá`,
            to: request.user.email,
            html: `
                <h1>Đăng ký không thành công</h1>
                <p><strong>Xin chào ${request.name}!</strong></p>
                <p>Cảm ơn bạn đã quan tâm đến dịch vụ lưu trú tại ký túc xá. Tuy nhiên, Nhóm 1 môn Công nghệ Web rất tiếc phải thông báo rằng đăng ký phòng ở của bạn đã bị từ chối.</p>
                <p><strong>Thông tin phòng bạn đã đăng ký:</strong></p>
                <ul>
                    <li><strong>Tòa nhà đăng ký:</strong> ${request.room.department.name}.</li>
                    <li><strong>Phòng đăng ký:</strong> ${request.room.name}.</li>
                </ul>
                <p><strong>Lý do từ chối:</strong> ${data.reason}.</p>
                <br>
                <p>Bạn vui lòng liên hệ đến số: +84 394 305 264 hoặc đến phòng D3-5 - 201 vào giờ hành chính để được hoàn tiền.</p>
                <br>
                <p>Trân trọng,</p>
                <p><strong>Nhóm 1, học phần Công nghệ Web, học kỳ 2024.1.</strong></p>
            `,
        };
        await transporter.sendMail(mailOptions);
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
exports.getStudentsOfOneRoom = async (id, query) => {
    const { name, page = 1, limit = 10 } = query;

    // Tìm phòng
    const room = await RoomModel.findById(id);
    if (!room) {
        throw new Error('Room not found');
    }

    // Tạo bộ lọc
    const filter = {
        room: room._id,
        trangthai: 'Đang ở',
    };

    // Nếu có tên, thêm điều kiện tìm kiếm tên (không phân biệt hoa thường)
    if (name) {
        filter.name = { $regex: name, $options: 'i' };
    }

    // Thực hiện truy vấn với phân trang
    const students = await StudentModel.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit));

    // Đếm tổng số kết quả để trả về
    const total = await StudentModel.countDocuments(filter);

    return { students, total, page: Number(page), limit: Number(limit) };
};

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
                model: 'Departments', // Đảm bảo đúng model cho department
                match: filters.department ? { _id: filters.department } : {},
            }
        })
        .populate('user')
        .sort({ prioriry: -1, updatedAt: 1 })  // Sắp xếp theo thời gian tạo (mới nhất trước)
        .skip(skip)  // Bỏ qua các kết quả trước đó
        .limit(pageLimit);  // Giới hạn số kết quả trả về

    const filteredRequests = requests.filter((request) => request.room && request.room.department);
    // Lấy tổng số request để tính số trang
    const totalRequests = await RequestModel.countDocuments(filterConditions);

    // Tính toán tổng số trang
    const totalPages = Math.ceil(totalRequests / pageLimit);
    return {
        totalRequests,
        totalPages,
        currentPage: pageNumber,
        pageLimit,
        data: filteredRequests,
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
exports.exportAllStudent = async () => {
    let Students = [];
    const StudentData = await StudentModel.find().populate({
        path: 'room',
        populate: {
            path: 'department'
        }
    }).populate('user');
    // console.log(StudentData);
    StudentData.forEach((student) => {
        let { user, email, name, ngaysinh, gender, cccd, priority, phone, address, room, khoa, school, lop, trangthai, createdAt } = student;
        email = user.email;
        const stringAddress = `${address.xa},${address.thanh},${address.tinh}`;
        const stringRoom = `${room.department.name} - ${room.name}`;
        const stringNgaySinh = ngaysinh.toLocaleDateString('vi-VN');
        const UID = user._id;
        Students.push({
            UserID: UID,
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
    // console.log(Students)
    return Students;

    // const csvFields = ['UserID', 'Email', 'Name', 'DOB', 'Gender', 'IDCard', 'Priority', 'Phone', 'Address', 'Room', 'AcademicYear', 'School', 'Class', 'Status', 'CreatedAt'];
    // const csvParser = new CsvParser({ fields: csvFields, withBOM: true });
    // const csvData = csvParser.parse(Students);
    // // console.log(csvData);
    // return csvData;
};
exports.exportAllStudentByDepartment = async (departmentName) => {
    // const departmentId = "6736da2513a0a5ef1c7fcb15";
    let Students = [];
    // const department = await DepartmentModel.findOne({
    //     _id: departmentId
    // })
    // console.log(department);
    const department = await DepartmentModel.findOne({
        name: departmentName
    });
    // console.log(department);
    if (!department) throw new Error("Không có tòa này");

    const StudentData = await StudentModel.find().populate({
        path: 'room',

        populate: {
            path: 'department',
            // match: { _id: departmentId },
        }
    }).populate('user');
    // console.log(StudentData);
    StudentData.forEach((student) => {
        let { user, email, name, ngaysinh, gender, cccd, priority, phone, address, room, khoa, school, lop, trangthai, createdAt } = student;
        email = user.email;
        const stringAddress = `${address.xa}, ${address.thanh}, ${address.tinh}`;
        const stringRoom = `${room.department.name} - ${room.name}`;
        const stringNgaySinh = ngaysinh.toLocaleDateString('vi-VN');
        if (room.department.name != departmentName) return;
        Students.push({
            UserID: user._id,
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
    return Students;
    // console.log(Students);
    // if (!Students[0]) throw new Error("Tòa này không có ai");
    // const csvFields = ['UserID', 'Email', 'Name', 'DOB', 'Gender', 'IDCard', 'Priority', 'Phone', 'Address', 'Room', 'AcademicYear', 'School', 'Class', 'Status', 'CreatedAt'];
    // const csvParser = new CsvParser({ fields: csvFields, withBOM: true });
    // const csvData = csvParser.parse(Students);
    // // const departmentName = department.name;
    // return csvData;
};
exports.exportAllStudentByRoom = async (departmentName, roomName) => {

    let Students = [];
    const department = await DepartmentModel.findOne({
        name: departmentName
    });
    if (!department) throw new Error("Không có tòa này");
    const roomTmp = await RoomModel.findOne({
        name: roomName,
        department: department._id
    })
    if (!roomTmp) throw new Error(`Không có phòng này trong tòa ${departmentName}`);
    const StudentData = await StudentModel.find({
        room: roomTmp._id
    }).populate({
        path: 'room',

        populate: {
            path: 'department',
            // match: { _id: departmentId },
        }
    }).populate('user');
    // console.log(StudentData);
    StudentData.forEach((student) => {
        let { user, email, name, ngaysinh, gender, cccd, priority, phone, address, room, khoa, school, lop, trangthai, createdAt } = student;
        email = user.email;
        const stringAddress = `${address.xa}, ${address.thanh}, ${address.tinh}`;
        const stringRoom = `${room.department.name} - ${room.name}`;
        const stringNgaySinh = ngaysinh.toLocaleDateString('vi-VN');
        // if (room.department.name != departmentName) return;
        Students.push({
            UserID: user._id,
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
    // console.log(Students);
    if (!Students[0]) throw new Error("Phòng này không có ai");
    return Students;
    // const csvFields = ['UserID', 'Email', 'Name', 'DOB', 'Gender', 'IDCard', 'Priority', 'Phone', 'Address', 'Room', 'AcademicYear', 'School', 'Class', 'Status', 'CreatedAt'];
    // const csvParser = new CsvParser({ fields: csvFields, withBOM: true });
    // const csvData = csvParser.parse(Students);
    // // const departmentName = department.name;
    // return csvData;
};
exports.getBills = async (billId) => {
    // billId = "6736ae6da885f02a9bd15b38";
    const bill = await BillModel.findById(billId).populate('room');
    if (!bill) throw new Error("Hoá đơn không tồn tại");
    console.log(bill);
    const giatrangbi = bill.room.giatrangbi;
    const tieno = bill.room.tieno;
    const tiennuoc = bill.room.tiennuoc;
    // console.log(giatrangbi)
    const { room, sodiendau, sodiencuoi, dongia, thanhtien, handong, trangthai } = bill;

    const department = await DepartmentModel.findById(bill.room.department);
    const data = {
        department: department.name,
        room: room.name,
        sodiendau,
        sodiencuoi,
        dongia,
        thanhtien,
        handong,
        trangthai,
        giatrangbi,
        tieno,
        tiennuoc
    };
    // console.log(data);
    return data;
};