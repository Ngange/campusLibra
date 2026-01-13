const Setting = require('../models/setting.model');
const { clearSettingsCache } = require('../utils/config.util');
const { logSettingAuditEvent } = require('../utils/audit.util');

// Get all settings
const getAllSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find().select('key value description');
    // Return array directly for frontend compatibility
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// Update a setting by key
const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    // Get the existing setting to capture old value
    const existingSetting = await Setting.findOne({ key });
    const oldValue = existingSetting?.value;

    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { new: true, runValidators: true }
    );

    if (!setting) {
      return res
        .status(404)
        .json({ success: false, message: 'Setting not found' });
    }

    // Log the setting change to audit trail
    if (req.user?._id || req.user?.id) {
      await logSettingAuditEvent(
        key,
        oldValue,
        value,
        req.user._id || req.user.id
      );
    }

    // Clear cache so services use new value
    clearSettingsCache();

    res.json({ success: true, setting });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSettings, updateSetting };
