const express = require('express');
const {
  register,
  login,
  logout,
  getMe
} = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);

// Authenticated auth routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// Admin-role authorization test route
router.get('/admin-test', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin',
    user: req.user
  });
});

module.exports = router;
