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
  return app(req, res);
};
