const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rooms',  // Liên kết với Room
        required: true,
    },
    noidung: {
        type: String,
    },
    minhchung: {
        type: String,
    },
    trangthai: {
        type: String,
        enum: ["Chưa xử lý", "Đã xử lý"],
    },
    ghichu: {
        type: String,
    },
}, {timestamps: true});

module.exports = mongoose.models.Reports || mongoose.model("Reports", ReportSchema);
