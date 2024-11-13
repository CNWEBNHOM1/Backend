const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: [true, "Please provide a name"],
        // unique: [true, "Name Exist"],
    },
    room_count: {
        type: Number,
        // required: [true, "Please provide a number of room"],
    },
    broken_room: {
        type: Number,
        // required: [true, "Please provide a number of broken room!"],
    },
    ngaycapnhat: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.models.Departments || mongoose.model("Departments", DepartmentSchema);