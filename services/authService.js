// services/userService.js
const User = require('../db/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createUser = async (email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    return await user.save();
};

exports.loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Email not found');

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) throw new Error('Invalid password');

    const token = jwt.sign(
        { userId: user._id, userEmail: user.email },
        process.env.JWT_TOKEN,
        { expiresIn: '24h' }
    );
    return { user, token };
};

