const connectDB = require('../backend/src/config/db');
const app = require('../backend/src/app');

module.exports = async (req, res) => {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
    }
  } catch (err) {
    console.error('Vercel serverless DB connection error:', err.message);
  }

  return new Promise((resolve, reject) => {
    // Keep the Vercel serverless function alive until Express finishes sending the response
    res.once('finish', resolve);
    res.once('error', reject);

    try {
      app(req, res);
    } catch (err) {
      console.error('Vercel handler fatal error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: err.message || 'Internal Server Error'
        });
      }
      resolve(); // resolve to prevent hanging
    }
  });
};
