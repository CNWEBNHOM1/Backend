const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    name: {
        type: Number,
        required: [true, "Please provide a name"],
        unique: [true, "Name Exist"],
    },
    department: {
        type: String,
    },
    capacity: {
        type: Number,
        required: [true, "Please provide a size"],
    },
    occupiedSlots: {
        type: Number,
        required: [true],
        default: 0,
    },
    giatrangbi: {
        type: Number
    },
    tieno: {
        type: Number,
    },
    tiennuoc: {
        type: Number,
    },
    tongthu: {
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
})

module.exports = mongoose.models.Rooms || mongoose.model("Rooms", RoomSchema);