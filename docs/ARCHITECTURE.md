# AgentScout AI — System Architecture

**Tagline:** "Discover opportunities. Let AI find your match."  
**Hackathon:** Scrape-Verse Hackathon  

---

## 1. Project Overview

AgentScout AI is a full-stack, AI-powered opportunity discovery platform engineered to connect students, fresh graduates, and professionals with curated jobs, internships, and research roles.

The system automates the ingestion of publicly available web data using **Bright Data Scraper Studio**, normalizes and validates the incoming payloads via a **Node.js/Express** backend, persists structured entities in **MongoDB Atlas**, and leverages **Google Gemini AI** to compute similarity matches based on user skill vectors, experience, and preference profiles.

---

## 2. Frontend Architecture

The frontend application is built as a responsive Single Page Application (SPA) using React and Vite, delivering an immersive 3D/2D visual UI.

### Key Components & Libraries
- **Core Framework:** React 18+ with Vite for ultra-fast bundling and HMR.
- **Routing:** React Router v6 managing client-side navigation (Public, Auth, User Dashboard, Admin Dashboard).
- **Styling:** Vanilla CSS design system coupled with Tailwind CSS for utility layout structure.
- **Animations:** Framer Motion for UI state transitions and micro-interactions.
- **3D Graphics:** Three.js, React Three Fiber (`@react-three/fiber`), and `@react-three/drei` for interactive background visualizers.
- **Icons:** Lucide React for consistent UI iconography.
- **API Client:** Axios instance configured with `withCredentials: true` for HTTP-only cookie handling.

### Frontend Module Structure (Planned)
```
frontend/
├── src/
│   ├── assets/         # Static visual assets & 3D models
│   ├── components/     # Reusable UI elements (Navbar, Cards, Modals, Buttons)
│   ├── context/        # React Context (AuthContext, ThemeContext)
│   ├── hooks/          # Custom hooks (useAuth, useOpportunities, useMatch)
│   ├── pages/          # Route views (Landing, Login, Register, Dashboard, Profile, Admin)
│   ├── services/       # Axios API integration endpoints
│   ├── utils/          # Formatting and validation helpers
│   ├── App.jsx         # Root router component
│   └── main.jsx        # App entry point
```

---

## 3. Backend Architecture

The backend is built as a RESTful web service using Node.js and Express.js, enforcing modularity through a Controller-Service-Repository architectural pattern.

### Key Components & Libraries
- **Runtime:** Node.js (v18+)
- **Server Framework:** Express.js
- **Database Modeling:** Mongoose ODM connecting to MongoDB Atlas.
- **Authentication:** JWT (JSON Web Tokens) issued in HTTP-only, SameSite cookies; password hashing via `bcryptjs`.
- **Integrations:**
  - **Bright Data Scraper Studio:** Webhooks / API triggers for automated scraping workflows.
  - **Gemini API:** SDK integration for embeddings, match calculation, and resume synthesis.

### Backend Module Structure (Planned)
```
backend/
├── src/
│   ├── config/         # DB connection, env verification, external client configs
│   ├── controllers/    # Request/Response handlers
│   ├── middleware/     # Auth verification, error handling, rate limiting, validation
│   ├── models/         # Mongoose Schemas (User, Opportunity, ScraperLog, MatchResult)
│   ├── routes/         # Express API route declarations
│   ├── services/       # Business logic (Gemini API, Bright Data integration, Matching algorithm)
│   ├── utils/          # Token helpers, response formatters, logger
│   └── app.js          # Express app instance and server listener
```

---

## 4. Database Architecture

The application uses **MongoDB Atlas** for document-based relational flexibility and scalability.

### Schemas Overview
1. **User Schema (`users`)**
   - Credentials (name, email, hashedPassword, role: `user` | `admin`)
   - Profile (headline, location, biography, skills: `[String]`, experience: `[Object]`, education: `[Object]`)
   - Preferences (desiredRoles, preferredLocations, remotePreference)
   - Saved Opportunities (`[ObjectId]` references)

2. **Opportunity Schema (`opportunities`)**
   - Metadata (title, company, location, type: `job` | `internship` | `research`, remote: `Boolean`)
   - Details (description, requirements: `[String]`, salaryRange, applicationUrl)
   - Source Info (sourceUrl, Bright Data job ID, scrapedAt)
   - Embeddings / Keywords for vector similarity indexing.

3. **Scraper Log Schema (`scraper_logs`)**
   - Execution details (runId, triggeredBy, status: `pending` | `completed` | `failed`, itemsScraped, startedAt, completedAt, errorDetails)

---

## 5. Authentication Architecture

Authentication is strictly secured using JWT tokens stored inside HTTP-Only, Secure, SameSite cookies to protect against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).

### Authentication Flow
```
REGISTER / LOGIN
      ↓
EXPRESS BACKEND
      ↓
BCRYPT PASSWORD HASHING
      ↓
JWT
      ↓
HTTP-ONLY COOKIE
      ↓
AUTHENTICATED USER
```

---

## 6. Bright Data Scraping Architecture

Scrape-Verse Hackathon integration utilizes **Bright Data Scraper Studio** to harvest live opportunity data from public career boards.

### Scraping Flow
```
PUBLIC WEB DATA
      ↓
BRIGHT DATA SCRAPER STUDIO
      ↓
STRUCTURED JSON
      ↓
BACKEND API
      ↓
VALIDATION + NORMALIZATION
      ↓
MONGODB ATLAS
      ↓
AI MATCHING
      ↓
USER DASHBOARD
```

---

## 7. AI Matching Architecture

The recommendation engine leverages Google Gemini API to analyze candidate profiles against raw job descriptions.

### Matching Steps
1. **Feature Extraction:** Transform raw user profile (skills, experience, preferences) into a normalized candidate summary.
2. **Contextual Evaluation:** Send structured candidate parameters alongside candidate opportunity specifications to Gemini.
3. **Scoring & Rationale:** Gemini computes a composite match percentage (0–100%) and generates actionable recommendations (e.g., "Highlight your Node.js experience to boost match rate").

---

## 8. User Dashboard Architecture

The User Dashboard provides an interactive workspace for job seekers.

### Key Capabilities
- **Match Feed:** Ranked opportunities with real-time match scores.
- **Profile Manager:** Interactive form to adjust skills, uploaded resume insights, and search preferences.
- **Saved Vault:** Quick access to bookmarked opportunities.
- **Direct Application Links:** Verified external redirect URLs to original application portals.

---

## 9. Admin Dashboard Architecture

The Admin Dashboard is reserved for authorized platform operators.

### Admin Flow
```
ADMIN LOGIN
      ↓
ADMIN AUTHORIZATION
      ↓
ADMIN DASHBOARD
      ↓
USERS / OPPORTUNITIES / SCRAPER / ANALYTICS
```

---

## 10. Deployment Architecture

- **Frontend:** Host on Vercel or Netlify with continuous deployment from GitHub.
- **Backend:** Host on Render, Railway, or Fly.io with Node.js environment.
- **Database:** Cloud MongoDB Atlas cluster (M0 or dedicated instance).
- **SSL / CORS:** HTTPS enforced across client and server with explicit CORS whitelist settings.

---

## 11. Security Architecture

1. **Secrets Management:** Environment variables (`.env`) for DB credentials, JWT secrets, and API keys. Strict `.gitignore` policy.
2. **Password Hashing:** `bcryptjs` with standard salt rounds (10+).
3. **Cookie Security:** `HttpOnly`, `Secure` (production), `SameSite=Lax/Strict`.
4. **Input Sanitization & Validation:** Express validation middleware checking payload types and preventing SQL/NoSQL injection.
5. **Rate Limiting:** IP-based rate limiting on sensitive auth and scraping endpoints.

---

## 12. Data Flow

```
+------------------+         +-------------------------------+         +---------------------+
| Public Web Data  | ------> |  Bright Data Scraper Studio   | ------> | Structured JSON     |
+------------------+         +-------------------------------+         +---------------------+
                                                                                  |
                                                                                  v
+------------------+         +-------------------------------+         +---------------------+
| User Dashboard   | <------ |  MongoDB Atlas + Gemini AI    | <------ | Express Backend API |
+------------------+         +-------------------------------+         +---------------------+
```
