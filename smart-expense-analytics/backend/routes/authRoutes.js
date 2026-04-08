const express = require('express');
const router = express.Router();
const { register, login, getMe, updateBudget, updateSavingsGoal } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/budget', protect, updateBudget);
router.put('/savings-goal', protect, updateSavingsGoal);

module.exports = router;