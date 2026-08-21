const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');
const apiRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Connect to MongoDB Atlas
connectDB();

// 2. Security HTTP Headers
app.use(helmet());

// 3. CORS Configuration
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 4. Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 5. Request Body Parsers & Cookie Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 6. Global Rate Limiter
app.use('/api', apiLimiter);

// 7. API Routes
app.use('/api', apiRouter);

// 8. 404 Route Not Found Middleware
app.use(notFoundHandler);

// 9. Centralized Error Middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`AgentScout API server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Please specify a free PORT in .env or environment.`);
  } else {
    console.error('Server error:', err);
  }
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('Mongoose connection closed.');
      }
      process.exit(0);
    } catch (err) {
      console.error('Error closing Mongoose connection:', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = app;
