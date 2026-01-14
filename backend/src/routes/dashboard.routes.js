const express = require('express');
const {
  getAdminStats,
  getLibrarianStats,
  getMemberStats,
  getBookCirculation,
  getPendingReturns,
  getPendingPickups,
  getMyBorrows,
  getMyReservations,
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

// ============ DASHBOARD STATS & DATA (Protected) ============

// All dashboard endpoints require authentication
router.use(authMiddleware);

// Admin dashboard stats
router.get('/admin', authorizeRoles('admin'), getAdminStats);

// Librarian dashboard stats
router.get('/librarian', authorizeRoles('librarian'), getLibrarianStats);

// Member dashboard stats
router.get('/member', authorizeRoles('member'), getMemberStats);

// Book circulation data (admin only)
router.get('/book-circulation', authorizeRoles('admin'), getBookCirculation);

// Pending returns (librarian only)
router.get('/pending-returns', authorizeRoles('librarian'), getPendingReturns);

// Pending pickups (librarian only)
router.get('/pending-pickups', authorizeRoles('librarian'), getPendingPickups);

// My borrows (members only)
router.get('/my-borrows', authorizeRoles('member'), getMyBorrows);

// My reservations (members only)
router.get('/my-reservations', authorizeRoles('member'), getMyReservations);

// ============ LEGACY ANALYTICS ENDPOINTS (admin/librarian only) ============

// Only admin/librarian can access analytics
router.use(authorizeRoles('admin', 'librarian'));

router.get('/borrows-per-month', getBorrowsPerMonth);
router.get('/overdue-stats', getOverdueStats);
router.get('/fine-summary', getFineSummary);
router.get('/active-users', getActiveUsers);
router.get('/audit-trail', getAuditTrail);
router.get('/book-popularity', getBookPopularity);
router.get('/user-engagement', getUserEngagement);

module.exports = router;
