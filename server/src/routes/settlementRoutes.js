const express = require('express');
const router = express.Router();
const {
  createSettlement,
  getGroupSettlements,
  completeSettlement
} = require('../controllers/settlementController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSettlement);
router.get('/group/:groupId', protect, getGroupSettlements);
router.put('/:id/complete', protect, completeSettlement);

module.exports = router;
