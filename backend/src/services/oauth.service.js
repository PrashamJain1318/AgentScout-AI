const https = require('https');
const crypto = require('crypto');
const User = require('../models/User.model');

/**
 * Perform HTTPS JSON / Form requests natively without bulky external SDKs.
 */
const makeHttpRequest = (url, options = {}, postData = null) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed, raw: body });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

/**
 * Generate CSRF state token.
 */
const generateOAuthState = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Get Client / Frontend Redirect URL based on environment.
 */
const getClientBaseUrl = () => {
  return process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
};

/**
 * Get Backend Callback Base URL based on environment.
 */
const getBackendBaseUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  const clientUrl = getClientBaseUrl();
  if (clientUrl.includes('localhost') || clientUrl.includes('127.0.0.1')) {
    return `http://localhost:${process.env.PORT || 5001}`;
  }
  return clientUrl;
};

const isConfiguredKey = (key) => {
  if (!key) return false;
  const k = key.trim().toLowerCase();
  return k.length > 5 && !k.startsWith('your_') && !k.startsWith('your-') && !k.startsWith('<') && !k.includes('placeholder');
};

// ==========================================
// 1. GOOGLE OAUTH 2.0
// ==========================================

const getGoogleAuthUrl = (state) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${getBackendBaseUrl()}/api/auth/google/callback`;

  if (!isConfiguredKey(clientId)) {
    throw new Error('Google OAuth credentials are not configured yet. Please configure GOOGLE_CLIENT_ID in backend/.env');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    access_type: 'online',
    prompt: 'select_account'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const handleGoogleCallback = async (code) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${getBackendBaseUrl()}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials (CLIENT_ID / CLIENT_SECRET) are missing.');
  }

  const tokenPayload = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  }).toString();

  const tokenRes = await makeHttpRequest('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, tokenPayload);

  if (!tokenRes.data || !tokenRes.data.access_token) {
    throw new Error(`Google token exchange failed: ${tokenRes.data?.error_description || tokenRes.raw || 'Invalid response'}`);
  }

  const accessToken = tokenRes.data.access_token;

  const profileRes = await makeHttpRequest('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const profile = profileRes.data || {};
  if (!profile.sub || !profile.email) {
    throw new Error('Google did not return a valid user identity or email address.');
  }

  return {
    provider: 'google',
    id: profile.sub,
    email: profile.email.toLowerCase(),
    firstName: profile.given_name || profile.name?.split(' ')[0] || 'Google',
    lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || 'User',
    picture: profile.picture || ''
  };
};

// ==========================================
// 2. GITHUB OAUTH 2.0
// ==========================================

const getGitHubAuthUrl = (state) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL || `${getBackendBaseUrl()}/api/auth/github/callback`;

  if (!isConfiguredKey(clientId)) {
    throw new Error('GitHub OAuth credentials are not configured yet. Please configure GITHUB_CLIENT_ID in backend/.env');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

const handleGitHubCallback = async (code) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_CALLBACK_URL || `${getBackendBaseUrl()}/api/auth/github/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth credentials (CLIENT_ID / CLIENT_SECRET) are missing.');
  }

  const tokenPayload = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri
  }).toString();

  const tokenRes = await makeHttpRequest('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    }
  }, tokenPayload);

  if (!tokenRes.data || !tokenRes.data.access_token) {
    throw new Error(`GitHub token exchange failed: ${tokenRes.data?.error_description || tokenRes.raw || 'Invalid response'}`);
  }

  const accessToken = tokenRes.data.access_token;

  const profileRes = await makeHttpRequest('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'AgentScout-AI'
    }
  });

  const profile = profileRes.data || {};
  if (!profile.id) {
    throw new Error('GitHub did not return a valid user identity.');
  }

  let email = profile.email;

  if (!email) {
    const emailsRes = await makeHttpRequest('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'AgentScout-AI'
      }
    });

    const emailsList = Array.isArray(emailsRes.data) ? emailsRes.data : [];
    const primaryVerified = emailsList.find(e => e.primary && e.verified) || emailsList.find(e => e.verified);
    if (primaryVerified) {
      email = primaryVerified.email;
    }
  }

  if (!email) {
    throw new Error('Your GitHub account does not have a verified public email available.');
  }

  const nameParts = (profile.name || profile.login || 'GitHub User').trim().split(/\s+/);
  const firstName = nameParts[0] || 'GitHub';
  const lastName = nameParts.slice(1).join(' ') || 'User';

  return {
    provider: 'github',
    id: String(profile.id),
    username: profile.login,
    email: email.toLowerCase(),
    firstName,
    lastName,
    avatar: profile.avatar_url || ''
  };
};

// ==========================================
// 3. SAFE USER FIND / CREATE / LINK ENGINE
// ==========================================

const findOrCreateSocialUser = async (oauthData) => {
  const { provider, id, email, firstName, lastName, picture, avatar, username } = oauthData;
  const providerIdPath = `socialAccounts.${provider}.id`;

  let user = await User.findOne({ [providerIdPath]: id });

  if (user) {
    if (!Array.isArray(user.authProviders)) user.authProviders = ['email'];
    if (!user.authProviders.includes(provider)) {
      user.authProviders.push(provider);
      await user.save();
    }
    return user;
  }

  user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    if (!user.socialAccounts) user.socialAccounts = {};
    if (!user.socialAccounts[provider]) user.socialAccounts[provider] = {};

    user.socialAccounts[provider].id = id;
    user.socialAccounts[provider].email = email;
    if (username) user.socialAccounts[provider].username = username;
    if (picture || avatar) user.socialAccounts[provider].picture = picture || avatar;

    if (!Array.isArray(user.authProviders)) user.authProviders = ['email'];
    if (!user.authProviders.includes(provider)) {
      user.authProviders.push(provider);
    }

    if (!user.avatar && (picture || avatar)) user.avatar = picture || avatar;
    if (provider === 'github' && !user.profile.github) user.profile.github = `https://github.com/${username}`;

    await user.save();
    return user;
  }

  const newUser = new User({
    firstName,
    lastName,
    email: email.toLowerCase(),
    avatar: picture || avatar || '',
    authProviders: [provider],
    socialAccounts: {
      [provider]: {
        id,
        email,
        username: username || null,
        picture: picture || avatar || null
      }
    },
    profile: {
      headline: `${firstName} ${lastName} — Candidate`,
      github: provider === 'github' && username ? `https://github.com/${username}` : '',
      preferences: {
        desiredRoles: ['Software Engineer'],
        preferredLocations: ['Remote'],
        jobTypes: ['Full-time'],
        workModes: ['Remote', 'Hybrid']
      }
    }
  });

  await newUser.save();
  return newUser;
};

module.exports = {
  generateOAuthState,
  getClientBaseUrl,
  getBackendBaseUrl,
  getGoogleAuthUrl,
  handleGoogleCallback,
  getGitHubAuthUrl,
  handleGitHubCallback,
  findOrCreateSocialUser
};
