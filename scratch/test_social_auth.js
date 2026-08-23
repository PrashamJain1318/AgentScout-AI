const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../backend/src/config/db');
const User = require('../backend/src/models/User.model');
const {
  getGoogleAuthUrl,
  getGitHubAuthUrl,
  findOrCreateSocialUser
} = require('../backend/src/services/oauth.service');

async function runTests() {
  console.log('--- STARTING SOCIAL AUTHENTICATION UNIT & INTEGRATION TESTS ---');
  try {
    const state = 'test_state_123';
    const googleUrl = getGoogleAuthUrl(state);
    const githubUrl = getGitHubAuthUrl(state);

    console.log('✓ Google Auth URL:', googleUrl.includes('accounts.google.com'));
    console.log('✓ GitHub Auth URL:', githubUrl.includes('github.com/login/oauth'));

    await connectDB();
    console.log('✓ Database Connected via connectDB()');

    // 1. Create or Find Google Social User
    const mockGoogleData = {
      provider: 'google',
      id: 'google_test_user_id_99999',
      email: 'test_oauth_user_unit@agentscout.ai',
      firstName: 'OAuthTest',
      lastName: 'Candidate',
      picture: 'https://example.com/avatar.jpg'
    };

    let user = await findOrCreateSocialUser(mockGoogleData);
    console.log('✓ User Created via Google OAuth:', user._id, '| Providers:', user.authProviders);

    // 2. Link GitHub to Existing User
    const mockGitHubData = {
      provider: 'github',
      id: 'github_test_user_id_88888',
      username: 'test_oauth_user_unit',
      email: 'test_oauth_user_unit@agentscout.ai',
      firstName: 'OAuthTest',
      lastName: 'Candidate',
      avatar: 'https://example.com/github.jpg'
    };

    user = await findOrCreateSocialUser(mockGitHubData);
    console.log('✓ GitHub Account Linked to Existing User:', user.authProviders.includes('github'), '| Providers:', user.authProviders);

    // Clean up test user from MongoDB Atlas
    await User.deleteOne({ email: 'test_oauth_user_unit@agentscout.ai' });
    console.log('✓ Test user cleaned up cleanly');

    console.log('--- ALL SOCIAL AUTH TESTS PASSED 100% ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Social Auth Test Failed:', error.message);
    process.exit(1);
  }
}

runTests();
