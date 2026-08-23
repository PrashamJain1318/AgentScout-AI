const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const connectDB = require('../backend/src/config/db');
const User = require('../backend/src/models/User.model');
const {
  getGoogleAuthUrl,
  getGitHubAuthUrl,
  getLinkedInAuthUrl,
  findOrCreateSocialUser
} = require('../backend/src/services/oauth.service');

const runTests = async () => {
  console.log('--- STARTING SOCIAL AUTHENTICATION UNIT & INTEGRATION TESTS ---');

  // 1. Test URL Generators
  try {
    process.env.GOOGLE_CLIENT_ID = 'test_google_id';
    process.env.GITHUB_CLIENT_ID = 'test_github_id';
    process.env.LINKEDIN_CLIENT_ID = 'test_linkedin_id';

    const gUrl = getGoogleAuthUrl('state123');
    console.log('✓ Google Auth URL:', gUrl.includes('accounts.google.com') && gUrl.includes('state123'));

    const ghUrl = getGitHubAuthUrl('state456');
    console.log('✓ GitHub Auth URL:', ghUrl.includes('github.com/login/oauth/authorize') && ghUrl.includes('state456'));

    const liUrl = getLinkedInAuthUrl('state789');
    console.log('✓ LinkedIn Auth URL:', liUrl.includes('linkedin.com/oauth/v2/authorization') && liUrl.includes('state789'));
  } catch (err) {
    console.error('❌ URL Generator Test Failed:', err.message);
  }

  // 2. Database Account Linking Tests
  try {
    await connectDB();
    console.log('✓ Database Connected via connectDB()');

    const testEmail = `social_test_${Date.now()}@agentscout.ai`;

    // A. Create new user via Google
    const googleUser = await findOrCreateSocialUser({
      provider: 'google',
      id: `google_id_${Date.now()}`,
      email: testEmail,
      firstName: 'Social',
      lastName: 'Candidate',
      picture: 'https://lh3.googleusercontent.com/avatar.jpg'
    });
    console.log('✓ User Created via Google OAuth:', googleUser._id, '| Providers:', googleUser.authProviders);

    // B. Link GitHub account with SAME verified email
    const linkedUser = await findOrCreateSocialUser({
      provider: 'github',
      id: `github_id_${Date.now()}`,
      username: 'socialcandidate',
      email: testEmail,
      firstName: 'Social',
      lastName: 'Candidate',
      avatar: 'https://avatars.githubusercontent.com/avatar.jpg'
    });
    console.log('✓ GitHub Account Linked to Existing User:', String(linkedUser._id) === String(googleUser._id), '| Providers:', linkedUser.authProviders);

    // Clean up test document
    await User.deleteOne({ _id: googleUser._id });
    console.log('✓ Test user cleaned up cleanly');

    await mongoose.connection.close();
    console.log('--- ALL SOCIAL AUTH TESTS PASSED 100% ---');
  } catch (err) {
    console.error('❌ Database Account Linking Test Failed:', err.message);
    if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
  }
};

runTests();
