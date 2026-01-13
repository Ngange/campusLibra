const RefreshToken = require('../models/refreshToken.model');
const User = require('../models/user.model');
const {
  generateToken,
  generateRefreshToken,
  verifyToken,
} = require('../utils/jwt.util');

/**
 * Refresh access token using refresh token with rotation
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Find the refresh token in database
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Check if token is expired
    if (storedToken.isExpired) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired',
      });
    }

    // Check if token has been revoked
    if (storedToken.revokedAt) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked',
      });
    }

    // Get user details
    const user = await User.findById(storedToken.userId).populate(
      'role',
      'name'
    );

    if (!user) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new access token
    const newAccessToken = generateToken({
      id: user._id,
      role: user.role.name,
    });

    // Implement refresh token rotation: generate new refresh token
    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create new refresh token
    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id,
      expiresAt,
      createdByIp: req.ip,
    });

    // Revoke old refresh token
    storedToken.revokedAt = new Date();
    storedToken.revokedByIp = req.ip;
    storedToken.replacedByToken = newRefreshToken;
    await storedToken.save();

    res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke refresh token (logout)
 */
const revokeRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (storedToken && !storedToken.revokedAt) {
      storedToken.revokedAt = new Date();
      storedToken.revokedByIp = req.ip;
      await storedToken.save();
    }

    res.json({
      success: true,
      message: 'Refresh token revoked successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  refreshAccessToken,
  revokeRefreshToken,
};
