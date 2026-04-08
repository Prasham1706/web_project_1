const jwt = require('jsonwebtoken');
const store = require('../utils/store');

const getJwtSecret = () => process.env.JWT_SECRET || 'dev-only-change-in-production';

// @desc Protect routes — JWT in Authorization: Bearer <token>
exports.protect = (req, res, next) => {
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    token = auth.slice(7);
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = store.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    const { passwordHash: _p, ...safe } = user;
    req.user = { ...safe, id: user.id };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};
