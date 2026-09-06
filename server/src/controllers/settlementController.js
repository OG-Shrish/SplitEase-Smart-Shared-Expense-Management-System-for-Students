const Settlement = require('../models/Settlement');
const Group = require('../models/Group');

// @desc    Record a settlement
// @route   POST /api/settlements
// @access  Private
const createSettlement = async (req, res) => {
  try {
    const { fromUser, toUser, amount, group, status } = req.body;

    if (!fromUser || !toUser || !amount || !group) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const grp = await Group.findById(group);
    if (!grp) return res.status(404).json({ success: false, message: 'Group not found' });

    // Validate members
    if (!grp.members.includes(fromUser) || !grp.members.includes(toUser)) {
      return res.status(400).json({ success: false, message: 'Users must be part of the group' });
    }

    const settlement = await Settlement.create({
      fromUser,
      toUser,
      amount,
      group,
      status: status || 'Pending',
      settledAt: status === 'Completed' ? Date.now() : null
    });

    const populated = await Settlement.findById(settlement._id)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get settlements for a group
// @route   GET /api/settlements/group/:groupId
// @access  Private
const getGroupSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: settlements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark settlement as complete
// @route   PUT /api/settlements/:id/complete
// @access  Private
const completeSettlement = async (req, res) => {
  try {
    let settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      return res.status(404).json({ success: false, message: 'Settlement not found' });
    }

    settlement.status = 'Completed';
    settlement.settledAt = Date.now();
    await settlement.save();

    const populated = await Settlement.findById(settlement._id)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email');

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSettlement,
  getGroupSettlements,
  completeSettlement
};
