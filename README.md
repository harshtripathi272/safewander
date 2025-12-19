# SafeWander - Dementia Patient Monitoring System

A comprehensive full-stack application for monitoring and ensuring the safety of dementia patients using real-time tracking, intelligent alerts, and emergency response capabilities.

**🎯 Tagline:** *"Safe steps, peaceful mind"*

## Features

- **Real-time Patient Monitoring** - Track patient location, vitals, and activity
- **Intelligent Geofencing** - Create safe zones with automatic alerts
- **Escalating Alert System** - Multi-level alerts with automatic escalation
- **Emergency Mode** - Rapid response interface for missing patients
- **Patient Profiles** - Detailed medical information and behavioral patterns
- **Reports & Analytics** - Generate insights on patient safety and response times
- **Live Map Tracking** - Real-time location updates with interactive maps

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - UI component library
- **Leaflet.js** - Interactive maps

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (no server needed!)
- **Pydantic** - Data validation

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **pnpm**
- **Python 3.8+**

### 1. Install Frontend Dependencies

```powershell
pnpm install
```

### 2. Setup Backend (Automated)

**Windows PowerShell:**
```powershell
.\setup-backend.ps1
```

**Mac/Linux:**
```bash
chmod +x setup-backend.sh
./setup-backend.sh
```

### 3. Start Backend Server

**Windows:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

**Mac/Linux:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

✅ Backend runs at: **http://localhost:8000**
📚 API docs at: **http://localhost:8000/docs**

### 4. Start Frontend (New Terminal)

```powershell
pnpm dev
```

✅ Frontend runs at: **http://localhost:3000**

---

## 📊 Demo Data

The database is pre-seeded with:
- ✅ **3 Demo Patients** (Margaret, Robert, Elizabeth)
- ✅ **20 Location points** per patient
- ✅ **Active alerts** (Battery, Geofence)
- ✅ **Geofence zones** per patient
- ✅ **Vital signs & activity history**

---

## 🎯 Testing Features

Visit these pages to test:

1. **Dashboard** (`/`) - View primary patient with live map
2. **Patients** (`/patients`) - See all patients
3. **Alerts** (`/alerts`) - View and resolve alerts
4. **Emergency** (`/emergency`) - Test SOS emergency mode
5. **Map** (`/map`) - Full-screen tracking view
6. **Reports** (`/reports`) - Generate CSV/JSON reports

---

## 🔧 API Endpoints

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/{id}` - Get patient details
- `POST /api/patients` - Create new patient

### Tracking
- `GET /api/tracking/locations/{patient_id}` - Get location history
- `POST /api/tracking/locations` - Record new location
- `GET /api/tracking/zones` - Get geofence zones
- `POST /api/tracking/zones` - Create zone

### Alerts
- `GET /api/alerts` - List all alerts
- `GET /api/alerts/activities/{patient_id}` - Activity timeline
- `PUT /api/alerts/{id}/acknowledge` - Acknowledge alert
- `PUT /api/alerts/{id}/resolve` - Resolve alert

### Emergency
- `GET /api/emergency` - List emergencies
- `POST /api/emergency` - Activate emergency mode
- `PUT /api/emergency/{id}/resolve` - Resolve emergency

Full API documentation: **http://localhost:8000/docs**

---

## 📁 Project Structure

```
safewander/
├── app/                    # Next.js pages
│   ├── page.tsx           # Dashboard
│   ├── patients/          # Patient management
│   ├── map/               # Live map view
│   ├── alerts/            # Alerts & timeline
│   ├── emergency/         # Emergency mode
│   ├── reports/           # Report generation
│   └── settings/          # Settings
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific
│   ├── layout/           # Layout components
│   └── ui/               # shadcn UI components
├── lib/                  # Utilities
│   ├── api-client.ts     # API client
│   ├── hooks/            # Custom React hooks
│   └── types.ts          # TypeScript types
├── backend/              # FastAPI backend
│   ├── main.py          # FastAPI app
│   ├── database.py      # Database models
│   ├── schemas.py       # Pydantic schemas
│   ├── routers/         # API endpoints
│   └── safewander.db    # SQLite database
└── scripts/             # Utility scripts
    └── seed_database.py # Database seeding
```

---

## 🛠️ Manual Backend Setup

If the automated script doesn't work:

**Windows:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"
cd ..
python scripts\seed_database.py
```

**Mac/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"
cd ..
python scripts/seed_database.py
```

---

## 🐛 Troubleshooting

### Backend won't start?

**Check Python version:**
```powershell
python --version
# Should be 3.8 or higher
```

**Reinstall dependencies:**
```powershell
cd backend
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
Remove-Item pnpm-lock.yaml -ErrorAction SilentlyContinue
pnpm install
```

### Database errors?

**Reset database:**
```powershell
Remove-Item backend\safewander.db -ErrorAction SilentlyContinue
cd backend
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"
cd ..
python scripts\seed_database.py
```

### Port already in use?

**Kill process on port 8000 (Backend):**
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

**Kill process on port 3000 (Frontend):**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

## 🎬 For Demo/Presentation

### Demo Flow:
1. **Dashboard** - Show real-time patient monitoring
2. **Alerts** - Click "Resolve Alert" to show functionality
3. **SOS Emergency** - Click button to enter emergency mode
4. **Emergency Features:**
   - Patient profile with photo
   - Last known location on map
   - Search radius visualization
   - Click "Share Live Link" (copies to clipboard)
   - Click "Notify Network" (sends notifications)
5. **Reports** - Download CSV/JSON exports

### Key Talking Points:
- ✅ Full-stack app with React + FastAPI
- ✅ All buttons functional and connected to backend
- ✅ Real-time data with auto-refresh
- ✅ SQLite database tracks everything
- ✅ Emergency mode for critical situations
- ✅ Prevents dementia wandering incidents

---

## 💡 What We Built

### Prevention Features
- Real-time GPS tracking
- Geofence zones with alerts
- Battery monitoring
- Activity timeline

### Detection Features
- Multi-level alert system (Critical/High/Medium/Low)
- Intelligent escalation
- Zone boundary detection
- Anomaly detection

### Emergency Response
- One-click emergency activation
- Live location sharing
- Emergency contact notifications
- Search radius management
- Missing person profile

---

## 📚 Learn More

- **Algorithm Documentation**: See `ALGORITHM_SPEC.md`
- **Demo Video Guide**: See `DEMO_VIDEO_GUIDE.md`
- **Setup Guide**: See `SETUP.md`
- **Quick Start**: See `START_HERE.md`

---

## 📄 License

MIT License

---

**Built with ❤️ for those who wander and those who care for them.**

*SafeWander - "Safe steps, peaceful mind"*
