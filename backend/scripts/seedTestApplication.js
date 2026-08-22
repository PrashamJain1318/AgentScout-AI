require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Opportunity = require('../src/models/Opportunity.model');
const Application = require('../src/models/Application.model');

/**
 * Development-only test seed script for Phase 13 Application Tracker verification.
 * Seeds test Application documents for ALL registered users in MongoDB Atlas.
 */
const seedTestApplication = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Error: MONGODB_URI environment variable is not defined.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    // 1. Fetch ALL users from MongoDB
    const users = await User.find();
    if (!users || users.length === 0) {
      console.error('Error: No users found in MongoDB. Please register a user first.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // 2. Fetch an active opportunity from MongoDB
    let opportunity = await Opportunity.findOne({ isActive: true });
    if (!opportunity) {
      opportunity = await Opportunity.findOne();
    }

    if (!opportunity) {
      console.error('Error: No active opportunity found in MongoDB. Please run the scraper first.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`Found ${users.length} user(s). Seeding test application for Opportunity: "${opportunity.title}" (${opportunity._id})...`);

    // 3. Upsert Application document for EVERY registered user
    let count = 0;
    let sampleApp = null;

    for (const u of users) {
      const appPayload = {
        status: 'saved',
        notes: 'Interested in this opportunity',
        applicationUrl: opportunity.applicationUrl || ''
      };

      const app = await Application.findOneAndUpdate(
        { user: u._id, opportunity: opportunity._id },
        { $set: appPayload },
        { upsert: true, new: true, runValidators: true }
      ).populate('opportunity', 'title company location type remote description requirements applicationUrl source postedAt');

      count++;
      sampleApp = app;
      console.log(`- Created/Updated test application for User: ${u.email} (${u._id})`);
    }

    console.log(`\n=== SUCCESS: Seeded ${count} application document(s) in MongoDB Atlas ===`);
    console.log('Sample Application Response:');
    console.log(JSON.stringify({
      success: true,
      message: 'Application saved successfully',
      application: sampleApp
    }, null, 2));

    await mongoose.disconnect();
    console.log('\nMongoDB connection closed safely.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test application:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedTestApplication();
