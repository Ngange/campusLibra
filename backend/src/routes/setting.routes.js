const express = require('express');
const { authorizePermission } = require('../middlewares/permission.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  getAllSettings,
  updateSetting,
} = require('../controllers/setting.controller');

const router = express.Router();

// Protected routes for system management
router.use(authMiddleware);

router.get('/', authorizePermission('system_manage'), getAllSettings);

// Support both PUT and PATCH for updating settings
router.put('/:key', authorizePermission('system_manage'), updateSetting);
router.patch('/:key', authorizePermission('system_manage'), updateSetting);

module.exports = router;
