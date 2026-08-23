# AgentScout AI — Social Authentication & OAuth Architecture Documentation

## 1. Overview

AgentScout AI supports production-grade Social Authentication alongside traditional Email/Password authentication.

### Supported OAuth Providers
1. **Google** (OAuth 2.0 / OpenID Connect)
2. **GitHub** (OAuth 2.0 with email fallback)
3. **LinkedIn** (OpenID Connect `userinfo` API)

---

## 2. Authentication Flow

```
Frontend (Login / Signup / Settings)
       ↓ Redirects to /api/auth/:provider
Backend Endpoint (Generates OAuth State CSRF token)
       ↓ Redirects to Provider Authorization URL
OAuth Provider (User grants permission)
       ↓ Redirects to /api/auth/:provider/callback
Backend Callback (Verifies code & state token)
       ↓ Exchanges code for User Profile
Find or Create AgentScout Candidate User
       ↓ Links social account to existing user by email
Issue HTTP-Only AgentScout JWT Cookie
       ↓ Redirects to /dashboard
Frontend Application (Authenticated Session)
```

---

## 3. Account Linking & Security Engine

1. **Email / Provider ID Matching:**
   - When a user logs in via a social provider, AgentScout first searches for an existing user matching the social provider ID (`socialAccounts.<provider>.id`).
   - If not found, AgentScout searches by verified email address. If an existing user is found with that email, AgentScout attaches the social provider to the existing candidate profile without creating a duplicate user.
2. **CSRF State Validation:**
   - Initiating an OAuth redirect generates a cryptographically secure random state token stored in a short-lived HTTP-only cookie (`oauth_state`).
   - Callbacks verify `state` query parameters against `oauth_state` cookie.
3. **Orphan Account Protection:**
   - In Settings → Connected Accounts, users can connect or disconnect social accounts.
   - Users cannot disconnect their only authentication method if no password or alternative social login is attached.

---

## 4. API Endpoints

### Public OAuth Routes
- `GET /api/auth/google` — Initiates Google OAuth redirect.
- `GET /api/auth/google/callback` — Handles Google OAuth callback & sets JWT cookie.
- `GET /api/auth/github` — Initiates GitHub OAuth redirect.
- `GET /api/auth/github/callback` — Handles GitHub OAuth callback & sets JWT cookie.
- `GET /api/auth/linkedin` — Initiates LinkedIn OAuth redirect.
- `GET /api/auth/linkedin/callback` — Handles LinkedIn OAuth callback & sets JWT cookie.

### Authenticated Routes (`protect` Middleware)
- `GET /api/auth/me` — Returns current candidate profile & connected provider information.
- `POST /api/auth/logout` — Clears JWT authentication cookie.
- `GET /api/auth/connected-accounts` — Returns list of connected social providers.
- `POST /api/auth/disconnect/:provider` — Safely unlinks a social provider.

---

## 5. Environment Variables Configuration

Set the following variables in `backend/.env` (Local) and Vercel Environment Variables (Production):

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5001/api/auth/github/callback

# LinkedIn OAuth 2.0 (OpenID Connect)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:5001/api/auth/linkedin/callback

# Production Redirects
CLIENT_URL=https://agentscout-ai-cyan.vercel.app
```

---

## 6. Provider Setup Instructions

### A. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create OAuth 2.0 Client Credentials (Web Application).
3. Authorized Redirect URIs:
   - Development: `http://localhost:5001/api/auth/google/callback`
   - Production: `https://agentscout-ai-cyan.vercel.app/api/auth/google/callback`

### B. GitHub OAuth Setup
1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers).
2. Register a new OAuth Application.
3. Authorization Callback URL:
   - Development: `http://localhost:5001/api/auth/github/callback`
   - Production: `https://agentscout-ai-cyan.vercel.app/api/auth/github/callback`

### C. LinkedIn OAuth Setup
1. Go to [LinkedIn Developers Portal](https://www.linkedin.com/developers/).
2. Create an App & request **Sign In with LinkedIn using OpenID Connect**.
3. Authorized Redirect URLs:
   - Development: `http://localhost:5001/api/auth/linkedin/callback`
   - Production: `https://agentscout-ai-cyan.vercel.app/api/auth/linkedin/callback`
