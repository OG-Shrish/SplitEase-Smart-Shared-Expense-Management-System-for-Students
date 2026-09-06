const Group = require('../models/Group');
const User = require('../models/User');

// @desc    Create a group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    // Include the creator in members if not already there
    let groupMembers = members || [];
    if (!groupMembers.includes(req.user.id)) {
      groupMembers.push(req.user.id);
    }

    const group = await Group.create({
      name,
      description,
      createdBy: req.user.id,
      members: groupMembers
    });

    const populatedGroup = await Group.findById(group._id).populate('members', 'name email');

    res.status(201).json({
      success: true,
      data: populatedGroup
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(member => member._id.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this group' });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    let group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    
    // Check authorization (only creator can update info for simplicity, or any member)
    const isMember = group.members.some(member => member.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this group' });
    }

    group = await Group.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    ).populate('members', 'name email');

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Only creator can delete
    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the creator can delete this group' });
    }

    await group.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isMember = group.members.some(member => member.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (group.members.includes(userToAdd._id)) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    group.members.push(userToAdd._id);
    await group.save();

    const updatedGroup = await Group.findById(req.params.id).populate('members', 'name email');

    res.status(200).json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
const removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Only admin can remove, or user removing themselves
    if (group.createdBy.toString() !== req.user.id && req.params.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (group.createdBy.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the group creator' });
    }

    group.members = group.members.filter(member => member.toString() !== req.params.userId);
    await group.save();

    const updatedGroup = await Group.findById(req.params.id).populate('members', 'name email');

    res.status(200).json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember
};
