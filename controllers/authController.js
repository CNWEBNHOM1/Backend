const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const user = await authService.createUser(req.body.email, req.body.password);
    res.status(201).json({ message: 'User Created Successfully. Check your mail to active', email: user.email, role: user.role, id: user._id });
  } catch (error) {
    if (error.message === 'Email exist')
      res.status(444).json({ message: error.message });
    else if (error.message === 'You must use HUST email')
      res.status(443).json({ message: error.message });
    else
      res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { user, token } = await authService.loginUser(req.body.email, req.body.password, req.body.role);
    const userData = { id: user._id, email: user.email, role: user.role };
    res.status(200).json({ message: 'Login Successful', userData, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    await authService.changePasswordUser(req.user.userEmail, req.body.oldPass, req.body.newPass);
    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
exports.sendMailToResetPassword = async (req, res) => {
  try {
    await authService.resetPasswordMail(req.body.email);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
}
exports.verifyEmail = async (req, res) => {
  try {
    await authService.verifyEmail(req.query.token);
    res.redirect('https://frontend-68nc.onrender.com/login');
  } catch (err) {
    if (err.message === 'Invalid or expried OTP')
      res.status(404).json({ error: err.message });
    else res.status(500).json({ error: "Failed to verify" });
  }
}