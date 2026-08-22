require('dotenv').config();

const mongoose = require('mongoose');

const {
  buildCandidateContext,
  generateCareerCopilotPlan
} = require('./src/services/careerCopilot.service');
const User = require('./src/models/User.model');

const MONGODB_URI = process.env.MONGODB_URI;

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('MongoDB connected');

    const user = await User.findOne({ email: 'test@agentscout.com' }) || await User.findOne();
    const USER_ID = user ? String(user._id) : '6a889914b91c4342af25408e';

    console.log(`\n--- BUILDING CANDIDATE CONTEXT FOR USER ${USER_ID} ---`);

    const context = await buildCandidateContext(USER_ID);

    console.log(JSON.stringify(context, null, 2));

    console.log('\n--- GENERATING CAREER COPILOT PLAN ---');

    const plan = await generateCareerCopilotPlan(USER_ID);

    console.log(JSON.stringify(plan, null, 2));

    console.log('\nPhase 15.1 test PASSED');

    process.exit(0);
  } catch (error) {
    console.error('\nPhase 15.1 test FAILED');
    console.error(error);

    process.exit(1);
  }
};

run();
