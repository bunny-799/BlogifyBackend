// src/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Middleware 1: Verify JWT Token
exports.verifyToken = async (req, res, next) => {
  let token;

  // Token can be sent in header as: Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user=decoded

    // Fetch user details (optional)
    req.user = await User.findById(decoded.id).select('-password');

    next(); // ✅ move to next middleware or controller
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Middleware 2: Authorize Specific Roles
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden: insufficient permissions' });
    }
    next(); // ✅ if user role matches, continue
  };
};
