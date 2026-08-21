const express = require('express');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protected User Profile endpoints
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
