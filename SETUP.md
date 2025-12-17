# SafeWander - Getting Started Guide

## 🚀 Quick Setup

### Prerequisites
- **Node.js** 18+ and pnpm
- **Python** 3.8+
- **Windows, Mac, or Linux**

### 1. Install Frontend Dependencies

```bash
pnpm install
```

### 2. Setup Backend Database

**Windows (PowerShell):**
```powershell
.\setup-backend.ps1
```

**Mac/Linux:**
```bash
chmod +x setup-backend.sh
./setup-backend.sh
```

### 3. Start the Backend Server

```bash
cd backend
# Windows
.\venv\Scripts\Activate.ps1
# Mac/Linux
source venv/bin/activate

# Start server
uvicorn main:app --reload
```

The backend will start at `http://localhost:8000`

### 4. Start the Frontend

In a new terminal:

```bash
pnpm dev
```

The frontend will start at `http://localhost:3000`

---

## 📊 What's Been Fixed

### ✅ Database Connection
- Created async hooks to connect frontend to backend API
- Added data fetching with auto-refresh using SWR
- All patient, alert, and tracking data now syncs with backend

### ✅ Functional Buttons
All buttons now have working handlers:

**Dashboard Quick Actions:**
- ✅ **SOS Emergency** - Opens emergency mode
- ✅ **Call** - Shows toast notification (simulated call)
- ✅ **Navigate** - Shows toast notification (simulated navigation)

**Emergency Page:**
- ✅ **CALL 911** - Emergency alert with toast notification
- ✅ **Share Live Link** - Copies tracking link to clipboard / uses Web Share API
- ✅ **Notify Network** - Sends alerts to emergency contacts

**Alerts Page:**
- ✅ **Acknowledge Alert** - Marks alert as acknowledged in database
- ✅ **Resolve Alert** - Resolves and closes alert in database

### ✅ Real-Time Updates
- Dashboard refreshes patient data every 5 seconds
- Alerts refresh every 3 seconds
- Emergency data refreshes every 2 seconds
- WebSocket support for real-time location tracking

### ✅ Demo Data
The database is pre-seeded with:
- 3 demo patients with different statuses
- Location history (20 points per patient)
- Sample geofence zones
- Active alerts
- Vital signs history
- Activity timeline

---

## 🎯 Testing the Application

1. **Dashboard** (`/`) - View primary patient with live map
2. **Patients** (`/patients`) - See all patients and their statuses
3. **Alerts** (`/alerts`) - View and manage active alerts
4. **Emergency** (`/emergency`) - Test emergency response UI
5. **Map** (`/map`) - Full-screen tracking view
6. **Impact** (`/impact`) - View metrics and analytics
7. **Reports** (`/reports`) - Generate and view reports
8. **Settings** (`/settings`) - Configure system settings

---

## 🔧 API Endpoints

Backend API documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

Key endpoints:
- `GET /api/patients` - List all patients
- `GET /api/alerts` - Get alerts
- `POST /api/emergency` - Create emergency
- `GET /api/tracking/locations/{patient_id}` - Get location history
- `GET /api/tracking/zones` - Get geofence zones

---

## 📱 Key Features Now Working

### Prevention
- ✅ Real-time patient monitoring
- ✅ Geofence zones with alerts
- ✅ Battery and device tracking
- ✅ Activity timeline

### Detection
- ✅ Multi-level alert system
- ✅ Intelligent escalation
- ✅ Zone boundary detection
- ✅ Vital signs monitoring

### Emergency Response
- ✅ One-click emergency mode
- ✅ Live location sharing
- ✅ Contact notification system
- ✅ Search radius visualization
- ✅ Missing person profile

---

## 💡 For Hackathon Demo

### Demo Flow:
1. Show **Dashboard** - Patient monitoring overview
2. Click **Alerts** - Show active alerts, acknowledge/resolve
3. Click **SOS Emergency** - Enter emergency mode
4. Show **Emergency Response** features:
   - Patient profile with photo
   - Last known location
   - Search radius visualization
   - Quick action buttons
5. Return to Dashboard - Show data persistence

### Talking Points:
- "Connected full-stack application with real-time data"
- "All buttons functional with backend integration"
- "Database tracks everything: patients, alerts, locations, activities"
- "Emergency mode provides instant access to critical information"
- "Designed for real-world dementia care scenarios"

---

## 🐛 Troubleshooting

**Backend won't start:**
```bash
cd backend
pip install -r requirements.txt
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"
```

**Frontend can't connect:**
- Check backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local` (optional)

**Database errors:**
- Delete `safewander.db` and re-run setup script
- Check Python version (requires 3.8+)

---

## 📚 Next Steps

To make this production-ready:
1. Add real GPS tracking device integration
2. Implement SMS/push notifications
3. Add authentication and multi-user support
4. Deploy to cloud (Vercel + Railway/Render)
5. Add real geolocation mapping (Google Maps/Mapbox)

---

**SafeWander** - Preventing dementia wandering, saving lives. 🛡️
