const userService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const user = await userService.createUser(req.body.email, req.body.password);
    res.status(201).json({ message: 'User Created Successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

exports.login = async (req, res) => {
  try {
    const { user, token } = await userService.loginUser(req.body.email, req.body.password);
    res.status(200).json({ message: 'Login Successful', user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
