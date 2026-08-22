# AgentScout AI — Backend Service

Backend RESTful API service built with Node.js, Express.js, MongoDB Atlas, and JWT Authentication for the AgentScout AI platform.

---

## 1. Backend Purpose

This backend service acts as the central API handler for AgentScout AI. It provides a secure, rate-limited, and CORS-enabled HTTP environment integrated with **MongoDB Atlas** via Mongoose, featuring **JWT Authentication** in HTTP-only cookies, candidate user profile management, opportunity browsing APIs, **Bright Data Scraper Studio Collector (DCA API)** data ingestion pipelines, **AI Matching Engine Core** & **Gemini Match Explanations**, **AI-Powered Opportunity Search**, **Personalized Opportunity Recommendations**, **Job/Internship Application Tracker**, **Application Dashboard Analytics Engine**, and **AI Career Copilot**.

---

## 2. Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **AI Engine:** Google Gemini (`gemini-2.5-flash`)
- **Scraper Engine:** Bright Data Scraper Studio Collector (DCA API)
- **Authentication & Security:** JWT (JSON Web Tokens), bcryptjs, HTTP-only cookies, Helmet, CORS, Express Rate Limit
- **Middleware:** Cookie Parser, Morgan (logging), Express JSON/Urlencoded body parsers
- **Environment Management:** dotenv
- **Development Tooling:** Nodemon

---

## 3. Directory Structure

```
backend/
├── src/
│   ├── config/          # DB connection, Bright Data DCA & Gemini AI configuration
│   ├── controllers/     # API route controllers (health, auth, user, opportunity, scraper, matching, application, analytics, careerCopilot)
│   ├── middleware/      # Auth verification, role authorization, rate limiting, 404, error handling
│   ├── models/          # Mongoose database models (User, Opportunity, Match, Application)
│   ├── routes/          # Express API route handlers (health, auth, user, opportunity, scraper, matching, application, analytics, careerCopilot)
│   ├── services/        # Business logic services (Bright Data DCA, Opportunity Normalizer, Matching Engine, Match Explanation, AI Opportunity Search, Personalized Recommendations, Application Tracker, Analytics Engine, Career Copilot)
│   ├── utils/           # JWT generation & cookie helper utilities
│   └── server.js        # Express application entry point
├── .env.example         # Template for environment variables
├── .gitignore            # Git ignore definitions
├── package.json         # Node.js dependencies and scripts
└── README.md            # Backend documentation
```

---

## 4. Environment Variables

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/agentscout?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_DAYS=7

# Bright Data Integration (Scraper Studio Collector DCA API)
BRIGHT_DATA_API_KEY=
BRIGHT_DATA_COLLECTOR_ID=
BRIGHT_DATA_BASE_URL=https://api.brightdata.com

# Google Gemini AI Integration
GEMINI_API_KEY=
```

---

## 5. API Routes Overview

### Health Endpoint (`/api/health`)
- `GET /api/health` — Check backend and MongoDB Atlas connection status.

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` — Register a candidate user account.
- `POST /api/auth/login` — Authenticate candidate credentials and issue HTTP-only cookie.
- `POST /api/auth/logout` — Invalidate session cookie.
- `GET /api/auth/me` — Retrieve current authenticated session profile.

### User Profile Routes (`/api/users`)
- `GET /api/users/profile` — Fetch current candidate profile. (Access: Private)
- `PUT /api/users/profile` — Update candidate profile details. (Access: Private)

### Opportunity Routes (`/api/opportunities`)
- `GET /api/opportunities` — Fetch paginated, filtered, and searchable opportunities. (Access: Public)
- `GET /api/opportunities/search` — Keyword opportunity search. (Access: Public)
- `GET /api/opportunities/search/personalized` — Profile-tailored candidate opportunity search. (Access: Private)
- `GET /api/opportunities/recommended` — Fetch paginated, Match-score & preference-aligned opportunity recommendations. (Access: Private)
- `POST /api/opportunities/ai-search` — AI natural-language query interpretation & relevance-ranked opportunity search. (Access: Private)
- `GET /api/opportunities/:id` — Fetch detailed metadata for a single opportunity. (Access: Public)

### Application Tracker Routes (`/api/applications`)
- `POST /api/applications` — Save or track a candidate job/internship application. (Access: Private)
- `GET /api/applications` — Fetch candidate's tracked applications. (Access: Private)
- `GET /api/applications/:id` — Fetch single application tracking record by ID. (Access: Private)
- `PATCH /api/applications/:id` — Update application status, notes, or dates. (Access: Private)
- `DELETE /api/applications/:id` — Delete or withdraw application record. (Access: Private)

### Analytics Routes (`/api/analytics`)
- `GET /api/analytics/dashboard` — Retrieve application history metrics, success rates, status distribution, company/location breakdowns, timeline, and recent applications. (Access: Private)

### AI Career Copilot Routes (`/api/career-copilot`)
- `GET /api/career-copilot` — Generate a personalized AI career plan (strengths, skill gaps, recommended skills, project ideas, interview prep, weekly goals, next actions) using Google Gemini. (Access: Private)

### Scraper Execution Routes (`/api/scraper`)
- `GET /api/scraper/status` — Inspect execution readiness of Bright Data Scraper Studio Collector configuration. (Access: Private)
- `POST /api/scraper/run` — Trigger Bright Data Scraper Studio DCA Collector (`c_mt3dlzkw26pjmyjwjc`), poll collection results, and ingest normalized opportunities into MongoDB Atlas. (Access: Private)

### AI Matching System Routes (`/api/matches`)
- `POST /api/matches/generate` — Trigger automatic deterministic match evaluation against active opportunities. (Access: Private)
- `POST /api/matches/:id/explain` — Generate AI-powered match rationale using Google Gemini. (Access: Private)
- `POST /api/matches` — Create or update match recommendation document for an opportunity. (Access: Private)
- `GET /api/matches` — Retrieve candidate match recommendations. (Access: Private)
- `GET /api/matches/:id` — Fetch detailed match rationale and skill gap analysis for a single opportunity. (Access: Private)
- `DELETE /api/matches/:id` — Dismiss or clear a match recommendation. (Access: Private)
