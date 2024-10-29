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
    size: {
        type: Number,
        required: [true, "Please provide a size"],
    },
    current: {
        type: Number,
        required: [true],
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