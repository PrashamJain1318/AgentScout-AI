const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5001;
let server;

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
          console.log('Mongoose connection closed.');
        }
        process.exit(0);
      } catch (err) {
        console.error('Error closing Mongoose connection:', err.message);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Startup sequence: Connect to MongoDB first, then start HTTP server
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start HTTP server only after DB connection succeeds
    server = app.listen(PORT, () => {
      console.log(`AgentScout API server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is in use. Please specify a free PORT in .env or environment.`);
      } else {
        console.error('Server error:', err.message);
      }
    });
  } catch (error) {
    console.error(`Database initialization failed: ${error.message}`);
    console.error('HTTP server will not start because database connection could not be established.');
    process.exit(1);
  }
};

startServer();

module.exports = app;
