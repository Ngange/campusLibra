const User = require('../models/user.model');
const Role = require('../models/role.model');
const { generateToken } = require('../utils/jwt.util');
const bcrypt = require('bcryptjs');

// User registration service
const registerUser = async (userData) => {
  const { name, email, password, role = 'member' } = userData; //default role is 'member'

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Find role by name
  const roleDoc = await Role.findOne({ name: role });
  if (!roleDoc) {
    throw new Error(`Role '${role}' does not exist`);
  }

  // create new user (password will be hashed in pre-save hook)
  const user = new User({
    name,
    email,
    password,
    role: roleDoc._id,
  });

  // Generate JWT token
  const token = generateToken({
    id: user._id,
    role: role,
  });

  await user.save(); // Save user to the database

  return { user, token };
};

// User login service
const loginUser = async (email, password) => {
  const user = await User.findOne({ email })
    .populate('role', 'name') // get role name
    .select('+password'); // Include password field for verification

  if (!user || !user.role) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken({
    id: user._id,
    role: user.role.name,
  });

  return { user, token };
};

module.exports = {
  registerUser,
  loginUser,
};
