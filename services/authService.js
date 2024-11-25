const User = require('../db/userModel');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+\d{6,}@sis\.hust\.edu\.vn$/;

exports.createUser = async (email, password) => {
    if (!emailRegex.test(email)) throw new Error('You must use HUST email');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    user.role = 'Khách';
    return await user.save();
};

exports.loginUser = async (email, password, role) => {
    if (role !== 'Quản lý' && !emailRegex.test(email))
        throw new Error('You must use HUST email');

    const user = await User.findOne({ email, role });
    if (!user) throw new Error('Email or role is invalid');
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) throw new Error('Invalid password');

    const token = jwt.sign(
        { userId: user._id, userEmail: user.email, role: user.role },
        process.env.JWT_TOKEN,
        { expiresIn: '7d' }
    );
    return { user, token };
};

exports.changePasswordUser = async (email, oldPass, newPass) => {
    const user = await User.findOne({ email });
    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
        throw new Error('Current password is incorrect');
    }
    if (newPass === oldPass)
        throw new Error('Password must be different');

    const hashedNewPass = await bcrypt.hash(newPass, 10);
    user.password = hashedNewPass;
    return await user.save();
}
exports.resetPasswordMail = async (email) => {
    const usr = await User.findOne({ email: email });
    if (!usr) {
        return res.status(404).json({ message: "Email not found" });
    }
    const newPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    usr.password = hashedPassword;
    await usr.save();

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.mailUser,
            pass: process.env.mailPass
        }
    });

    let mailOptions = {
        from: `BQL KTX ĐHBKHN <${process.env.mailUser}>`,
        to: email,
        subject: 'Reset password',
        html: `Your password is reset! It is <b>${newPassword}</b> now.`
    };
    // console.log(mailOptions);
    // console.log(transporter.auth.user);
    return transporter.sendMail(mailOptions);
}
