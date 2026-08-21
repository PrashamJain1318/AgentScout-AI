const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas cluster using Mongoose.
 */
const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    
    if (!connStr) {
      console.warn('MONGODB_URI environment variable is not defined.');
      return;
    }

    if (connStr.includes('<db_password>')) {
      console.warn('MONGODB_URI contains placeholder <db_password>. Please update your .env file with your actual database password.');
      return;
    }

    const conn = await mongoose.connect(connStr);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not terminate process in dev mode so API health endpoint remains reachable
  }
};

module.exports = connectDB;
