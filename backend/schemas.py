from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

# Enums
class PatientStatusEnum(str, Enum):
    SAFE = "safe"
    MONITORING = "monitoring"
    WARNING = "warning"
    EMERGENCY = "emergency"

class AlertLevelEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertTypeEnum(str, Enum):
    GEOFENCE = "geofence"
    VITALS = "vitals"
    FALL = "fall"
    INACTIVITY = "inactivity"
    BATTERY = "battery"

# Patient schemas
class PatientBase(BaseModel):
    name: str
    age: int
    location: Optional[str] = None
    medical_info: Optional[Dict[str, Any]] = None
    emergency_contacts: Optional[List[Dict[str, str]]] = None
    behavioral_patterns: Optional[Dict[str, Any]] = None
    photo_url: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: str
    status: PatientStatusEnum
    last_seen: datetime
    battery: int
    active_alerts: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Location schemas
class LocationCreate(BaseModel):
    patient_id: str
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None

class LocationResponse(LocationCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Zone schemas
class ZoneCreate(BaseModel):
    patient_id: str
    name: str
    type: str
    coordinates: Optional[List[Dict[str, float]]] = None
    radius: Optional[float] = None

class ZoneResponse(ZoneCreate):
    id: str
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Alert schemas
class AlertCreate(BaseModel):
    patient_id: str
    type: AlertTypeEnum
    level: AlertLevelEnum
    message: str
    description: Optional[str] = None
    location: Optional[Dict[str, float]] = None
    metadata: Optional[Dict[str, Any]] = None

class AlertResponse(AlertCreate):
    id: str
    timestamp: datetime
    acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved: bool
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Emergency schemas
class EmergencyCreate(BaseModel):
    patient_id: str
    last_known_location: Dict[str, float]
    search_radius: float = 500

class EmergencyResponse(EmergencyCreate):
    id: str
    status: str
    missing_since: datetime
    responders_notified: Optional[List[Dict[str, str]]] = None
    timeline: Optional[List[Dict[str, Any]]] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Vital schemas
class VitalCreate(BaseModel):
    patient_id: str
    heart_rate: Optional[int] = None
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    oxygen_level: Optional[int] = None
    temperature: Optional[float] = None

class VitalResponse(VitalCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Activity schemas
class ActivityCreate(BaseModel):
    patient_id: str
    type: str
    description: str
    metadata: Optional[Dict[str, Any]] = None

class ActivityResponse(ActivityCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Settings schemas
class SettingCreate(BaseModel):
    category: str
    key: str
    value: Any

class SettingResponse(SettingCreate):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# Report schemas
class ReportCreate(BaseModel):
    type: str
    title: str
    date_range: str
    generated_by: str
    data: Optional[Dict[str, Any]] = None

class ReportResponse(ReportCreate):
    id: str
    generated_at: datetime
    file_path: Optional[str] = None

    class Config:
        from_attributes = True
