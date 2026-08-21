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
app.use(express.json({ limit: "10kb" }));
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security HTTP Headers
app.use(helmet());

// 2. CORS Configuration
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 4. Request Body Parsers (supports JSON, text/plain raw bodies, urlencoded)
app.use(express.json({ limit: '10kb', type: ['application/json', 'text/plain', '*/*+json'] }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Universal body parser fallback for buffers and raw JSON strings
app.use((req, res, next) => {
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf-8'));
    } catch (e) {
      // Ignore parse failure
    }
  } else if (typeof req.body === 'string' && req.body.trim().startsWith('{')) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // Ignore parse failure
    }
  }
  next();
});

// 5. Global Rate Limiter
app.use('/api', apiLimiter);

// 6. API Routes
app.use('/api', apiRouter);

// 7. 404 Route Not Found Middleware
app.use(notFoundHandler);

// 8. Centralized Error Middleware
app.use(errorHandler);

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
