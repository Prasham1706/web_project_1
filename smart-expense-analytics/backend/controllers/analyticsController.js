const moment = require('moment');
const store = require('../utils/store');

function transactionsForUser(userId) {
  return store.listTransactionsForUser(userId, { limit: 100000 });
}

// @desc Total spending + category-wise sums (simple analytics)
// @route GET /api/analytics/summary
exports.getSummary = (req, res) => {
  try {
    const list = transactionsForUser(req.user.id);
    const totalSpending = list.reduce((s, t) => s + Number(t.amount || 0), 0);
    const categorySum = {};
    for (const t of list) {
      const c = t.category || 'Other';
      categorySum[c] = (categorySum[c] || 0) + Number(t.amount || 0);
    }
    const byCategory = Object.entries(categorySum).map(([category, total]) => ({
      category,
      total,
    }));
    res.json({
      success: true,
      totalSpending,
      categoryWise: byCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get spending trends
// @route   GET /api/analytics/trends
exports.getSpendingTrends = (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = moment().subtract(Number(days) || 30, 'days').startOf('day');
    const list = transactionsForUser(req.user.id).filter(
      (t) => new Date(t.date) >= startDate.toDate()
    );

    const byDayCat = {};
    for (const t of list) {
      const d = moment(t.date).format('YYYY-MM-DD');
      const key = `${d}|${t.category}`;
      byDayCat[key] = (byDayCat[key] || 0) + Number(t.amount);
    }

    const byDay = {};
    for (const [key, total] of Object.entries(byDayCat)) {
      const [date, category] = key.split('|');
      if (!byDay[date]) {
        byDay[date] = { categories: [], dailyTotal: 0 };
      }
      byDay[date].categories.push({ category, amount: total });
      byDay[date].dailyTotal += total;
    }

    const trends = Object.keys(byDay)
      .sort()
      .map((date) => ({
        _id: date,
        categories: byDay[date].categories,
        dailyTotal: byDay[date].dailyTotal,
      }));

    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category breakdown
// @route   GET /api/analytics/categories
exports.getCategoryBreakdown = (req, res) => {
  try {
    const { month } = req.query;
    const startDate = month ? moment(month).startOf('month') : moment().startOf('month');
    const endDate = moment(startDate).endOf('month');

    const list = transactionsForUser(req.user.id).filter((t) => {
      const d = new Date(t.date);
      return d >= startDate.toDate() && d <= endDate.toDate();
    });

    const totals = {};
    let countSum = {};
    for (const t of list) {
      const c = t.category;
      totals[c] = (totals[c] || 0) + Number(t.amount);
      countSum[c] = (countSum[c] || 0) + 1;
    }

    const breakdown = Object.entries(totals)
      .map(([category, total]) => ({
        _id: category,
        total,
        count: countSum[category] || 0,
      }))
      .sort((a, b) => b.total - a.total);

    const totalSpent = breakdown.reduce((sum, item) => sum + item.total, 0);
    const breakdownWithPercentage = breakdown.map((item) => ({
      category: item._id,
      total: item.total,
      count: item.count,
      percentage: totalSpent ? ((item.total / totalSpent) * 100).toFixed(2) : '0.00',
    }));

    res.json({
      success: true,
      totalSpent,
      breakdown: breakdownWithPercentage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Predict end of month spending
// @route   GET /api/analytics/predict
exports.predictEndOfMonth = (req, res) => {
  try {
    const today = moment();
    const startOfMonth = moment().startOf('month');
    const daysPassed = today.diff(startOfMonth, 'days') + 1;
    const daysInMonth = today.daysInMonth();

    const list = transactionsForUser(req.user.id).filter((t) => {
      const d = new Date(t.date);
      return d >= startOfMonth.toDate() && d <= today.toDate();
    });
    const spentSoFar = list.reduce((s, t) => s + Number(t.amount), 0);
    const dailyAverage = daysPassed > 0 ? spentSoFar / daysPassed : 0;
    const predictedTotal = dailyAverage * daysInMonth;

    const lastMonth = moment().subtract(1, 'month');
    const lastList = transactionsForUser(req.user.id).filter((t) => {
      const d = new Date(t.date);
      return d >= lastMonth.startOf('month').toDate() && d <= lastMonth.endOf('month').toDate();
    });
    const lastMonthTotal = lastList.reduce((s, t) => s + Number(t.amount), 0);

    res.json({
      success: true,
      spentSoFar,
      predictedTotal,
      dailyAverage,
      daysRemaining: daysInMonth - daysPassed,
      lastMonthTotal,
      trend: predictedTotal > lastMonthTotal ? 'increasing' : 'decreasing',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get budget status
// @route   GET /api/analytics/budget
exports.getBudgetStatus = (req, res) => {
  try {
    const user = store.findUserById(req.user.id);
    const startOfMonth = moment().startOf('month');

    const list = transactionsForUser(req.user.id).filter(
      (t) => new Date(t.date) >= startOfMonth.toDate()
    );
    const spentByCat = {};
    for (const t of list) {
      spentByCat[t.category] = (spentByCat[t.category] || 0) + Number(t.amount);
    }

    const budgetMap = user.monthlyBudget || {};
    const budgetStatus = [];

    for (const category of Object.keys(budgetMap)) {
      const spent = spentByCat[category] || 0;
      const budget = budgetMap[category];
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      budgetStatus.push({
        category,
        budget,
        spent,
        remaining: budget - spent,
        percentage: Math.min(percentage, 100).toFixed(2),
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good',
      });
    }

    res.json({ success: true, budgetStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get high spending categories
// @route   GET /api/analytics/high-spending
exports.getHighSpendingCategories = (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 80;
    const user = store.findUserById(req.user.id);
    const startOfMonth = moment().startOf('month');

    const list = transactionsForUser(req.user.id).filter(
      (t) => new Date(t.date) >= startOfMonth.toDate()
    );
    const spentByCat = {};
    for (const t of list) {
      spentByCat[t.category] = (spentByCat[t.category] || 0) + Number(t.amount);
    }

    const budgetMap = user.monthlyBudget || {};
    const highSpending = [];

    for (const [category, spent] of Object.entries(spentByCat)) {
      const budget = budgetMap[category] || 0;
      if (budget <= 0) continue;
      const percentage = (spent / budget) * 100;
      if (percentage >= threshold) {
        highSpending.push({
          category,
          spent,
          budget,
          percentage: percentage.toFixed(2),
        });
      }
    }

    res.json({ success: true, highSpending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly insights
// @route   GET /api/analytics/insights
exports.getMonthlyInsights = (req, res) => {
  try {
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');

    const list = transactionsForUser(req.user.id).filter((t) => {
      const d = new Date(t.date);
      return d >= startOfMonth.toDate() && d <= endOfMonth.toDate();
    });

    const byCat = {};
    for (const t of list) {
      byCat[t.category] = (byCat[t.category] || 0) + Number(t.amount);
    }
    const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const topCategory = sorted[0]?.[0] || 'None';
    const topCategoryAmount = sorted[0]?.[1] || 0;

    const insights = [];
    if (topCategory !== 'None') {
      insights.push(
        `Your highest spending category is ${topCategory} with ₹${topCategoryAmount.toFixed(2)}.`
      );
    }

    const monthList = transactionsForUser(req.user.id).filter(
      (t) => new Date(t.date) >= startOfMonth.toDate()
    );
    const totalSpent = monthList.reduce((s, t) => s + Number(t.amount), 0);
    const dailyAvg = totalSpent / Math.max(1, moment().date());
    if (dailyAvg > 1000) {
      insights.push(
        `Your daily spending average is ₹${dailyAvg.toFixed(2)}. Consider reducing small expenses.`
      );
    }

    res.json({
      success: true,
      topCategory,
      topCategoryAmount,
      insights,
      month: startOfMonth.format('MMMM YYYY'),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
