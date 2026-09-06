const express = require('express');
const router = express.Router();
const { getBalances, getSimplifiedDebts } = require('../controllers/balanceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/group/:groupId', protect, getBalances);
router.get('/group/:groupId/simplify', protect, getSimplifiedDebts);

module.exports = router;
