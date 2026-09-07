const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');

// Helper to calculate raw balances
const calculateRawBalances = async (groupId) => {
  const expenses = await Expense.find({ group: groupId });
  const settlements = await Settlement.find({ group: groupId, status: 'Completed' });

  const balances = {}; // { userId: net_amount }

  // 1. Process Expenses
  expenses.forEach(exp => {
    const paidByStr = exp.paidBy.toString();
    if (!balances[paidByStr]) balances[paidByStr] = 0;
    
    // Add amount paid to payer's balance
    balances[paidByStr] += exp.amount;

    // Subtract amount owed from participants
    exp.splits.forEach(split => {
      const userStr = split.user.toString();
      if (!balances[userStr]) balances[userStr] = 0;
      balances[userStr] -= split.amount;
    });
  });

  // 2. Process Completed Settlements
  settlements.forEach(settlement => {
    const fromUserStr = settlement.fromUser.toString();
    const toUserStr = settlement.toUser.toString();

    if (!balances[fromUserStr]) balances[fromUserStr] = 0;
    if (!balances[toUserStr]) balances[toUserStr] = 0;

    // fromUser paid back money, so their balance goes UP
    balances[fromUserStr] += settlement.amount;
    // toUser received money, so their balance goes DOWN
    balances[toUserStr] -= settlement.amount;
  });

  return balances;
};

// @desc    Get raw net balances for a group
// @route   GET /api/balances/group/:groupId
// @access  Private
const getBalances = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'name email');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const rawBalances = await calculateRawBalances(req.params.groupId);

    // Format output
    const balances = group.members.map(member => {
      return {
        user: member,
        balance: Number((rawBalances[member._id.toString()] || 0).toFixed(2))
      };
    });

    res.status(200).json({
      success: true,
      data: balances
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get simplified debts for a group
// @route   GET /api/balances/group/:groupId/simplify
// @access  Private
const getSimplifiedDebts = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'name');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const rawBalances = await calculateRawBalances(req.params.groupId);

    const debtors = [];
    const creditors = [];

    // Map ID to Name for easier frontend consumption
    const userMap = {};
    group.members.forEach(m => userMap[m._id.toString()] = m);

    Object.keys(rawBalances).forEach(userId => {
      const balance = Number(rawBalances[userId].toFixed(2));
      if (balance < 0) {
        debtors.push({ userId, amount: -balance });
      } else if (balance > 0) {
        creditors.push({ userId, amount: balance });
      }
    });

    // Sort descending by amount to minimize transactions
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let transactions = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const amountToSettle = Math.min(debtor.amount, creditor.amount);

      transactions.push({
        from: userMap[debtor.userId],
        to: userMap[creditor.userId],
        amount: Number(amountToSettle.toFixed(2))
      });

      debtor.amount -= amountToSettle;
      creditor.amount -= amountToSettle;

      if (Math.abs(debtor.amount) < 0.01) i++;
      if (Math.abs(creditor.amount) < 0.01) j++;
    }

    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's balances summary across all groups
// @route   GET /api/balances
// @access  Private
const getUserBalances = async (req, res) => {
  try {
    const userGroups = await Group.find({ members: req.user.id }).populate('members', 'name email');
    const groupSummaries = [];
    let totalOwed = 0;
    let totalOwe = 0;

    for (const group of userGroups) {
      const rawBalances = await calculateRawBalances(group._id);
      const myBal = rawBalances[req.user.id.toString()] || 0;
      if (myBal > 0) totalOwed += myBal;
      else if (myBal < 0) totalOwe += Math.abs(myBal);

      const memberBalances = group.members.map(member => ({
        user: member,
        balance: Number((rawBalances[member._id.toString()] || 0).toFixed(2))
      }));

      groupSummaries.push({
        group: { _id: group._id, name: group.name, description: group.description },
        myBalance: Number(myBal.toFixed(2)),
        members: memberBalances
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalOwed: Number(totalOwed.toFixed(2)),
        totalOwe: Number(totalOwe.toFixed(2)),
        netBalance: Number((totalOwed - totalOwe).toFixed(2)),
        groups: groupSummaries
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBalances,
  getSimplifiedDebts,
  getUserBalances
};
