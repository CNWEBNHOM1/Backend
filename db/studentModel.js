const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
    },
    name: {
        type: String,
        required: [true, "Please provide a name!"],
    },
    sid: {
        type: String,
        // enum: ['student', 'manager', 'temp'], // Giới hạn giá trị cho trường "role"
        required: [true, "Please provide a student id!"],
        unique: [true, "Student ID Exist"],
    },
    cccd: {
        type: String,
        required: [true, "Please provide a identity number!"],
    },
    priority: {
        type: Boolean,
        require: true,
    },
    phone: {
        type: String,
        required: [true, "Please provide a phone number"],
    },
    address: {
        tinh: {
            type: String,
            required: [true, "Please provide an address"],
        },
        thanh: {
            type: String,
            required: [true, "Please provide an address"],
        },
        xa: {
            type: String,
            required: [true, "Please provide an address"],
        },
    },
    khoa: {
        type: Number,
    },
    truong_khoa_vien: {
        type: String,
    },
    nganh: {
        type: String,
    },
    ma_nganh: {
        type: String,
    },
    lop: {
        type: String,
    },
    family: {
        type: String,
        enum: ['Ông', 'Bà', 'Cha', 'Mẹ', 'Anh', 'Chị', 'Em'],
        required: [true, "Please provide a family member"],
    },
    familyphone: {
        type: String,
        required: [true, "Please provide a family member phone number"],
    },
    department: {
        type: String,
    },
    room: {
        type: Number,
    },
    minhchung: {
        type: Buffer,
        required: true,
    },
    trangthai: {
        type: String,
        enum: ["Chờ phê duyệt", "Đang ở"],
    }
})

module.exports = mongoose.models.Students || mongoose.model("Students", StudentSchema);