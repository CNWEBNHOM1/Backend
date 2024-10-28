const User = require('../db/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+\d{6,}@sis\.hust\.edu\.vn$/;

exports.createUser = async (email, password, role) => {
    if (!emailRegex.test(email)) throw new Error('You must use HUST email');
    if (role === "Quản lý") {
        throw new Error('Cannot assigned as manager')
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
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
        { userId: user._id, userEmail: user.email },
        process.env.JWT_TOKEN,
        { expiresIn: '24h' }
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
