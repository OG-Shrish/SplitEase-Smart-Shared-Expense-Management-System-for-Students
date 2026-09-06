const express = require('express');
const router = express.Router();
const { getGroupAnalytics, getMonthlyAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/group/:groupId', protect, getGroupAnalytics);
router.get('/group/:groupId/monthly', protect, getMonthlyAnalytics);

module.exports = router;
