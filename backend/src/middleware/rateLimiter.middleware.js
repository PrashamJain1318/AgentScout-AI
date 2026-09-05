const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter middleware.
 * In development, max limit is relaxed to 10,000 requests per 15 min window.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 500 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

module.exports = {
  apiLimiter
};
