/**
 * Production-Grade Centralized Error Handling Middleware.
 * Enforces standardized JSON error payloads across all API routes:
 * {
 *   success: false,
 *   message: "...",
 *   errorCode: "...",
 *   details: []
 * }
 */

const STATUS_ERROR_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_SERVER_ERROR'
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected server error occurred';
  let errorCode = err.errorCode || STATUS_ERROR_CODES[statusCode] || 'INTERNAL_SERVER_ERROR';
  let details = Array.isArray(err.details) ? err.details : [];

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed for request payload';
    details = Object.values(err.errors || {}).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'CONFLICT';
    const field = Object.keys(err.keyValue || {})[0] || 'record';
    message = `A ${field} with this value already exists`;
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'BAD_REQUEST';
    message = `Invalid format for field '${err.path}'`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Authentication token has expired. Please log in again';
  }

  const response = {
    success: false,
    message,
    errorCode,
    details
  };

  // Provide stack trace only in development environment
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
