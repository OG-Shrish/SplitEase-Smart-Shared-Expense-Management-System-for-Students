const Expense = require('../models/Expense');
const Group = require('../models/Group');

// @desc    Get basic analytics for a group
// @route   GET /api/analytics/group/:groupId
// @access  Private
const getGroupAnalytics = async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId });

    let totalSpending = 0;
    const categorySpending = {};

    expenses.forEach(exp => {
      totalSpending += exp.amount;
      if (!categorySpending[exp.category]) {
        categorySpending[exp.category] = 0;
      }
      categorySpending[exp.category] += exp.amount;
    });

    const categoryData = Object.keys(categorySpending).map(cat => ({
      name: cat,
      value: categorySpending[cat]
    }));

    res.status(200).json({
      success: true,
      data: {
        totalSpending,
        categoryData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly analytics
// @route   GET /api/analytics/group/:groupId/monthly
// @access  Private
const getMonthlyAnalytics = async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId }).sort('date');

    const monthlyMap = {};

    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = 0;
      }
      monthlyMap[monthYear] += exp.amount;
    });

    const monthlyData = Object.keys(monthlyMap).map(month => ({
      month,
      amount: monthlyMap[month]
    }));

    res.status(200).json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGroupAnalytics,
  getMonthlyAnalytics
};
