const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas cluster using Mongoose.
 * Enforces strict connection verification before server startup.
 */
const connectDB = async () => {
  const connStr = process.env.MONGODB_URI;

  if (!connStr) {
    throw new Error('MONGODB_URI environment variable is not defined.');
  }

  if (connStr.includes('<db_password>')) {
    throw new Error('MONGODB_URI contains placeholder <db_password>. Please configure your database password in backend/.env.');
  }

  const conn = await mongoose.connect(connStr);
  console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
