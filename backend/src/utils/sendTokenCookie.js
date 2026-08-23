const generateToken = require('./generateToken');

/**
 * Set HTTP-only JWT token cookie on Express response without sending JSON body.
 * Used for OAuth redirects.
 */
const setTokenCookie = (user, res) => {
  const token = generateToken(user._id, user.role);
  const days = parseInt(process.env.COOKIE_EXPIRES_DAYS || '7', 10);

  const cookieOptions = {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? (process.env.CROSS_SITE === 'true' ? 'none' : 'lax') : 'lax'
  };

  res.cookie('token', token, cookieOptions);
  return token;
};

/**
 * Issue JWT token and set HTTP-only cookie in HTTP response with JSON payload.
 * Used for Email/Password login and registration.
 */
const sendTokenCookie = (user, statusCode, res, message) => {
  const token = setTokenCookie(user, res);

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    }
  });
};

module.exports = sendTokenCookie;
module.exports.sendTokenCookie = sendTokenCookie;
module.exports.setTokenCookie = setTokenCookie;
