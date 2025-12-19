# SafeWander - Complete Startup Guide

## 🚀 Quick Start (2 Commands)

### Step 1: Install Frontend Dependencies

```powershell
pnpm install
```

### Step 2: Setup & Start Backend

**Option A: Automated Setup (Recommended)**

```powershell
# Run the setup script
.\setup-backend.ps1
```

This script will:
- ✅ Check Python installation
- ✅ Create virtual environment
- ✅ Install Python dependencies
- ✅ Initialize SQLite database
- ✅ Seed database with demo data
- ✅ Start the backend server

**Option B: Manual Setup**

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Initialize database
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"

# Go back and seed demo data
cd ..
python scripts\seed_database.py

# Go back to backend and start server
cd backend
uvicorn main:app --reload
```

**For Mac/Linux:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"
cd ..
python scripts/seed_database.py
cd backend
uvicorn main:app --reload
```

✅ Backend will run at: **http://localhost:8000**
📚 API Docs at: **http://localhost:8000/docs**

### Step 3: Start Frontend (New Terminal)

Open a **NEW** PowerShell terminal (keep backend running):

```powershell
pnpm dev
```

✅ Frontend will run at: **http://localhost:3000**

---

## 🗄️ Database Information

### Database Type
- **SQLite** (file-based, no server needed)
- Location: `backend/safewander.db`
- No PostgreSQL or MySQL installation required!
- No `.env` file needed - database path is hardcoded!

### Database URL
```
sqlite+aiosqlite:///./safewander.db
```

Already configured in `backend/database.py` - **no configuration needed!**

---

## 📁 What You Have

### ✅ Already Configured:
- ✅ Database connection (SQLite)
- ✅ Backend API routes (FastAPI)
- ✅ Frontend API client (with auto-refresh)
- ✅ React hooks for data fetching
- ✅ Demo data seed script
- ✅ All buttons connected to backend
- ✅ Real-time updates

### ✅ No Setup Required:
- ❌ No API keys needed
- ❌ No `.env` files required
- ❌ No database server installation
- ❌ No cloud accounts needed

---

## 🎯 Quick Test

### 1. Test Backend API
Visit: **http://localhost:8000/docs**

You should see the **FastAPI Swagger UI** with all API endpoints.

Try these endpoints:
- `GET /api/patients` - Returns 3 demo patients
- `GET /api/alerts` - Returns active alerts
- `GET /api/emergency` - Returns emergency records

### 2. Test Frontend
Visit: **http://localhost:3000**

You should see the **SafeWander Dashboard** with:
- Patient card (Margaret Thompson)
- Live map with location marker
- Quick action buttons
- Recent alerts feed

### 3. Test Interactive Features

**Dashboard:**
- ✅ Click **"SOS Emergency"** → Opens emergency mode
- ✅ Click **"Call"** → Shows call notification
- ✅ Click **"Navigate"** → Shows navigation toast

**Alerts Page** (`/alerts`):
- ✅ Click **"Acknowledge Alert"** → Marks alert as acknowledged
- ✅ Click **"Resolve Alert"** → Resolves alert and updates database

**Emergency Page** (`/emergency`):
- ✅ Click **"CALL 911"** → Emergency alert
- ✅ Click **"Share Live Link"** → Copies tracking link to clipboard
- ✅ Click **"Notify Network"** → Sends notifications to contacts

**Reports Page** (`/reports`):
- ✅ Click **"Zone Crossings (CSV)"** → Downloads CSV file
- ✅ Click **"Location History (CSV)"** → Downloads location data
- ✅ Click **"Full Report (JSON)"** → Downloads complete report

---

## 📊 Demo Data Included

The database is pre-seeded with:

### Patients (3)
1. **Margaret Thompson** (Age 78, Moderate Alzheimer's)
2. **Robert Chen** (Age 72, Early-stage dementia)
3. **Elizabeth Morrison** (Age 81, Advanced dementia)

### Data per Patient
- ✅ **20 GPS location points** (with timestamps)
- ✅ **2 Geofence zones** (home, caution)
- ✅ **Vital signs history** (heart rate, blood pressure)
- ✅ **Activity timeline** (zone entries/exits, movements)
- ✅ **Emergency contacts** (with phone numbers)

### Active Alerts (2)
- ⚠️ Battery Low (Medium severity)
- 🚨 Geofence Exit (High severity)

---

## 🔧 Troubleshooting

### Backend won't start?

**Error: "Python not found"**
```powershell
python --version
# If this fails, install Python 3.8+ from python.org
```

**Error: "Module not found"**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

**Error: "Port 8000 already in use"**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

### Frontend won't start?

**Error: "Node.js not found"**
```powershell
node --version
# If this fails, install Node.js 18+ from nodejs.org
```

**Error: "pnpm not found"**
```powershell
npm install -g pnpm
```

**Error: "Port 3000 already in use"**
```powershell
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database errors?

**Reset everything:**
```powershell
# Delete the database file
Remove-Item backend\safewander.db -ErrorAction SilentlyContinue

# Reinitialize and reseed
cd backend
.\venv\Scripts\Activate.ps1
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"
cd ..
python scripts\seed_database.py
```

### Connection errors?

**Frontend can't connect to backend:**
1. Make sure backend is running on `http://localhost:8000`
2. Check browser console for CORS errors
3. Try restarting both frontend and backend

---

## 🌐 Available Pages

Once running, visit these URLs:

| Page | URL | Description |
|------|-----|-------------|
| **Dashboard** | http://localhost:3000 | Main monitoring view |
| **Patients** | http://localhost:3000/patients | All patients list |
| **Alerts** | http://localhost:3000/alerts | Alert management |
| **Emergency** | http://localhost:3000/emergency | Emergency response |
| **Map** | http://localhost:3000/map | Full-screen tracking |
| **Reports** | http://localhost:3000/reports | Generate reports |
| **Settings** | http://localhost:3000/settings | System settings |
| **API Docs** | http://localhost:8000/docs | Backend API |

---

## 🎬 For Your Demo/Presentation

### Recommended Demo Flow (5 minutes):

**1. Dashboard (30 seconds)**
- Show patient monitoring overview
- Point out real-time map
- Show vital signs

**2. Alerts Page (1 minute)**
- Show active alerts list
- Click **"Acknowledge Alert"** button
- Click **"Resolve Alert"** button
- Show how database updates

**3. Emergency Mode (2 minutes)** ⭐ **HIGHLIGHT**
- Click **"SOS Emergency"** button
- Show emergency response interface:
  - Patient photo and details
  - Last known location on map
  - Search radius visualization
- Click **"Share Live Link"** (copies to clipboard)
- Click **"Notify Network"** (sends alerts)
- Show how caregivers receive instant information

**4. Reports (1 minute)**
- Click **"Zone Crossings (CSV)"** - download
- Click **"Full Report (JSON)"** - download
- Show exportable data for medical professionals

**5. Close** (30 seconds)
- Return to dashboard
- Emphasize: "All buttons work, all data persists"

### Key Talking Points:
✅ "Full-stack TypeScript + Python application"  
✅ "All buttons functional with backend integration"  
✅ "Real database tracking every event"  
✅ "Emergency mode provides instant critical information"  
✅ "Designed to prevent dementia wandering incidents"  
✅ "Could save lives by reducing response time from hours to minutes"

---

## 💡 Architecture Overview

```
┌─────────────────┐         HTTP REST API        ┌──────────────────┐
│   Next.js App   │ ◄────────────────────────► │  FastAPI Server  │
│  (Port 3000)    │                              │   (Port 8000)    │
│                 │                              │                  │
│ - Dashboard     │                              │ - /api/patients  │
│ - Alerts        │                              │ - /api/alerts    │
│ - Emergency     │                              │ - /api/tracking  │
│ - Reports       │                              │ - /api/emergency │
└─────────────────┘                              └──────────────────┘
                                                          │
                                                          ▼
                                                  ┌──────────────────┐
                                                  │  SQLite Database │
                                                  │  safewander.db   │
                                                  │                  │
                                                  │ - patients       │
                                                  │ - locations      │
                                                  │ - alerts         │
                                                  │ - emergencies    │
                                                  │ - zones          │
                                                  └──────────────────┘
```

---

## 🎉 You're Ready!

**Summary:**
- ✅ No external database server needed (SQLite)
- ✅ No API keys required for demo
- ✅ No complex configuration
- ✅ Just run 2 terminals: backend + frontend

**Two Terminals:**

**Terminal 1 - Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```powershell
pnpm dev
```

That's it! Your SafeWander app is running! 🚀

---

**SafeWander** - *"Safe steps, peaceful mind"* 🛡️
