const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    value: {
        type: String,
    },
    time: { type: Date, default: Date.now, index: { expires: 30000 } },
})

module.exports = mongoose.models.Otps || mongoose.model("Otps", OtpSchema);
