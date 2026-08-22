require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Opportunity = require('../src/models/Opportunity.model');
const Match = require('../src/models/Match.model');

/**
 * Development-only test seed script for Phase 8 Match verification.
 * Seeds test matches for ALL registered users in MongoDB Atlas.
 */
const seedTestMatch = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Error: MONGODB_URI environment variable is not defined.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    // 1. Fetch ALL candidate users from MongoDB
    const users = await User.find();

    if (!users || users.length === 0) {
      console.error('Error: No users found in MongoDB. Please register a user first.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // 2. Fetch an existing active opportunity from MongoDB
    let opportunity = await Opportunity.findOne({ isActive: true });
    if (!opportunity) {
      opportunity = await Opportunity.findOne();
    }

    if (!opportunity) {
      console.error('Error: No existing opportunity found in MongoDB. Please run the scraper first.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`Found ${users.length} user(s). Seeding test match for Opportunity: "${opportunity.title}" (${opportunity._id})...`);

    // 3. Upsert Match record for EVERY registered user
    let count = 0;
    for (const u of users) {
      const matchPayload = {
        user: u._id,
        opportunity: opportunity._id,
        score: 85,
        matchLevel: 'excellent',
        matchedSkills: ['React', 'Node.js', 'MongoDB'],
        missingSkills: ['Python'],
        reasons: [
          'Strong technical skill match',
          'Relevant internship opportunity'
        ],
        recommendation: 'Strongly recommended',
        status: 'generated'
      };

      await Match.findOneAndUpdate(
        { user: u._id, opportunity: opportunity._id },
        { $set: matchPayload },
        { upsert: true, new: true, runValidators: true }
      );
      count++;
      console.log(`- Created/Updated test match for User: ${u.email} (${u._id})`);
    }

    console.log(`\n=== SUCCESS: Seeded ${count} match document(s) in MongoDB Atlas ===`);
    await mongoose.disconnect();
    console.log('MongoDB connection closed safely.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test match:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedTestMatch();
