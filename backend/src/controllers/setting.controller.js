const Setting = require('../models/setting.model');
const { clearSettingsCache } = require('../utils/config.util');

// Get all settings
const getAllSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find().select('key value description');
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// Update a setting by key
const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

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

    // Clear cache so services use new value
    clearSettingsCache();

    res.json({ success: true, setting });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSettings, updateSetting };
