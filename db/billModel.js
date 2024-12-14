const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rooms',  // Liên kết với Room
        required: true,
    },
    sodiendau: {
        type: Number,
    },
    sodiencuoi: {
        type: Number,
    },
    dongia: {
        type: Number,
    },
    thanhtien: {
        type: Number,
    },
    handong: {
        type: Date,
    },
    trangthai: {
        type: String,
        enum: ["Chờ xác nhận", "Đã đóng", "Chưa đóng", "Quá hạn"],
    },
}, {timestamps: true});

module.exports = mongoose.models.Bills || mongoose.model("Bills", BillSchema);
