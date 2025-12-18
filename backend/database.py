from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, JSON
from datetime import datetime
import enum

# Database URL - using SQLite for simplicity, can be changed to PostgreSQL
# Use absolute path to ensure consistency regardless of where scripts are run from
from pathlib import Path
import os

# Get the directory where this file (database.py) is located
BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "safewander.db"
DATABASE_URL = f"sqlite+aiosqlite:///{DATABASE_PATH}"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

# Enums - using string values to match database
class PatientStatus(str, enum.Enum):
    SAFE = "safe"
    MONITORING = "monitoring"
    WARNING = "warning"
    EMERGENCY = "emergency"

class AlertLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertType(str, enum.Enum):
    GEOFENCE = "geofence"
    VITALS = "vitals"
    FALL = "fall"
    INACTIVITY = "inactivity"
    BATTERY = "battery"

# Models
class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    status = Column(String, default="safe")  # Store as string instead of enum
    location = Column(String)
    last_seen = Column(DateTime, default=datetime.utcnow)
    battery = Column(Integer, default=100)
    active_alerts = Column(Integer, default=0)
    medical_info = Column(JSON)
    emergency_contacts = Column(JSON)
    behavioral_patterns = Column(JSON)
    photo_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # FSM state tracking
    fsm_state = Column(String, default="safe")  # safe, advisory, warning, urgent, emergency
    state_entered_at = Column(DateTime, default=datetime.utcnow)
    risk_score = Column(Integer, default=0)  # 0-100
    last_safe_zone_exit = Column(DateTime)  # When patient left safe zone
    mobility_level = Column(String, default="medium")  # high, medium, low, wheelchair

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    speed = Column(Float)
    heading = Column(Float)

class Zone(Base):
    __tablename__ = "zones"
    
    id = Column(String, primary_key=True)
    patient_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String)  # safe, buffer, danger, restricted
    coordinates = Column(JSON)  # Array of lat/lng points or center point
    radius = Column(Float)  # For circular zones
    active = Column(Boolean, default=True)
    is_auto_generated = Column(Boolean, default=False)  # Buffer zones are auto-generated
    risk_weight = Column(Integer, default=0)  # Additional risk weight for this zone
    created_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String, primary_key=True)
    patient_id = Column(String, nullable=False)
    type = Column(String, nullable=False)  # Store as string
    level = Column(String, nullable=False)  # Store as string
    message = Column(String, nullable=False)
    description = Column(Text)
    location = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime)
    acknowledged_by = Column(String)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    extra_data = Column(JSON)

class Emergency(Base):
    __tablename__ = "emergencies"
    
    id = Column(String, primary_key=True)
    patient_id = Column(String, nullable=False)
    status = Column(String, default="active")  # active, resolved, false_alarm
    last_known_location = Column(JSON)
    missing_since = Column(DateTime, default=datetime.utcnow)
    search_radius = Column(Float, default=500)
    responders_notified = Column(JSON)
    timeline = Column(JSON)
    resolved_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class Vital(Base):
    __tablename__ = "vitals"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, nullable=False)
    heart_rate = Column(Integer)
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    oxygen_level = Column(Integer)
    temperature = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, nullable=False)
    type = Column(String, nullable=False)  # alert, movement, status_change, etc.
    description = Column(String, nullable=False)
    extra_data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Settings(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String, nullable=False)
    key = Column(String, nullable=False)
    value = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    date_range = Column(String)
    generated_at = Column(DateTime, default=datetime.utcnow)
    generated_by = Column(String)
    data = Column(JSON)
    file_path = Column(String)

class Baseline(Base):
    """Behavioral baseline for patients - rolling averages."""
    __tablename__ = "baselines"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, unique=True, nullable=False)
    avg_speed = Column(Float, default=0.8)  # m/s
    avg_duration = Column(Float, default=900)  # seconds
    std_speed = Column(Float, default=0.2)
    std_duration = Column(Float, default=300)
    sample_count = Column(Integer, default=0)
    common_walk_hours = Column(JSON)  # List of common walking hours
    updated_at = Column(DateTime, default=datetime.utcnow)

async def get_db():
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
