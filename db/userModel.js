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
    },
    role: {
        type: String,
        enum: ['Khách', 'Sinh viên', 'Quản lý'], // Giới hạn giá trị cho trường "role"
        required: [true, "Please provide a role!"],
    }
    ,
    status: {
        type: String,
        enum: ["available", "blocked"],
        default: "available"
    }
}, {timestamps: true})

module.exports = mongoose.models.Users || mongoose.model("Users", UserSchema);
