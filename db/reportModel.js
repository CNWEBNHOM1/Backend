const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
    department: {
        type: String,
        required: [true, "Department name"],
    },
    room: {
        type: Number,
        required: [true, "Room number"],
    },
    ngaygui: {
        type: Date,
    },
    noidung: {
        type: String,
    },
    trangthai: {
        type: String,
        enum: ["Chưa xử lý", "Đã xử lý"],
    },
    ghichu: {
        type: String,
    }
})

module.exports = mongoose.models.Reports || mongoose.model("Reports", ReportSchema);