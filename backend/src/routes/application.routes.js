const express = require('express');

const {
  createApplication,
  getApplications,
  getApplication,
  getApplicationAnalytics,
  updateApplication,
  deleteApplication
} = require('../controllers/application.controller');

const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getApplications);

router.post('/', protect, createApplication);

// Static action route BEFORE parameterized /:id route
router.get('/analytics', protect, getApplicationAnalytics);

router.get('/:id', protect, getApplication);

router.put('/:id', protect, updateApplication);

router.patch('/:id', protect, updateApplication);

router.delete('/:id', protect, deleteApplication);

module.exports = router;
