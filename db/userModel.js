const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    },
    role: {
        type: String,
        enum: ['student', 'manager', 'temp'], // Giới hạn giá trị cho trường "role"
        required: true,
    },
})

module.exports = mongoose.models.Users || mongoose.model("Users", UserSchema);
