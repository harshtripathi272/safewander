# SafeWander Backend API

FastAPI backend for the SafeWander dementia patient monitoring system.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation will be available at `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/{id}` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### Tracking
- `GET /api/tracking/locations/{patient_id}` - Get location history
- `POST /api/tracking/locations` - Record new location
- `GET /api/tracking/zones` - Get all zones
- `POST /api/tracking/zones` - Create new zone
- `DELETE /api/tracking/zones/{id}` - Delete zone
- `WS /api/tracking/ws` - WebSocket for real-time updates

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/{id}` - Get alert by ID
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/{id}/acknowledge` - Acknowledge alert
- `PUT /api/alerts/{id}/resolve` - Resolve alert
- `GET /api/alerts/activities/{patient_id}` - Get activity timeline

### Emergency
- `GET /api/emergency` - Get all emergencies
- `GET /api/emergency/{id}` - Get emergency by ID
- `POST /api/emergency` - Activate emergency mode
- `PUT /api/emergency/{id}/resolve` - Resolve emergency
- `PUT /api/emergency/{id}/update-search-radius` - Update search radius

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/{id}` - Get report by ID
- `POST /api/reports` - Generate new report
- `DELETE /api/reports/{id}` - Delete report

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/{category}/{key}` - Get specific setting
- `POST /api/settings` - Create or update setting
- `DELETE /api/settings/{category}/{key}` - Delete setting

## Database

The backend uses SQLite by default for simplicity. To use PostgreSQL or MySQL, update the `DATABASE_URL` in the configuration.

Database is automatically initialized on first run.
