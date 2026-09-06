const express = require('express');
const router = express.Router();
const { 
  getStats, 
  listUsers, 
  toggleUserActive, 
  updateUserRole, 
  getWeeklyReport 
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);
router.get('/stats', getStats);
router.get('/users', listUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);
router.patch('/users/:id/role', updateUserRole);
router.get('/report/weekly', getWeeklyReport);

module.exports = router;