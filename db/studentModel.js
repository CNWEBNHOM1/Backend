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
    kyhoc: [{
        ky: {
            type: String,
            required: true,
        },
        phong: {
            type: String,
            required: true,
        },
        thoigianbatdau: {
            type: Date,
            required: true,
        },
        thoigianketthuc: {
            type: Date,
        },
        trangthai: {
            type: String,
            enum: ["Đang ở", "Dừng trước hạn", "Đã ở từ kỳ trước"],
            default: "Đang ở",
        },
    }],
    trangthai: {
        type: String,
        enum: ["Đang ở", "Dừng trước hạn", "Đã ở từ kỳ trước"],
        default: "Đang ở",
    },
}, {timestamps: true});

module.exports = mongoose.models.Students || mongoose.model("students", StudentSchema);
