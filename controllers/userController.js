const userService = require('../services/userService');

exports.authEndpoint = async (req, res) => {
    res.json({ message: 'You are authorized to access me' });
};
