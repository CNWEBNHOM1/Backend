const mongoose = require("mongoose");

const SemesterSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rooms',  // Liên kết với Room
        required: true,
    },
    startTime: {
        type: String,
    },
    endTime: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Đang mở", "Kết thúc"],
    }
}, {timestamps: true});

module.exports = mongoose.models.Semesters || mongoose.model("Semesters", SemesterSchema);
