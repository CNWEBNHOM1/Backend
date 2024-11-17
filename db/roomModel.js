const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Departments',  // Liên kết với Department
        required: true,
    },
    gender: {
        type: String,
        enum: ["Nam", "Nữ"],
    },
    capacity: {
        type: Number,
    },
    occupiedSlots: {
        type: Number,
        required: true,
        default: 0,
    },
    giatrangbi: {
        type: Number,
    },
    tieno: {
        type: Number,
    },
    tiennuoc: {
        type: Number,
    },
    dongiadien: {
        type: Number,
    },
    sophongvs: {
        type: Number,
    },
    binhnuocnong: {
        type: Number,
    },
    dieuhoa: {
        type: Number,
    },
    tinhtrang: {
        type: String,
        enum: ['Bình thường', 'Bị hỏng'],
        default: "Bình thường",
    },
}, {timestamps: true});

module.exports = mongoose.models.Rooms || mongoose.model("Rooms", RoomSchema);
