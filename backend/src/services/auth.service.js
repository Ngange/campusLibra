const User = require('../models/user.model');
const Role = require('../models/role.model');
const RefreshToken = require('../models/refreshToken.model');
const { generateToken, generateRefreshToken } = require('../utils/jwt.util');
const { emitNotification } = require('../utils/notification.util');
const bcrypt = require('bcryptjs');

// User registration service
const registerUser = async (userData) => {
  const { name, email, password, role = 'member' } = userData;

  // Validate password complexity (before hashing)
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
    throw new Error('Password must contain at least one letter and one number');
  }

  // 1. Validate role
  const roleDoc = await Role.findOne({ name: role });
  if (!roleDoc) throw new Error('Invalid role');

  // 2. CREATE USER (password will be hashed by pre-save hook)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // Idempotency: If user exists, return success (don't fail!)
    const token = generateToken({
      id: existingUser._id,
      role: existingUser.role.name,
    });

    // Generate refresh token
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshToken.create({
      token: refreshToken,
      userId: existingUser._id,
      expiresAt,
    });

    return { user: existingUser, token, refreshToken };
  }

  const user = await User.create({
    name,
    email,
    password, // Plain password - will be hashed by pre-save hook
    role: roleDoc._id,
  });

  // 3. NOW send notification (after user is safely created)
  try {
    await emitNotification(
      user._id,
      'Account Created',
      'Your account has been successfully created. You can now log in.',
      'registration'
    );
  } catch (err) {
    // 🤷‍♂️ Log error but don't fail registration
    console.error('Failed to send welcome notification:', err.message);
  }

  const token = generateToken({ id: user._id, role });

  // Generate refresh token
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    token: refreshToken,
    userId: user._id,
    expiresAt,
  });

  return { user, token, refreshToken };
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

  // Generate refresh token
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    token: refreshToken,
    userId: user._id,
    expiresAt,
  });

  return { user, token, refreshToken };
};

// Update profile (name, email)
const updateProfile = async (userId, updates) => {
  const user = await User.findById(userId).populate('role', 'name');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Enforce unique email if changed
  if (updates.email) {
    const emailInUse = await User.findOne({
      email: updates.email.toLowerCase(),
      _id: { $ne: userId },
    });
    if (emailInUse) {
      const error = new Error('Email is already in use');
      error.statusCode = 400;
      throw error;
    }
    user.email = updates.email.toLowerCase();
  }

  if (updates.name) {
    user.name = updates.name;
  }

  await user.save();
  await user.populate('role', 'name');

  const { password, ...userWithoutPassword } = user.toObject();
  return { user: userWithoutPassword };
};

// Change password with current password verification
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  // Enforce strong password similar to frontend validator
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumeric = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
    newPassword
  );
  const isLongEnough = newPassword.length >= 8;

  if (
    !hasUpperCase ||
    !hasLowerCase ||
    !hasNumeric ||
    !hasSpecialChar ||
    !isLongEnough
  ) {
    const error = new Error(
      'New password does not meet complexity requirements'
    );
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully' };
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
};
