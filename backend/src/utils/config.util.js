const Setting = require('../models/setting.model');

// Simple in-memory cache for settings
let settingsCache = new Map();

const getSetting = async (key) => {
  // Return from cache if available
  if (settingsCache.has(key)) {
    return settingsCache.get(key);
  }

  // Fetch from DB
  const setting = await Setting.findOne({ key });
  if (!setting) {
    throw new Error(`Setting '${key}' not found in database`);
  }

  // Cache and return
  settingsCache.set(key, setting.value);
  return setting.value;
};

// Clear cache if admin updates settings via UI
const clearSettingsCache = () => {
  settingsCache.clear();
};

module.exports = { getSetting, clearSettingsCache };
