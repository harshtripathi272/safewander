# SafeWander - Dementia Patient Monitoring System

A comprehensive full-stack application for monitoring and ensuring the safety of dementia patients using real-time tracking, intelligent alerts, and emergency response capabilities.

## Features

- **Real-time Patient Monitoring** - Track patient location, vitals, and activity
- **Intelligent Geofencing** - Create safe zones with automatic alerts
- **Escalating Alert System** - Multi-level alerts with automatic escalation
- **Emergency Mode** - Rapid response interface for missing patients
- **Patient Profiles** - Detailed medical information and behavioral patterns
- **Reports & Analytics** - Generate insights on patient safety and response times
- **WebSocket Updates** - Real-time location tracking without page refresh

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - UI component library
- **SWR** - Data fetching and caching

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite/PostgreSQL** - Database (configurable)
- **WebSockets** - Real-time communication
- **Pydantic** - Data validation

## Getting Started

### Prerequisites
- Node.js 18+ for frontend
- Python 3.11+ for backend
- pip (Python package manager)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

4. (Optional) Seed the database with sample data:
```bash
python ../scripts/seed_database.py
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your backend URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/{id}` - Get patient details
- `POST /api/patients` - Create new patient
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### Tracking
- `GET /api/tracking/locations/{patient_id}` - Get location history
- `POST /api/tracking/locations` - Record new location
- `GET /api/tracking/zones` - Get geofence zones
- `POST /api/tracking/zones` - Create zone
- `DELETE /api/tracking/zones/{id}` - Delete zone
- `WS /api/tracking/ws` - WebSocket for real-time updates

### Alerts
- `GET /api/alerts` - List all alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/{id}/acknowledge` - Acknowledge alert
- `PUT /api/alerts/{id}/resolve` - Resolve alert
- `GET /api/alerts/activities/{patient_id}` - Activity timeline

### Emergency
- `GET /api/emergency` - List emergencies
- `POST /api/emergency` - Activate emergency mode
- `PUT /api/emergency/{id}/resolve` - Resolve emergency
- `PUT /api/emergency/{id}/update-search-radius` - Update search radius

### Reports & Settings
- `GET /api/reports` - List reports
- `POST /api/reports` - Generate report
- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings

## Project Structure

```
safewander/
├── app/                    # Next.js pages
│   ├── page.tsx           # Dashboard
│   ├── patients/          # Patient management
│   ├── map/               # Live map view
│   ├── alerts/            # Alerts & timeline
│   ├── emergency/         # Emergency mode
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
│   └── routers/         # API endpoints
└── scripts/             # Utility scripts
    └── seed_database.py # Database seeding
```

## Features in Detail

### Real-time Tracking
- WebSocket connection for live location updates
- Historical location trail visualization
- Current position with accuracy indicator

### Intelligent Alerts
- Multiple alert types: geofence, vitals, fall detection, battery
- Automatic severity classification
- Escalation timelines with response tracking

### Emergency Mode
- One-click emergency activation
- Expanding search radius visualization
- Responder notification management
- Timeline of emergency events

### Patient Profiles
- Medical information (diagnosis, medications, allergies)
- Emergency contacts with priority levels
- Behavioral patterns and triggers
- Calming strategies for caregivers

## License

MIT License - see LICENSE file for details
