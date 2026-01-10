const { registerUser, loginUser } = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);
    //remove password from response
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    if (error.message === 'User already exists with this email') {
      return res.status(400).json({ message: error.message });
    }

    next(error); // Pass other errors to the error handling middleware
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
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }
    next(error); // Pass other errors to the error handling middleware
  }
};

module.exports = {
  register,
  login,
};
