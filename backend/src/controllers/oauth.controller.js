const User = require('../models/User.model');
const { setTokenCookie } = require('../utils/sendTokenCookie');
const {
  generateOAuthState,
  getClientBaseUrl,
  getGoogleAuthUrl,
  handleGoogleCallback,
  getGitHubAuthUrl,
  handleGitHubCallback,
  findOrCreateSocialUser
} = require('../services/oauth.service');

// Helper to set state cookie
const setStateCookie = (res, state) => {
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? (process.env.CROSS_SITE === 'true' ? 'none' : 'lax') : 'lax',
    maxAge: 10 * 60 * 1000 // 10 minutes validity
  });
};

// ==========================================
// 1. GOOGLE OAUTH HANDLERS
// ==========================================

const initGoogleAuth = (req, res) => {
  try {
    const state = generateOAuthState();
    setStateCookie(res, state);
    const authUrl = getGoogleAuthUrl(state);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Google Auth Init Error:', error.message);
    const clientUrl = getClientBaseUrl();
    res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error.message || 'Unable to initiate Google authentication.')}`);
  }
};

const googleCallback = async (req, res) => {
  const clientUrl = getClientBaseUrl();
  const { code, state, error: oauthError } = req.query;
  const savedState = req.cookies?.oauth_state;

  res.clearCookie('oauth_state');

  if (oauthError) {
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('Google authentication was cancelled or denied.')}`);
  }

  if (!code || !state || state !== savedState) {
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('Invalid OAuth security state token. Please try again.')}`);
  }

  try {
    const oauthData = await handleGoogleCallback(code);
    const user = await findOrCreateSocialUser(oauthData);

    setTokenCookie(user, res);
    return res.redirect(`${clientUrl}/dashboard`);
  } catch (error) {
    console.error('Google Callback Error:', error.message);
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error.message || 'Google login failed.')}`);
  }
};

// ==========================================
// 2. GITHUB OAUTH HANDLERS
// ==========================================

const initGitHubAuth = (req, res) => {
  try {
    const state = generateOAuthState();
    setStateCookie(res, state);
    const authUrl = getGitHubAuthUrl(state);
    res.redirect(authUrl);
  } catch (error) {
    console.error('GitHub Auth Init Error:', error.message);
    const clientUrl = getClientBaseUrl();
    res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error.message || 'Unable to initiate GitHub authentication.')}`);
  }
};

const githubCallback = async (req, res) => {
  const clientUrl = getClientBaseUrl();
  const { code, state, error: oauthError } = req.query;
  const savedState = req.cookies?.oauth_state;

  res.clearCookie('oauth_state');

  if (oauthError) {
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('GitHub authentication was cancelled or denied.')}`);
  }

  if (!code || !state || state !== savedState) {
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('Invalid OAuth security state token. Please try again.')}`);
  }

  try {
    const oauthData = await handleGitHubCallback(code);
    const user = await findOrCreateSocialUser(oauthData);

    setTokenCookie(user, res);
    return res.redirect(`${clientUrl}/dashboard`);
  } catch (error) {
    console.error('GitHub Callback Error:', error.message);
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error.message || 'GitHub login failed.')}`);
  }
};

// ==========================================
// 3. SETTINGS CONNECTED ACCOUNTS CONTROLLER
// ==========================================

const getConnectedAccounts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const sa = user.socialAccounts || {};
    const hasPassword = Boolean(user.password);

    res.status(200).json({
      success: true,
      data: {
        hasPassword,
        authProviders: user.authProviders || ['email'],
        providers: {
          google: {
            connected: Boolean(sa.google?.id),
            email: sa.google?.email || null,
            picture: sa.google?.picture || null
          },
          github: {
            connected: Boolean(sa.github?.id),
            username: sa.github?.username || null,
            email: sa.github?.email || null,
            avatar: sa.github?.avatar || null
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const disconnectProvider = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const validProviders = ['google', 'github'];

    if (!validProviders.includes(provider)) {
      return res.status(400).json({ success: false, message: 'Invalid social auth provider specified.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const sa = user.socialAccounts || {};
    const hasPassword = Boolean(user.password);
    const connectedSocialCount = ['google', 'github'].filter(p => Boolean(sa[p]?.id)).length;

    // Safety Guard: Prevent disconnecting the only authentication method
    if (!hasPassword && connectedSocialCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot disconnect your only login method. Please add a password or connect another social account first.'
      });
    }

    // Unlink provider
    if (user.socialAccounts) {
      user.set(`socialAccounts.${provider}`, undefined);
    }

    user.authProviders = (user.authProviders || []).filter(p => p !== provider);
    if (user.authProviders.length === 0) {
      user.authProviders = hasPassword ? ['email'] : [];
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} account disconnected successfully.`,
      authProviders: user.authProviders
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initGoogleAuth,
  googleCallback,
  initGitHubAuth,
  githubCallback,
  getConnectedAccounts,
  disconnectProvider
};
