const crypto = require('crypto');
const store = require('../utils/store');

const ALLOWED = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Education',
  'Other',
];

function validateBody(body) {
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 0.01) {
    return 'Amount must be a number ≥ 0.01';
  }
  const category = body.category;
  if (!category || !ALLOWED.includes(category)) {
    return `Category must be one of: ${ALLOWED.join(', ')}`;
  }
  const description = String(body.description || '').trim();
  if (!description) return 'Description is required';
  if (description.length > 100) return 'Description cannot exceed 100 characters';
  const date = body.date ? new Date(body.date) : new Date();
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return null;
}

// @desc    Get all transactions (for current user)
// @route   GET /api/transactions
exports.getTransactions = (req, res) => {
  try {
    const { startDate, endDate, category, limit = 50 } = req.query;
    const transactions = store.listTransactionsForUser(req.user.id, {
      startDate,
      endDate,
      category,
      limit: parseInt(limit, 10) || 50,
    });
    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add transaction
// @route   POST /api/transactions
exports.addTransaction = (req, res) => {
  try {
    const err = validateBody(req.body);
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }
    const amount = Number(req.body.amount);
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const now = new Date().toISOString();
    const doc = {
      _id: crypto.randomUUID(),
      userId: req.user.id,
      amount,
      category: req.body.category,
      description: String(req.body.description).trim(),
      date: date.toISOString(),
      isRecurring: !!req.body.isRecurring,
      createdAt: now,
      updatedAt: now,
    };
    const transaction = store.addTransactionDoc(doc);
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = (req, res) => {
  try {
    const tx = store.getTransactionById(req.params.id);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (tx.userId !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    store.deleteTransactionById(req.params.id);
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
