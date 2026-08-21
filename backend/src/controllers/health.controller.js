const mongoose = require('mongoose');

/**
 * Controller to handle Health Check requests.
 * Includes server status, environment, and MongoDB connection status.
 */
const getHealthStatus = (req, res) => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const dbState = mongoose.connection.readyState;
  const dbStatus = stateMap[dbState] || 'unknown';

  res.status(200).json({
    success: true,
    message: 'AgentScout API is running',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      readyState: dbState
    }
  });
};

module.exports = {
  getHealthStatus
};
