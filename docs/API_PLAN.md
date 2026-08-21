# AgentScout AI — API Design & Route Plan

> **Note:** This document outlines the planned API endpoints for AgentScout AI. These endpoints represent future implementation contracts and are **not** implemented in Phase 0.

---

## Base URL
`http://localhost:5000/api` (Development)

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
- **Description:** Register a new user account (job seeker or admin).
- **Access:** Public
- **Request Body:** `{ name, email, password, role }`
- **Response:** `{ success: true, message: "User registered successfully", user: { id, name, email, role } }`

### `POST /api/auth/login`
- **Description:** Authenticate user credentials and issue HTTP-only JWT cookie.
- **Access:** Public
- **Request Body:** `{ email, password }`
- **Response:** `{ success: true, user: { id, name, email, role } }`

### `POST /api/auth/logout`
- **Description:** Clear authentication cookie and invalidate session.
- **Access:** Authenticated User
- **Response:** `{ success: true, message: "Logged out successfully" }`

### `GET /api/auth/me`
- **Description:** Retrieve current authenticated session user profile.
- **Access:** Authenticated User
- **Response:** `{ success: true, user: { id, name, email, role, profile } }`

---

## 2. User Profile & Saved Opportunities Endpoints

### `GET /api/users/profile`
- **Description:** Get full user profile including skills, experience, and search preferences.
- **Access:** Authenticated User
- **Response:** `{ success: true, profile: Object }`

### `PUT /api/users/profile`
- **Description:** Update user profile skills, bio, location, and desired roles.
- **Access:** Authenticated User
- **Request Body:** `{ headline, bio, location, skills, experience, preferences }`
- **Response:** `{ success: true, profile: Object }`

### `GET /api/users/saved`
- **Description:** Retrieve all bookmarked opportunities for the current user.
- **Access:** Authenticated User
- **Response:** `{ success: true, savedOpportunities: Array }`

### `POST /api/users/saved/:opportunityId`
- **Description:** Save an opportunity to user's saved list.
- **Access:** Authenticated User
- **Response:** `{ success: true, message: "Opportunity saved" }`

### `DELETE /api/users/saved/:opportunityId`
- **Description:** Remove an opportunity from user's saved list.
- **Access:** Authenticated User
- **Response:** `{ success: true, message: "Opportunity removed" }`

---

## 3. Opportunities Endpoints

### `GET /api/opportunities`
- **Description:** Fetch paginated list of job and internship opportunities with filter support.
- **Access:** Public / Authenticated User
- **Query Params:** `?page=1&limit=10&type=job&remote=true&search=developer`
- **Response:** `{ success: true, total: Number, page: Number, opportunities: Array }`

### `GET /api/opportunities/:id`
- **Description:** Fetch detailed metadata for a single opportunity.
- **Access:** Public / Authenticated User
- **Response:** `{ success: true, opportunity: Object }`

---

## 4. AI Endpoints

### `POST /api/ai/match`
- **Description:** Trigger Gemini AI engine to calculate match scores between candidate profile and active opportunities.
- **Access:** Authenticated User
- **Request Body:** `{ profileId, opportunityIds? }`
- **Response:** `{ success: true, matches: [ { opportunityId, score: Number, rationale: String, suggestions: Array } ] }`

---

## 5. Scraper Endpoints

### `POST /api/scraper/run`
- **Description:** Trigger Bright Data Scraper Studio execution for target platforms.
- **Access:** Admin
- **Request Body:** `{ targetUrl, query, limit }`
- **Response:** `{ success: true, runId: String, status: "pending" }`

### `GET /api/scraper/status`
- **Description:** Check execution status of active or recent scrape jobs.
- **Access:** Admin
- **Response:** `{ success: true, activeJobs: Array }`

### `GET /api/scraper/history`
- **Description:** Retrieve historical scrape execution logs.
- **Access:** Admin
- **Response:** `{ success: true, history: Array }`

---

## 6. Admin Endpoints

### `GET /api/admin/users`
- **Description:** Get registered users list for administration.
- **Access:** Admin
- **Response:** `{ success: true, count: Number, users: Array }`

### `GET /api/admin/opportunities`
- **Description:** Get complete listing of indexed opportunities for management.
- **Access:** Admin
- **Response:** `{ success: true, count: Number, opportunities: Array }`

### `DELETE /api/admin/opportunities/:id`
- **Description:** Delete or archive an invalid opportunity.
- **Access:** Admin
- **Response:** `{ success: true, message: "Opportunity deleted" }`

### `GET /api/admin/analytics`
- **Description:** Retrieve system operational metrics (total users, opportunities indexed, total AI matches generated, scraper activity).
- **Access:** Admin
- **Response:** `{ success: true, analytics: Object }`

---

## 7. Health Check Endpoint

### `GET /api/health`
- **Description:** Service health check to verify backend operational readiness.
- **Access:** Public
- **Response:** `{ status: "ok", timestamp: String, uptime: Number }`
