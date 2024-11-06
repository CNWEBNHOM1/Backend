const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: [true, "Please provide a name"],
    },
    department: {
        type: String,
    },
    capacity: {
        type: Number,
        // required: [true, "Please provide a size"],
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
    sodiencuoi: {
        type: Number,
    },
    dongiadien: {
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
    tinhtrang: {
        type: String,
        enum: ['Bình thường', 'Bị hỏng']
    }
})

module.exports = mongoose.models.Rooms || mongoose.model("Rooms", RoomSchema);