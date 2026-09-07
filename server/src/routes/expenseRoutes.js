const express = require('express');
const router = express.Router();
const {
  createExpense,
  getUserExpenses,
  getGroupExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createExpense)
  .get(protect, getUserExpenses);
router.get('/group/:groupId', protect, getGroupExpenses);
router.route('/:id')
  .get(protect, getExpenseById)
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

module.exports = router;
