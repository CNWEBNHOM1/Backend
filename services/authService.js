const User = require('../db/userModel');
const Otp = require('../db/otpModel');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+\d{6,}@sis\.hust\.edu\.vn$/;

exports.createUser = async (email, password) => {
    if (!emailRegex.test(email)) throw new Error('You must use HUST email');
    if (await User.findOne({ email: email }))
        throw new Error('Đã có tài khoản sử dụng email này!')
    const hashedPassword = await bcrypt.hash(password, 10);
    const verify_token = Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
    const OTP = new Otp({ email: email, password: hashedPassword, value: verify_token });
    await OTP.save();

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.mailUser,
            pass: process.env.mailPass
        }
    });
    const verificationLink = `https://backend-gjtr.onrender.com/auth/verify-email?token=${verify_token}`;
    let mailOptions = {
        from: `BQL KTX ĐHBKHN <${process.env.mailUser}>`,
        to: email,
        subject: 'Email Verification',
        text: `Bấm vào đường dẫn sau để xác minh tài khoản của bạn: ${verificationLink} Sau khi xác minh, bạn sẽ đăng nhập với vai trò là KHÁCH.`,
    };
    return await transporter.sendMail(mailOptions);
};

exports.loginUser = async (email, password, role) => {
    if (role !== 'Quản lý' && !emailRegex.test(email))
        throw new Error('You must use HUST email');
    const user = await User.findOne({ email, role });
    if (!user) throw new Error('Email or role is invalid');
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) throw new Error('Invalid password');
    if (user.status === 'blocked')
        throw new Error('This email has been blocked by admin');
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
exports.verifyEmail = async (token) => {
    const OTP = await Otp.findOne({ value: token });
    if (!OTP) {
        throw new Error('Invalid or expried OTP');
    }
    await User.create({ email: OTP.email, password: OTP.password });
}
