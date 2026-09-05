/**
 * Performance Monitoring Middleware.
 * Logs slow HTTP requests exceeding the threshold (default 1000ms) for diagnostic audit.
 */
const performanceMonitor = (thresholdMs = 1000) => {
  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > thresholdMs) {
        console.warn(`[SLOW REQUEST WARNING] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
      }
    });

    next();
  };
};

module.exports = performanceMonitor;
