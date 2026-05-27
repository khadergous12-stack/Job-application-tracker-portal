# 🎯 Job Application Tracker Portal

> A full-stack MERN web application to track your job applications, manage interview stages, and analyze your job search with charts and analytics.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?logo=jsonwebtokens)](https://jwt.io/)

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Folder Structure](#-folder-structure)
- [API Endpoints](#-api-endpoints)
- [How to Run](#-how-to-run)
- [Environment Variables](#-environment-variables)
- [GitHub Upload Steps](#-github-upload-steps)
- [Screenshots](#-screenshots)
- [Learning Outcomes](#-learning-outcomes)
- [Interview Q&A](#-interview-qa)

---

## 🚀 Project Overview

**Job Application Tracker Portal** is a complete full-stack web application that helps students and professionals organize their job search. Users can register, log in, add job applications, track status through stages (Saved → Applied → OA → Interview → Offer), and view analytics about their job search journey.

---

## 🔍 Problem Statement

Job seekers today apply to dozens of companies across multiple platforms (LinkedIn, Indeed, Naukri, company websites). Without a centralized system:
- Applications get forgotten
- Interview dates are missed
- It's hard to know which platforms work best
- There's no visibility into conversion rates

This portal solves all of that with one clean dashboard.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth | Secure register & login with JWT authentication |
| ➕ Add Applications | Capture company, role, location, URL, source, salary |
| 📊 Dashboard | Overview stats, pipeline visualization, recent activity |
| 🔄 Status Tracking | 7 stages: Saved, Applied, OA, Interview, Offer, Rejected, Withdrawn |
| 🔍 Search & Filter | Real-time search + filter by status |
| ✏️ Edit / Delete | Full CRUD operations on all applications |
| 📅 Date Tracking | Applied date + Interview date per application |
| 📈 Analytics | Funnel chart, timeline chart, source pie chart, response rate |
| 🎯 Priority | High / Medium / Low priority per application |
| 📝 Notes | Free-form notes per application |
| 📱 Responsive | Mobile-friendly UI |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| Recharts | Charts & analytics |
| React Hot Toast | Notifications |
| CSS (Custom) | Styling (dark theme) |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| MongoDB | NoSQL database |
| Mongoose | ODM for MongoDB |
| JSON Web Token | Authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│   Login/Register → Dashboard → Applications → Analytics  │
│                    (Port 3000)                            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / REST API (Axios)
                       │ Authorization: Bearer <JWT>
┌──────────────────────▼──────────────────────────────────┐
│                  BACKEND (Express.js)                     │
│  /api/auth  ─── authController (register, login, me)     │
│  /api/jobs  ─── jobController (CRUD + analytics)         │
│                JWT Middleware (protect routes)            │
│                    (Port 5000)                            │
└──────────────────────┬──────────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────────┐
│                   DATABASE (MongoDB)                      │
│  Collections:                                             │
│  ├── users         { name, email, password(hashed) }     │
│  └── jobapplications { user, company, role, status... }  │
└─────────────────────────────────────────────────────────┘
```

### API Flow
```
User Action → React Component → Axios → Express Route
           → JWT Middleware → Controller → Mongoose → MongoDB
           → JSON Response → State Update → UI Re-render
```

---

## 📁 Folder Structure

```
Job-Application-Tracker-Portal/
│
├── client/                         # React Frontend
│   ├── public/
│   │   └── index.html              # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js           # Navigation bar
│   │   │   └── JobModal.js         # Add/Edit job form modal
│   │   ├── context/
│   │   │   └── AuthContext.js      # Global auth state (React Context)
│   │   ├── hooks/
│   │   │   └── useJobsApi.js       # API call functions
│   │   ├── pages/
│   │   │   ├── Login.js            # Login page
│   │   │   ├── Register.js         # Register page
│   │   │   ├── Dashboard.js        # Overview & stats
│   │   │   ├── Applications.js     # Full CRUD list
│   │   │   └── Analytics.js        # Charts & analytics
│   │   ├── App.js                  # Root + Routes
│   │   ├── index.js                # Entry point
│   │   └── index.css               # Global styles
│   └── package.json
│
├── server/                         # Node.js Backend
│   ├── config/                     # (DB config if separated)
│   ├── controllers/
│   │   ├── authController.js       # Register, Login, Me
│   │   └── jobController.js        # CRUD + Analytics
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT protect middleware
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   └── JobApplication.js       # Job application schema
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth/*
│   │   └── jobRoutes.js            # /api/jobs/*
│   ├── index.js                    # Express app entry
│   ├── .env.example                # Env variable template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 📡 API Endpoints

### Auth Routes `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Private | Get current user |

### Job Routes `/api/jobs`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all user's applications (supports ?status=&search=) |
| POST | `/` | Private | Create new application |
| GET | `/:id` | Private | Get single application |
| PUT | `/:id` | Private | Update application |
| DELETE | `/:id` | Private | Delete application |
| GET | `/analytics` | Private | Get funnel, monthly, source analytics |

### Sample Request — Create Application
```json
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Google",
  "roleTitle": "Software Engineer",
  "location": "Bangalore",
  "source": "LinkedIn",
  "status": "Applied",
  "priority": "High",
  "appliedDate": "2025-01-15",
  "salaryNote": "₹25 LPA",
  "notes": "Referral from college senior"
}
```

---

## 🚀 How to Run

### Prerequisites
- Node.js v18+ — [Download](https://nodejs.org/)
- MongoDB — [Local install](https://www.mongodb.com/try/download/community) OR [Atlas (free cloud)](https://www.mongodb.com/atlas)
- Git — [Download](https://git-scm.com/)

---

### Step 1 — Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/job-application-tracker-portal.git
cd job-application-tracker-portal
```

### Step 2 — Backend Setup
```bash
cd server
npm install

# Create your .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

Start the backend:
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```
Backend runs on → `http://localhost:5000`

---

### Step 3 — Frontend Setup
```bash
cd ../client
npm install
npm start
```
Frontend runs on → `http://localhost:3000`

---

### Step 4 — MongoDB Setup

**Option A — Local MongoDB:**
```bash
# Windows: Start MongoDB service from Services panel
# Mac:
brew services start mongodb-community
```
Use URI: `mongodb://localhost:27017/jobtracker`

**Option B — MongoDB Atlas (Recommended for free cloud):**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create free cluster
3. Get connection string
4. Set in `.env`: `MONGO_URI=mongodb+srv://...`

---

## 🔐 Environment Variables

Create `server/.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobtracker
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

> ⚠️ **NEVER commit `.env` to GitHub.** It is already in `.gitignore`.

---

## 📤 GitHub Upload Steps

```bash
# 1. Create repo on github.com (name: job-application-tracker-portal)

# 2. Initialize and push
git init
git add .
git commit -m "feat: initial project setup - Job Application Tracker Portal"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/job-application-tracker-portal.git
git push -u origin main

# Day-by-day commits
git add .
git commit -m "feat: add user authentication with JWT"
git commit -m "feat: add job application CRUD operations"
git commit -m "feat: add dashboard with pipeline visualization"
git commit -m "feat: add analytics charts with Recharts"
git commit -m "style: polish UI with dark theme"
git commit -m "docs: update README with screenshots"
```

**Recommended GitHub Tags:**
`full-stack`, `mern-stack`, `react`, `nodejs`, `mongodb`, `express`, `jwt-authentication`, `job-tracker`, `portfolio-project`

---

## 📸 Screenshots

> Add screenshots here after running the project locally.

| Page | Description |
|------|-------------|
| `/login` | Login page with demo credentials |
| `/register` | Register new account |
| `/dashboard` | Stats cards + pipeline + recent activity |
| `/applications` | Full list with search, filter, edit, delete |
| `/analytics` | Funnel + timeline + source charts |

**Capture these for GitHub:**
- Register page
- Login page
- Dashboard with data
- Applications list with filters
- Edit application modal
- Analytics charts
- MongoDB Compass screenshot (data)
- Postman/Thunder API testing screenshot

---

## 🎓 Learning Outcomes

By building this project, you learn:

1. **Full-Stack Architecture** — How frontend and backend communicate via REST APIs
2. **Authentication** — JWT-based auth, password hashing with bcrypt, protected routes
3. **MongoDB & Mongoose** — Schema design, CRUD operations, indexing, query filtering
4. **React Hooks** — useState, useEffect, useCallback, useContext
5. **React Router v6** — Protected routes, navigation, redirects
6. **State Management** — Context API for global auth state
7. **Form Handling** — Controlled components, validation
8. **Data Visualization** — Charts with Recharts (bar, line, pie)
9. **API Design** — RESTful routes, status codes, error handling
10. **Security** — Input validation, JWT expiry, environment variables

---

## 💡 Future Improvements

- [ ] Email reminders for interview dates
- [ ] Resume/CV upload per application (AWS S3)
- [ ] Chrome extension for one-click job saving
- [ ] Export to CSV/PDF
- [ ] Admin panel for placement cells
- [ ] Job portal API integration (LinkedIn, Indeed)
- [ ] Dark/light mode toggle
- [ ] Kanban drag-and-drop board view

---

## ❓ Interview Q&A

**Q1: Explain your project.**
> I built a full-stack Job Application Tracker Portal using the MERN stack. It allows users to register, log in, and manage their job applications with features like status tracking (Saved → Applied → Interview → Offer), search and filter, date tracking for interviews, and analytics with charts showing funnel conversion, source distribution, and weekly trends.

**Q2: How did you implement authentication?**
> I used JWT (JSON Web Tokens). On login, the backend generates a signed token containing the user ID. The frontend stores this token in localStorage and sends it in the `Authorization: Bearer <token>` header for every protected API request. The `authMiddleware.js` verifies the token before allowing access.

**Q3: What is Mongoose and why did you use it?**
> Mongoose is an ODM (Object Data Modeling) library for MongoDB. It lets me define schemas with validation, types, and hooks. I used it to define the User and JobApplication models with built-in validation, a pre-save hook to hash passwords, and instance methods like `matchPassword`.

**Q4: How does the Context API work in your project?**
> I created an `AuthContext` that wraps the entire app. It holds the `user`, `token`, `login`, `register`, and `logout` functions. Any component can access auth state using the `useAuth()` custom hook without prop drilling.

**Q5: What challenges did you face?**
> The main challenges were: (1) handling CORS between React on port 3000 and Express on port 5000, (2) securing routes so users can only access their own data, (3) managing loading states for async API calls, and (4) building responsive charts with Recharts.

---

## 👨‍💻 Author

Built as a Full Stack Development portfolio project.

**GitHub:** [your-username](https://github.com/your-username)
**LinkedIn:** [your-profile](https://linkedin.com/in/your-profile)

---

> ⭐ If this project helped you, give it a star on GitHub!
