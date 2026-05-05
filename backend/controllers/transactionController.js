const Transaction = require('../models/Transaction');

// Get all transactions (supports pagination & filtering)
exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 20;
    
    const query = { user: req.user.id };
    
    if (req.query.type && req.query.type !== 'all') {
      query.type = req.query.type;
    }
    
    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { note: { $regex: req.query.keyword, $options: 'i' } },
        { category: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }
    
    const sortParams = {};
    if (req.query.sortOrder === 'asc') {
      sortParams.transaction_date = 1;
    } else {
      sortParams.transaction_date = -1;
    }

    if (page) {
      const startIndex = (page - 1) * limit;
      const total = await Transaction.countDocuments(query);
      const transactions = await Transaction.find(query)
        .sort(sortParams)
        .skip(startIndex)
        .limit(limit);
      
      return res.status(200).json({
        success: true,
        data: transactions,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    // If no page provided, return all (for dashboard charts etc)
    const transactions = await Transaction.find(query).sort(sortParams);
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Create a transaction
exports.createTransaction = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const transaction = await Transaction.create(req.body);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get a single transaction
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid ID' });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid ID' });
  }
};

// @desc    Get transaction summary/aggregates
// @route   GET /api/transactions/summary
exports.getTransactionSummary = async (req, res) => {
  try {
    const query = { user: req.user.id };
    
    if (req.query.type && req.query.type !== 'all') {
      query.type = req.query.type;
    }
    
    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { note: { $regex: req.query.keyword, $options: 'i' } },
        { category: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query);
    
    const summary = transactions.reduce((acc, item) => {
      acc.count += 1;
      if (item.type === 'income') {
        acc.income += Number(item.amount || 0);
      } else {
        acc.expense += Number(item.amount || 0);
      }
      return acc;
    }, { count: 0, income: 0, expense: 0 });

    summary.net = summary.income - summary.expense;

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
