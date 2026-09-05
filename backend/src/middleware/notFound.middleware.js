/**
 * Middleware to handle 404 - Route Not Found.
 * Enforces standardized error schema.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    errorCode: 'NOT_FOUND',
    details: []
  });
};

module.exports = notFoundHandler;
