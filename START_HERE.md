# SafeWander - Complete Startup Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```powershell
# Install frontend dependencies
pnpm install
```

### Step 2: Setup & Start Backend

Open a PowerShell terminal in the project root:

```powershell
# Run the automated setup script
.\setup-backend.ps1
```

This script will:
- ✅ Check Python installation
- ✅ Create virtual environment
- ✅ Install Python dependencies
- ✅ Initialize SQLite database
- ✅ Seed database with demo data

**If setup script doesn't work, do it manually:**

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

# Seed demo data
cd ..
python scripts/seed_database.py
```

**Start the backend server:**

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

✅ Backend will run at: **http://localhost:8000**

### Step 3: Start Frontend

Open a **NEW** PowerShell terminal (keep backend running):

```powershell
# Start the Next.js development server
pnpm dev
```

✅ Frontend will run at: **http://localhost:3000**

---

## 🗄️ Database Information

### Database Type
- **SQLite** (file-based, no server needed)
- Location: `backend/safewander.db`
- No configuration required!

### Database URL
```
sqlite+aiosqlite:///./safewander.db
```

Already configured in `backend/database.py` - **no .env needed!**

---

## 📁 What You Have

### ✅ Already Configured:
- ✅ Database connection (SQLite)
- ✅ Backend API routes
- ✅ Frontend API client
- ✅ React hooks for data fetching
- ✅ Demo data seed script

### ✅ Environment Files:
- `.env.local` - Frontend configuration (just created)
- Backend uses hardcoded SQLite (no env needed)

---

## 🎯 Quick Test

### 1. Test Backend
Visit: http://localhost:8000/docs

You should see the **FastAPI Swagger documentation** with all API endpoints.

### 2. Test Frontend
Visit: http://localhost:3000

You should see the **SafeWander Dashboard** with demo patient data.

### 3. Test Features
- Click **Alerts** → See active alerts → Click "Resolve Alert"
- Click **SOS Emergency** → See emergency response UI
- Click **Patients** → See all 3 demo patients

---

## 📊 Demo Data Included

The database is pre-seeded with:
- **3 Patients** (Margaret Thompson, Robert Chen, Elizabeth Morrison)
- **20 Location points** per patient
- **2 Active alerts** (Battery low, Geofence exit)
- **2 Geofence zones** per patient
- **Vital signs history**
- **Activity timeline**

---

## 🔧 Troubleshooting

### Backend won't start?

**Check Python:**
```powershell
python --version
# Should be 3.8 or higher
```

**Reinstall dependencies:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend won't start?

**Check Node.js:**
```powershell
node --version
# Should be 18 or higher
```

**Clean install:**
```powershell
Remove-Item node_modules -Recurse -Force
Remove-Item pnpm-lock.yaml
pnpm install
```

### Database errors?

**Reset database:**
```powershell
# Delete the database file
Remove-Item backend/safewander.db

# Reinitialize
cd backend
.\venv\Scripts\Activate.ps1
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"

# Reseed
cd ..
python scripts/seed_database.py
```

### Port already in use?

**Backend (8000):**
```powershell
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

**Frontend (3000):**
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

## 🌐 API Endpoints

### Base URL: `http://localhost:8000`

**Patients:**
- `GET /api/patients` - List all patients
- `GET /api/patients/{id}` - Get specific patient

**Alerts:**
- `GET /api/alerts` - List all alerts
- `PUT /api/alerts/{id}/acknowledge` - Acknowledge alert
- `PUT /api/alerts/{id}/resolve` - Resolve alert

**Tracking:**
- `GET /api/tracking/locations/{patient_id}` - Get location history
- `GET /api/tracking/zones` - Get geofence zones

**Emergency:**
- `GET /api/emergency` - List emergencies
- `POST /api/emergency` - Create emergency

Full API docs: http://localhost:8000/docs

---

## 🎬 For Your Hackathon Demo

### Demo Flow:
1. **Start on Dashboard** - Show real-time patient monitoring
2. **Go to Alerts page** - Demonstrate alert management
3. **Click "Resolve Alert"** - Show button functionality
4. **Click "SOS Emergency"** - Enter emergency mode
5. **Show emergency features:**
   - Patient profile with photo
   - Last known location
   - Search radius
   - Click "Share Live Link" (copies to clipboard)
   - Click "Notify Network" (shows toast)
6. **Return to Dashboard** - Show data persistence

### Talking Points:
✅ "Full-stack application with React + FastAPI"
✅ "All buttons are functional and connected to backend"
✅ "Real-time data updates every few seconds"
✅ "SQLite database tracks everything"
✅ "Emergency mode designed for critical situations"
✅ "Prevents dementia wandering incidents"

---

## 🎉 You're Ready!

**Summary:**
- ✅ No external database server needed (SQLite)
- ✅ No API keys required for basic demo
- ✅ No complex configuration
- ✅ Just run 2 commands: backend + frontend

**Two Terminals:**
```powershell
# Terminal 1: Backend
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload

# Terminal 2: Frontend
pnpm dev
```

That's it! 🚀
