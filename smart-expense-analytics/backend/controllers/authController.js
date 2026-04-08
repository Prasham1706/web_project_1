const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../utils/store');

const getJwtSecret = () => process.env.JWT_SECRET || 'dev-only-change-in-production';

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    monthlyBudget: u.monthlyBudget || {},
    savingsGoal: u.savingsGoal || { targetAmount: 0, deadline: null, currentProgress: 0 },
  };
}

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (store.findUserByEmail(email)) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = store.newUserPayload({ name, email, passwordHash });
    store.createUser(user);

    const token = generateToken(user.id);
    res.status(201).json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = (req, res) => {
  try {
    const user = store.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update budget
// @route   PUT /api/auth/budget
exports.updateBudget = (req, res) => {
  try {
    const { category, amount } = req.body;
    const user = store.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const budgets = { ...(user.monthlyBudget || {}) };
    budgets[category] = Number(amount);
    store.updateUser(req.user.id, { monthlyBudget: budgets });
    res.json({
      success: true,
      monthlyBudget: store.findUserById(req.user.id).monthlyBudget,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update savings goal
// @route   PUT /api/auth/savings-goal
exports.updateSavingsGoal = (req, res) => {
  try {
    const { targetAmount, deadline } = req.body;
    const user = store.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    store.updateUser(req.user.id, {
      savingsGoal: {
        targetAmount: Number(targetAmount) || 0,
        deadline: deadline || null,
        currentProgress: 0,
      },
    });
    res.json({
      success: true,
      savingsGoal: store.findUserById(req.user.id).savingsGoal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
