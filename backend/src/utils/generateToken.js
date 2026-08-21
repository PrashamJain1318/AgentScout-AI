const jwt = require('jsonwebtoken');

/**
 * Generate JSON Web Token (JWT) for user session.
 * @param {string} userId - User ID
 * @param {string} role - User role (user | admin)
 * @returns {string} JWT Token
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }

  return jwt.sign({ id: userId, role }, secret, {
    expiresIn
  });
};

module.exports = generateToken;
