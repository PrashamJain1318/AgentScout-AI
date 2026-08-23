const express = require('express');
const {
  register,
  login,
  logout,
  getMe
} = require('../controllers/auth.controller');
const {
  initGoogleAuth,
  googleCallback,
  initGitHubAuth,
  githubCallback,
  getConnectedAccounts,
  disconnectProvider
} = require('../controllers/oauth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public email/password auth routes
router.post('/register', register);
router.post('/login', login);

// OAuth 2.0 Social Login routes
router.get('/google', initGoogleAuth);
router.get('/google/callback', googleCallback);

router.get('/github', initGitHubAuth);
router.get('/github/callback', githubCallback);

// Authenticated auth & session routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/connected-accounts', protect, getConnectedAccounts);
router.post('/disconnect/:provider', protect, disconnectProvider);

// Admin-role authorization test route
router.get('/admin-test', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin',
    user: req.user
  });
});

module.exports = router;
