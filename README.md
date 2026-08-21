# AgentScout AI

> **"Discover opportunities. Let AI find your match."**

Developed for the **Scrape-Verse Hackathon**.

---

## Project Overview

AgentScout AI is an end-to-end, AI-powered opportunity discovery platform engineered to automate how job seekers, interns, and researchers find relevant roles. By pairing **Bright Data Scraper Studio** with **Google Gemini AI**, AgentScout AI continuously discovers web opportunities, converts unorganized HTML data into validated JSON records in **MongoDB Atlas**, and evaluates candidates using semantic match scoring.

---

## Problem

Job seekers face fragmentation across dozens of hiring portals, company career pages, and research boards. Manual search requires hours of filtering through irrelevant listings, parsing vague job descriptions, and manually evaluating skill overlap. Existing job alerts rely on rigid keyword queries rather than contextual understanding.

---

## Solution

AgentScout AI eliminates manual job hunting through automated web scraping and intelligent context-matching:
1. **Automated Opportunity Ingestion:** Custom scrapers built via Bright Data harvest public opportunity data reliably without IP blocking or bot detection failures.
2. **Normalized Data Repository:** Public web listings are converted into clean, validated schema records in MongoDB Atlas.
3. **Contextual AI Recommendation:** Google Gemini AI analyzes candidate profiles (skills, experience, location) against role requirements to produce personalized match scores and improvement recommendations.

---

## Core Features

- **Automated Web Scraping:** Scheduled and on-demand scraping via Bright Data Scraper Studio.
- **AI-Powered Match Engine:** Gemini AI computes candidate-role fit percentages and actionable suggestions.
- **Interactive 3D Landing Page:** Immersive hero visualizer built with React Three Fiber, Drei, and Three.js.
- **Candidate Workspace:** Personal dashboard to manage skills, track match ratings, and save target roles.
- **Admin Control Panel:** Operations hub to trigger scraper runs, manage opportunity listings, inspect system analytics, and audit users.
- **Secure Session Management:** Password hashing with `bcryptjs` and HTTP-only JWT cookies.

---

## Technology Stack

### Frontend
- **Framework:** React, Vite, JavaScript
- **Styling:** Tailwind CSS, Custom CSS variables
- **Routing:** React Router v6
- **State & HTTP:** Axios
- **Animations & 3D:** Framer Motion, Three.js, React Three Fiber, Drei
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose ODM
- **Security & Auth:** JWT, bcryptjs, HTTP-only cookies
- **AI Engine:** Google Gemini API
- **Scraper Engine:** Bright Data Scraper Studio

---

## Architecture

The system uses a decoupled client-server architecture with an external scraping and AI analysis pipeline:

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

For full details, see [docs/ARCHITECTURE.md](file:///Users/prashamjain/Desktop/PROJECTS/AgentScout-AI/docs/ARCHITECTURE.md).

---

## Bright Data Integration

AgentScout AI utilizes **Bright Data Scraper Studio** as its primary ingestion engine. Scrapers target public career platforms to extract raw listings, transforming unstructured text into structured payloads containing job title, company name, location, role type, raw requirements, and original application URLs. The backend validates these payloads prior to database persistence.

---

## AI Matching

Matching goes beyond basic keyphrase lookup. The **Google Gemini API** processes candidate profile attributes alongside parsed opportunity requirements to perform semantic evaluation. The output includes:
- Overall Compatibility Score (0–100%)
- Core Skill Alignment Matrix
- Profile Optimization Recommendations

---

## Authentication

Authentication is backed by JWT credentials stored in `HttpOnly`, `SameSite` cookies for security:

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

## User Dashboard

The candidate interface includes:
- **Opportunity Feed:** Dynamic stream of jobs/internships sorted by AI match confidence.
- **Profile Configuration:** Input skills, location preferences, and career goals.
- **Saved Opportunities:** Bookmarked list of target roles with quick external application links.

---

## Admin Dashboard

The platform admin panel provides management capabilities:
- **Scraper Control:** Trigger new Bright Data scraping workflows and inspect run status logs.
- **Opportunity Management:** Review, approve, or remove indexed roles.
- **User Administration:** View registered candidate profiles and system statistics.
- **Platform Analytics:** Real-time metrics on scrapers, AI match requests, and user activity.

---

## Development Roadmap

- **Phase 0 — Foundation** *(Current)*
- **Phase 1 — Backend Foundation**
- **Phase 2 — MongoDB Atlas**
- **Phase 3 — Authentication**
- **Phase 4 — User Profile**
- **Phase 5 — Opportunity Model**
- **Phase 6 — Opportunity APIs**
- **Phase 7 — Bright Data Scraper**
- **Phase 8 — AI Matching**
- **Phase 9 — Saved Opportunities**
- **Phase 10 — Frontend Foundation**
- **Phase 11 — Frontend Authentication**
- **Phase 12 — Landing Page**
- **Phase 13 — Opportunities UI**
- **Phase 14 — User Dashboard**
- **Phase 15 — User Profile UI**
- **Phase 16 — AI Matching UI**
- **Phase 17 — Admin Backend**
- **Phase 18 — Admin Dashboard**
- **Phase 19 — Three.js Experience**
- **Phase 20 — Full Integration**
- **Phase 21 — Security Audit**
- **Phase 22 — Analytics**
- **Phase 23 — QA**
- **Phase 24 — Deployment**
- **Phase 25 — Hackathon Documentation**
- **Phase 26 — Demo Preparation**
- **Phase 27 — Final Submission**

---

## Security

- Secrets stored strictly in local `.env` files (excluded from source control via `.gitignore`).
- Password hashing utilizing `bcryptjs`.
- Session tokens passed strictly via `HttpOnly` and `SameSite` cookie flags.
- Comprehensive request validation and rate limiting on sensitive routes.

---

## Local Development

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Setup (Future Phases)
```bash
# Clone the repository
git clone https://github.com/user/AgentScout-AI.git
cd AgentScout-AI

# Install dependencies (Phase 1+)
# setup commands will be provided in subsequent phases
```
