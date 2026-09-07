const express = require('express');
const router = express.Router();
const { getBalances, getSimplifiedDebts, getUserBalances } = require('../controllers/balanceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserBalances);
router.get('/group/:groupId', protect, getBalances);
router.get('/group/:groupId/simplify', protect, getSimplifiedDebts);

module.exports = router;
