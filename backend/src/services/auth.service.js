const User = require('../models/user.model');
const Role = require('../models/role.model');
const { generateToken } = require('../utils/jwt.util');
const { emitNotification } = require('../utils/notification.util');
const bcrypt = require('bcryptjs');

// User registration service
const registerUser = async (userData) => {
  const { name, email, password, role = 'member' } = userData;

  // 1. Validate role
  const roleDoc = await Role.findOne({ name: role });
  if (!roleDoc) throw new Error('Invalid role');

  // 2. Hash password (no DB write yet)
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. PREPARE notification (but don't send yet)
  //    Actually, defer notification to AFTER success

  // 4. CREATE USER
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // Idempotency: If user exists, return success (don't fail!)
    const token = generateToken({
      id: existingUser._id,
      role: existingUser.role.name,
    });
    return { user: existingUser, token };
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: roleDoc._id,
  });

  // 5. NOW send notification (after user is safely created)
  try {
    await emitNotification(
      user._id,
      'Welcome!',
      'Your account has been created.',
      'registration'
    );
  } catch (err) {
    // 🤷‍♂️ Log error but don't fail registration
    console.error('Failed to send welcome notification:', err.message);
  }

  const token = generateToken({ id: user._id, role });
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
