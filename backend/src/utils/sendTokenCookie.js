const generateToken = require('./generateToken');

/**
 * Issue JWT token and set HTTP-only cookie in HTTP response.
 * @param {Object} user - User document
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @param {string} message - Response message
 */
const sendTokenCookie = (user, statusCode, res, message) => {
  const token = generateToken(user._id, user.role);
  const days = parseInt(process.env.COOKIE_EXPIRES_DAYS || '7', 10);

  const cookieOptions = {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
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
