# AgentScout AI — Backend Service

Backend RESTful API service built with Node.js, Express.js, MongoDB Atlas, and JWT Authentication for the AgentScout AI platform.

---

## 1. Backend Purpose

This backend service acts as the central API handler for AgentScout AI. It provides a secure, rate-limited, and CORS-enabled HTTP environment integrated with **MongoDB Atlas** via Mongoose, featuring **JWT Authentication** in HTTP-only cookies, role-based authorization (`user` vs `admin`), and protected Candidate User Profile management.

---

## 2. Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication & Security:** JWT (JSON Web Tokens), bcryptjs, HTTP-only cookies, Helmet, CORS, Express Rate Limit
- **Middleware:** Cookie Parser, Morgan (logging), Express JSON/Urlencoded body parsers
- **Environment Management:** dotenv
- **Development Tooling:** Nodemon

---

## 3. Directory Structure

```
backend/
├── src/
│   ├── config/          # DB connection & environment configuration
│   ├── controllers/     # API route controllers (health, auth, user)
│   ├── middleware/      # Auth verification, role authorization, rate limiting, 404, error handling
│   ├── models/          # Mongoose database models (User)
│   ├── routes/          # Express API route handlers (health, auth, user)
│   ├── services/        # External services & business logic (Phase 7+)
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
```

---

## 5. User & Authentication Endpoints

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` — Register a candidate user account.
- `POST /api/auth/login` — Authenticate candidate credentials and issue HTTP-only cookie.
- `POST /api/auth/logout` — Invalidate session cookie.
- `GET /api/auth/me` — Retrieve current authenticated session profile.

### Protected User Routes (`/api/users`)
- `GET /api/users/profile` — Fetch current candidate profile. (Access: Private)
- `PUT /api/users/profile` — Update candidate profile details (headline, bio, skills, location, social links, experience, education, search preferences). (Access: Private)

---

## 6. System Health Endpoint

### `GET /api/health`
Verifies backend operational status and MongoDB Atlas connection state.

```json
{
  "success": true,
  "message": "AgentScout API is running",
  "environment": "development",
  "database": "connected"
}
```
