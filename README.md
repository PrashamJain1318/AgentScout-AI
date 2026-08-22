# AgentScout AI

> **"Your AI Career Operating System & Intelligent Job Search Agent"**

---

## Executive Overview

**AgentScout AI** is a production-grade, full-stack AI Career Operating System built using the MERN stack (MongoDB Atlas, Express.js, React, Node.js) integrated with **Google Gemini AI** and **Bright Data Scraper Studio**.

AgentScout transforms job searching from manual browsing into an autonomous, decision-oriented command center. It continuously monitors market opportunities, ranks jobs by candidate fit, computes application readiness, detects career blockers, conducts interactive mock technical interviews, generates tailored application materials, and provides a 7-day adaptive career execution plan.

---

## Core Capabilities & Implemented Modules

### 🧠 AI Career Operating System (Phase 17.0)
- **Composite Career Health Score (0–100):** Weighted benchmark combining Profile, Resume ATS Quality, Opportunity Fit, Application Pipeline, Interview Readiness, Skill Coverage, and Portfolio Strength.
- **Career Stage Detection:** Classifies candidate trajectory into 8 stages (`PROFILE_BUILDING`, `RESUME_OPTIMIZATION`, `JOB_DISCOVERY`, `APPLICATION_READY`, `ACTIVE_APPLICATION`, `INTERVIEW_PREPARATION`, `OFFER_READY`, `CAREER_ACCELERATION`).
- **Single Highest-Impact Next Action:** Identifies the single most impactful action candidate should take right now.
- **Career Risk Engine:** Detects 10 distinct career blockers (low application conversion, incomplete profile, ATS below target, unsubmitted excellent matches) with severity ratings and deep links.
- **Career Momentum:** Calculates activity velocity (0–100 score with `UP`, `STABLE`, `DOWN` trends).

### 🛰️ AI Opportunity Monitor & Job Search Agent (Phase 16.15)
- **Continuous Opportunity Evaluation:** Ranks new market postings against profile, resume, skill gaps, and interview readiness.
- **Alert Prioritization & Duplicate Protection:** High-priority notifications for 90%+ Excellent Matches and 75%+ Strong Matches without repeated spamming.
- **Opportunity Watchlist & Digest:** Daily market scan summaries and saved opportunity tracking.

### 🎯 AI Career Action Planner (Phase 16.14)
- **Deterministic Action Engine:** Daily priority list, priority buckets, and 7-day execution schedule.
- **Milestones Tracker:** Interactive progress tracking for Profile 100%, Resume ATS > 80%, 5+ Applications, and Interview Readiness > 80%.

### 🎤 AI Interview Coach & Mock Interview Intelligence (Phase 16.13)
- **Interactive Technical & STAR Behavioral Mock Sessions:** Role-specific question sets.
- **Readiness Scoring & Feedback:** Immediate AI evaluation of technical depth, communication clarity, problem-solving, and STAR methodology.

### ✍️ AI Application Assistant & Application Readiness (Phase 16.12)
- **Application Readiness Scoring:** Measures match score, resume alignment, skill coverage, and experience fit.
- **Tailored Cover Letters & Application Answers:** Role-specific cover letter generator and customized answer suggestions.

### 📄 Candidate Resume & Portfolio Intelligence (Phase 16.11)
- **AgentScout ATS Scoring Engine:** Structural analysis, quantifiable achievement auditing, and skill coverage breakdown.
- **Portfolio & Project Evidence:** GitHub and live portfolio link integration.

### ⚙️ Settings, Preferences & Security (Phase 16.10)
- **Account & Job Preferences:** Target roles, preferred locations, work modes, and minimum salary.
- **Notification & Privacy Control:** Toggle alert rules and discovery settings.
- **Security & Session Management:** Password updating with current password verification and complete account deletion.

### 📊 Career Analytics & Progress Intelligence (Phase 16.9)
- **Funnel & Match Analytics:** Application status distribution, response conversion rates, match distribution, and downloadable CSV report exports.

### 🔔 Notifications & Activity Center (Phase 16.8)
- **Real-Time Notification Hub:** Unread indicators, category filtering, mark as read/unread, and deep-link navigation.

### 🤖 Career Copilot (Phase 16.7)
- **Context-Aware Career Chat:** Multi-turn conversational AI powered by Google Gemini AI with fallback data-driven intelligence.

---

## Technology Stack

### Frontend
- **Framework:** React 18, Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios (with `withCredentials: true`)
- **Icons:** Lucide React
- **Styling:** Custom CSS design system (Dark/Purple glassmorphism architecture)

### Backend
- **Runtime:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose ODM
- **Authentication:** JWT, bcryptjs, HTTP-only SameSite cookies
- **AI Integration:** Google Gemini API
- **Scraper Engine:** Bright Data Scraper Studio

---

## Project Structure

```
AgentScout-AI/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Gemini & Bright Data configs
│   │   ├── controllers/     # Express route handlers
│   │   ├── middleware/      # Authentication & authorization middleware
│   │   ├── models/          # Mongoose database schemas
│   │   ├── routes/          # Express API route declarations
│   │   └── services/        # AI engines, match scoring & core business logic
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components by domain (career-os, opportunity-monitor, etc.)
│   │   ├── context/         # AuthContext provider
│   │   ├── pages/           # Main workspace pages
│   │   ├── services/        # Axios API client modules
│   │   └── utils/           # URL validation and formatting helpers
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Local Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas database instance or local MongoDB server

### Installation Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/PrashamJain1318/AgentScout-AI.git
   cd AgentScout-AI
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MONGODB_URI, JWT_SECRET, and GEMINI_API_KEY
   npm start
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Access Platform:**
   Open `http://localhost:5173` in your browser.

---

## Production Build

To verify production frontend build:
```bash
cd frontend
npm run build
```

---

## Security & Privacy
- Sensitive credentials must be stored strictly in `.env` files (excluded from Git tracking via `.gitignore`).
- Identity and authorization are enforced exclusively via server-side HTTP-only cookie JWTs (`req.user.id`).
- External application URLs undergo protocol and hostname validation prior to client navigation.
