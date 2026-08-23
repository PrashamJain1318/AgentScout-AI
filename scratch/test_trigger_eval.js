const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const connectDB = require('../backend/src/config/db');
const User = require('../backend/src/models/User.model');
const { evaluateEventTrigger } = require('../backend/src/services/careerAgentTrigger.service');

async function debugTrigger() {
  await connectDB();
  const user = await User.findOne({});
  if (!user) {
    console.log('No user found in DB');
    process.exit(0);
  }

  console.log('Testing evaluateEventTrigger for user:', user._id);
  try {
    const res = await evaluateEventTrigger(user._id, 'SCHEDULED_REVIEW');
    console.log('RESULT:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('ERROR IN EVALUATE TRIGGER:', err);
  } finally {
    await mongoose.disconnect();
  }
}

debugTrigger();
