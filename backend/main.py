from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from routers import patients, tracking, alerts, emergency, reports, settings, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    await init_db()
    yield
    # Shutdown: cleanup if needed
    pass

app = FastAPI(
    title="SafeWander API",
    description="Backend API for SafeWander dementia patient monitoring system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(tracking.router, prefix="/api/tracking", tags=["Tracking"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["Emergency"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])

@app.get("/")
async def root():
    return {"message": "SafeWander API v1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SafeWander API"}
