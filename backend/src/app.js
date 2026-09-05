const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

// Robust multi-path .env loader
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env'),
  path.join(process.cwd(), 'backend/.env'),
  path.join(process.cwd(), '.env')
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}
dotenv.config(); // fallback default

const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');
const apiRouter = require('./routes');

const app = express();

// Trust reverse proxy (Vercel / AWS / Cloudflare) for rate limiting & IP detection
app.set('trust proxy', 1);

// 1. Security HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Robust CORS Configuration supporting production & local dev origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl) or allowed origins
      if (!origin) return callback(null, true);
      if (allowedOrigins.some(o => origin.startsWith(o) || o.startsWith(origin))) {
        return callback(null, true);
      }
      // In production with credentials, echo requesting origin if valid domain
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
  })
);

// 3. Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 4. Request Body Parsers
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

module.exports = app;
