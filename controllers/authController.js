const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const user = await authService.createUser(req.body.email, req.body.password, req.body.role);
    res.status(201).json({ message: 'User Created Successfully', email: user.email, role: user.role, id: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { user, token } = await authService.loginUser(req.body.email, req.body.password, req.body.role);
    const userData = { id: user._id, email : user.email, role: user.role};
    res.status(200).json({ message: 'Login Successful', userData, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    await authService.changePasswordUser(req.body.email, req.body.oldPass, req.body.newPass);
    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}