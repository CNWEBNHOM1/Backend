const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
    department: {
        type: String,
        // required: [true, "Department name"],
    },
    room: {
        type: Number,
        // required: [true, "Room number"],
    },
    sodiendau: {
        type: Number,
        // required: [true, "Số điện đầu!"],
    },
    sodiencuoi: {
        type: Number,
        // required: [true, "Số điện cuối!"],
    },
    dongia: {
        type: Number,
        // required: [true, "Giá điện!"],
    },
    thanhtien: {
        type: Number,
    },
    handong: {
        type: Date,
        // require: [true, "Thiếu hạn đóng!"],
    },
    trangthai: {
        type: String,
        enum: ["Chờ xác nhận", "Đã đóng", "Chưa đóng", "Quá hạn"],
    },
    ngaydong: {
        type: Date,
    },
    anhminhchung: {
        type: Buffer,
    },
})

module.exports = mongoose.models.Bills || mongoose.model("Bills", BillSchema);