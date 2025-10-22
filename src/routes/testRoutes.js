// src/routes/testRoutes.js

const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route
router.get('/public', (req, res) => {
  res.json({ message: 'This is a public route 🟢' });
});

// Protected: any logged-in user
router.get('/user', verifyToken, (req, res) => {
    console.log(req,"reqqq")
  res.json({ message: `Welcome, ${req.user.name} (Role: ${req.user.role})` });
});

// Protected: only authors
router.get('/author', verifyToken, authorizeRoles('author', 'admin'), (req, res) => {
  res.json({ message: `Author access granted, ${req.user.name} ✍️` });
});

// Protected: only admin
router.get('/admin', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: `Admin dashboard access granted 🛡️` });
});

module.exports = router;
