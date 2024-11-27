const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',  // Liên kết với user
        required: true,
    },
    email: {
        type: String,
    },
    name: {
        type: String,
    },
    ngaysinh: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ["Nam", "Nữ"],
    },
    sid: {
        type: String,
    },
    cccd: {
        type: String,
    },
    priority: {
        type: Boolean,
    },
    phone: {
        type: String,
    },
    address: {
        tinh: {
            type: String,
        },
        thanh: {
            type: String,
        },
        xa: {
            type: String,
        },
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rooms',  // Liên kết với phòng
        required: true,
    },
    khoa: {
        type: Number
    },
    school: {
        type: String
    },
    lop: {
        type: String
    },
    // history: [{
    //     semester: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Semesters',  // Liên kết với kỳ học
    //         required: true,
    //     },
    //     room: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Rooms',  // Liên kết với phòng
    //         required: true,
    //     }
    // }],
    trangthai: {
        type: String,
        enum: ["Đang ở", "Dừng trước hạn"],
        default: "Đang ở",
    },
}, { timestamps: true });

module.exports = mongoose.models.Students || mongoose.model("Students", StudentSchema);
