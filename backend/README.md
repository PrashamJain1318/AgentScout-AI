# AgentScout AI — Backend Service

Backend RESTful API foundation built with Node.js, Express.js, and MongoDB Atlas for the AgentScout AI platform.

---

## 1. Backend Purpose

This backend service acts as the central API handler for AgentScout AI. It provides a secure, rate-limited, and CORS-enabled HTTP environment integrated with **MongoDB Atlas** via Mongoose, configured for future phases (Authentication, Bright Data Scraper Studio, and Google Gemini AI).

---

## 2. Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Security:** Helmet, CORS, Express Rate Limit
- **Middleware:** Cookie Parser, Morgan (logging), Express JSON/Urlencoded body parsers
- **Environment Management:** dotenv
- **Development Tooling:** Nodemon

---

## 3. Directory Structure

```
backend/
├── src/
│   ├── config/          # DB connection & environment configuration
│   ├── controllers/     # API route controllers
│   ├── middleware/      # Rate limiting, 404, and centralized error handling
│   ├── models/          # Mongoose database models (Phase 5+)
│   ├── routes/          # Express API route handlers
│   ├── services/        # External services & business logic (Phase 7+)
│   ├── utils/           # Helper utilities
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
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://archanagokhru0_db_user:<db_password>@agentscoutcluster.wc25piu.mongodb.net/agentscout?retryWrites=true&w=majority&appName=AgentScoutCluster
```

> **Note:** Replace `<db_password>` with your actual MongoDB Atlas database password in your local `.env` file. Do not commit `.env` to git.

---

## 5. Installation

Navigate to the `backend/` directory and install dependencies:

```bash
cd backend
npm install
```

---

## 6. Running the Backend

### Development Mode (with hot-reload via Nodemon):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Default development server runs on: `http://localhost:5000`

---

## 7. Health Endpoint

### `GET /api/health`
Verifies backend operational status and MongoDB Atlas connection state.

**Sample Request:**
```bash
curl http://localhost:5000/api/health
```

**Sample Response:**
```json
{
  "success": true,
  "message": "AgentScout API is running",
  "environment": "development",
  "database": {
    "status": "connected",
    "readyState": 1
  }
}
```
