const { registerUser, loginUser } = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);
    //remove password from response
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);
    //remove password from response
    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
