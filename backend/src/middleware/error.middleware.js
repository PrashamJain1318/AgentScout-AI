/**
 * Centralized Error Handling Middleware.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const environment = process.env.NODE_ENV || 'development';

  const response = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  // Provide stack trace in development mode for debugging
  if (environment === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
