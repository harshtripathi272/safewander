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

# FSM states for alert escalation
class FSMStateEnum(str, Enum):
    SAFE = "safe"
    ADVISORY = "advisory"
    WARNING = "warning"
    URGENT = "urgent"
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
    current_position: Optional[Dict[str, float]] = None  # {lat, lng}
    # FSM state fields
    fsm_state: Optional[str] = "safe"
    risk_score: Optional[int] = 0
    state_entered_at: Optional[datetime] = None
    mobility_level: Optional[str] = "medium"

    class Config:
        from_attributes = True
        
    # Transform to frontend format
    def dict(self, **kwargs):
        data = super().model_dump(**kwargs)
        
        # Split name into firstName and lastName
        name_parts = data.get('name', '').split(' ', 1)
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Parse location string to lat/lng
        location_str = data.get('location', '40.7580,-73.9855')
        lat, lng = 40.7580, -73.9855
        if location_str and ',' in location_str:
            try:
                parts = location_str.split(',')
                lat = float(parts[0])
                lng = float(parts[1])
            except:
                pass
        
        # Get status value (handle both string and enum)
        status_value = data.get('status')
        if hasattr(status_value, 'value'):
            status_value = status_value.value
        
        # Transform to frontend format
        return {
            "id": data.get('id'),
            "firstName": first_name,
            "lastName": last_name,
            "name": data.get('name'),
            "photo": data.get('photo_url') or '/placeholder-user.jpg',
            "dateOfBirth": "1947-01-01",
            "height": "5'6\"",
            "weight": "150 lbs",
            "eyeColor": "Brown",
            "hairColor": "Gray",
            "distinguishingFeatures": data.get('behavioral_patterns', {}).get('distinguishing_features', 'None noted'),
            "diagnosis": data.get('medical_info', {}).get('diagnosis', 'Unknown'),
            "conditions": data.get('medical_info', {}).get('medical_history', []),
            "medications": [
                {"name": med, "dosage": "As prescribed", "frequency": "Daily"}
                for med in data.get('medical_info', {}).get('medications', [])
            ],
            "allergies": data.get('medical_info', {}).get('allergies', []),
            "bloodType": "O+",
            "wanderingTriggers": data.get('behavioral_patterns', {}).get('trigger_locations', []),
            "calmingStrategies": ["Gentle redirection", "Favorite music"],
            "communicationAbility": "limited",
            "mobilityLevel": "medium",
            "device": {
                "id": f"DEV-{data.get('id')}",
                "name": "GPS Tracker",
                "batteryLevel": data.get('battery', 100),
                "signalStrength": "strong" if data.get('battery', 100) > 20 else "weak",
                "lastUpdate": data.get('last_seen', datetime.utcnow()).isoformat() if isinstance(data.get('last_seen'), datetime) else str(data.get('last_seen'))
            },
            "currentPosition": {"lat": lat, "lng": lng},
            "currentZone": "Home",
            "status": status_value,
            "emergencyContacts": [
                {
                    "id": f"EC-{i}",
                    "name": contact.get('name', ''),
                    "relationship": contact.get('relationship', ''),
                    "phone": contact.get('phone', ''),
                    "isPrimary": i == 0
                }
                for i, contact in enumerate(data.get('emergency_contacts', []))
            ],
            # Keep original fields for compatibility
            "age": data.get('age'),
            "location": location_str,
            "last_seen": data.get('last_seen').isoformat() if isinstance(data.get('last_seen'), datetime) else str(data.get('last_seen')),
            "battery": data.get('battery'),
            "active_alerts": data.get('active_alerts'),
            "created_at": data.get('created_at').isoformat() if isinstance(data.get('created_at'), datetime) else str(data.get('created_at')),
            "updated_at": data.get('updated_at').isoformat() if isinstance(data.get('updated_at'), datetime) else str(data.get('updated_at')),
            # FSM state fields
            "fsm_state": data.get('fsm_state', 'safe'),
            "risk_score": data.get('risk_score', 0),
            "state_entered_at": data.get('state_entered_at').isoformat() if isinstance(data.get('state_entered_at'), datetime) else None,
            "mobility_level": data.get('mobility_level', 'medium'),
        }

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
    active: Optional[bool] = True

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
    extra_data: Optional[Dict[str, Any]] = None

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
    extra_data: Optional[Dict[str, Any]] = None

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
