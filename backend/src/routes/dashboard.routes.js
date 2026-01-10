const express = require('express');
const {
  getBorrowsPerMonth,
  getOverdueStats,
  getFineSummary,
  getActiveUsers,
  getAuditTrail,
  getBookPopularity,
  getUserEngagement,
} = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

const router = express.Router();

// Only admin/librarian can access analytics
router.use(authMiddleware, authorizeRoles('admin', 'librarian'));

router.get('/borrows-per-month', getBorrowsPerMonth);
router.get('/overdue-stats', getOverdueStats);
router.get('/fine-summary', getFineSummary);
router.get('/active-users', getActiveUsers);
router.get('/audit-trail', getAuditTrail);
router.get('/book-popularity', getBookPopularity);
router.get('/user-engagement', getUserEngagement);

module.exports = router;
