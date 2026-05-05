const Budget = require('../models/Budget');

// @desc    Get all budgets for a user
// @route   GET /api/budgets
exports.getBudgets = async (req, res) => {
  try {
    const { month } = req.query; // optional filter
    const query = { user: req.user.id };
    if (month) query.month = month;
    
    const budgets = await Budget.find(query);
    res.status(200).json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a budget
// @route   POST /api/budgets
exports.createBudget = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const budget = await Budget.create(req.body);
    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Budget for this category and month already exists' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!budget) {
      return res.status(404).json({ success: false, error: 'Budget not found' });
    }
    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Budget for this category and month already exists' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!budget) {
      return res.status(404).json({ success: false, error: 'Budget not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid ID' });
  }
};
