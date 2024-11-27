const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',  // Liên kết với user
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rooms',  // Liên kết với phòng
        required: true,
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
    khoa: {
        type: Number,
    },
    school: {
        type: String,
    },
    lop: {
        type: String
    },
    sotienphaitra: {
        type: Number,
    },
    minhchung: {
        type: String,
    },
    trangthai: {
        type: String,
        enum: ["pending", "approved", "declined"],
        default: "none",
    },
    noidung: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.models.Requests || mongoose.model("Requests", RequestSchema);
