# 🛠 Installation Guide — Job Application Tracker Portal

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | Comes with Node.js |
| MongoDB | v6+ | https://mongodb.com/try/download/community |
| Git | Any | https://git-scm.com |

---

## Option A — Standard Setup (Recommended for Beginners)

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/job-application-tracker-portal.git
cd job-application-tracker-portal
```

---

### Step 2: Set Up the Backend

```bash
cd server
npm install
```

Create your environment file:
```bash
# Windows (Command Prompt)
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Open `server/.env` and update:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobtracker
JWT_SECRET=change_this_to_any_long_random_string_123456
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

Start the backend:
```bash
# Development mode (auto-restarts on file change)
npm run dev

# OR production mode
npm start
```

✅ You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

---

### Step 3: Set Up the Frontend

Open a **new terminal window**:
```bash
cd client
npm install
npm start
```

✅ Browser opens automatically at `http://localhost:3000`

---

### Step 4: Set Up MongoDB

**Option A — Local MongoDB:**

Windows:
1. Download from https://mongodb.com/try/download/community
2. Run the installer
3. Start MongoDB service: Open Services → Find "MongoDB" → Start

Mac:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Linux (Ubuntu):
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

Verify it's running:
```bash
mongosh
# Should show: Connected to: mongodb://localhost:27017
```

---

**Option B — MongoDB Atlas (Free Cloud, Recommended):**

1. Go to https://cloud.mongodb.com
2. Create a free account
3. Create a free **M0 cluster**
4. Click **Connect** → **Drivers** → Copy connection string
5. Replace in `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jobtracker
   ```
   Replace `username`, `password`, and the cluster URL.

---

### Step 5: Seed Demo Data (Optional)

```bash
cd server
node seed.js
```

Output:
```
✅ Connected to MongoDB
👤 Demo user created: demo@jobtracker.com / demo123
✅ Created 10 sample job applications
🎉 Seed complete!
```

Now login with:
- Email: `demo@jobtracker.com`
- Password: `demo123`

---

## Option B — Docker Setup (Advanced)

Run the entire stack with one command:

```bash
# Make sure Docker Desktop is running
docker-compose up --build
```

This starts:
- MongoDB on port 27017
- Backend on port 5000
- Frontend on port 3000

Stop everything:
```bash
docker-compose down
```

---

## Expected URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/api/health |
| MongoDB (local) | mongodb://localhost:27017 |

---

## Common Errors & Fixes

### ❌ `MongooseServerSelectionError: connect ECONNREFUSED`
MongoDB is not running.
```bash
# Mac
brew services start mongodb-community

# Windows — Open Services and start MongoDB
```

### ❌ `CORS error` in browser
Make sure `CLIENT_URL` in `.env` matches exactly where React is running (default: `http://localhost:3000`).

### ❌ `Cannot find module` errors
Dependencies not installed. Run:
```bash
cd server && npm install
cd ../client && npm install
```

### ❌ Port already in use
```bash
# Kill process on port 5000 (Mac/Linux)
lsof -ti:5000 | xargs kill

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### ❌ JWT Token expired
Log out and log in again. The token has a 7-day expiry by default. You can change `JWT_EXPIRE` in `.env`.

---

## Testing the API

Import `docs/JobTracker_API.postman_collection.json` into:
- **Postman** — File → Import → Upload file
- **Thunder Client** (VS Code extension) — Import → From File

Steps:
1. Run **Login Demo User** request
2. Copy the `token` from the response
3. Set it as the `token` collection variable
4. All other requests will use it automatically
