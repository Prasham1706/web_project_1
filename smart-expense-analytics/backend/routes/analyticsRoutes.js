const express = require('express');
const router = express.Router();
const {
  getSummary,
  getSpendingTrends,
  getCategoryBreakdown,
  predictEndOfMonth,
  getBudgetStatus,
  getHighSpendingCategories,
  getMonthlyInsights,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getSummary);
router.get('/trends', protect, getSpendingTrends);
router.get('/categories', protect, getCategoryBreakdown);
router.get('/predict', protect, predictEndOfMonth);
router.get('/budget', protect, getBudgetStatus);
router.get('/high-spending', protect, getHighSpendingCategories);
router.get('/insights', protect, getMonthlyInsights);

module.exports = router;
