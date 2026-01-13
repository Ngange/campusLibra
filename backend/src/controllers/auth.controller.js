const {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
} = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { user, token, refreshToken } = await registerUser(req.body);
    //remove password from response
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).json({ user: userWithoutPassword, token, refreshToken });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token, refreshToken } = await loginUser(email, password);
    //remove password from response
    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.json({ user: userWithoutPassword, token, refreshToken });
  } catch (error) {
    next(error);
  }
};

const updateProfileHandler = async (req, res, next) => {
  try {
    const { user } = req;
    const result = await updateProfile(user.id, req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const changePasswordHandler = async (req, res, next) => {
  try {
    const { user } = req;
    const { currentPassword, newPassword } = req.body;
    const result = await changePassword(user.id, currentPassword, newPassword);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  updateProfileHandler,
  changePasswordHandler,
};
