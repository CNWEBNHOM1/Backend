const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
    },
    name: {
        type: String,
        required: [true, "Please provide a name!"],
    },
    ngaysinh: {
        type: Date,
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
        require: [true, "Please provide a priority!"],
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
        default: 69,
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
    departmentselected: {
        type: String,
        default: "none",
    },
    roomselected: {
        type: String,
        default: "none",
    },
    minhchung: {
        type: Buffer,
        // required: [true, "Please provide a minhchung!"],
    },
    ngaydangky: {
        type: Date,
    },
    trangthai: {
        type: String,
        enum: ["pending", "approved", "kicked", "none"],
        default: "none",
    },
    holdExpiry: { 
        type: Date 
    }
})

module.exports = mongoose.models.Students || mongoose.model("Students", StudentSchema);