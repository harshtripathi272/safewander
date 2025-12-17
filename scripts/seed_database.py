import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.append(str(backend_dir))

from database import async_session_maker, Patient, Location, Alert, Zone, Vital, Activity
from datetime import datetime, timedelta
import random

async def seed_database():
    """Seed the database with sample data"""
    async with async_session_maker() as session:
        # Create sample patients
        patients_data = [
            {
                "id": "P001",
                "name": "Margaret Thompson",
                "age": 78,
                "status": "safe",
                "location": "40.7580,-73.9855",
                "battery": 85,
                "active_alerts": 0,
                "medical_info": {
                    "diagnosis": "Alzheimer's Stage 2",
                    "medications": ["Aricept 10mg", "Memantine 5mg"],
                    "allergies": ["Penicillin"],
                    "medical_history": ["Hypertension", "Type 2 Diabetes"]
                },
                "emergency_contacts": [
                    {"name": "Sarah Thompson", "relationship": "Daughter", "phone": "(555) 123-4567"},
                    {"name": "Dr. James Wilson", "relationship": "Primary Care", "phone": "(555) 987-6543"}
                ],
                "behavioral_patterns": {
                    "wandering_tendency": "Medium",
                    "preferred_routes": ["Park walking path", "Library route"],
                    "trigger_locations": ["Former workplace"],
                    "safe_hours": "9am - 5pm"
                }
            },
            {
                "id": "P002",
                "name": "Robert Chen",
                "age": 82,
                "status": "monitoring",
                "location": "40.7489,-73.9680",
                "battery": 45,
                "active_alerts": 1,
                "medical_info": {
                    "diagnosis": "Vascular Dementia",
                    "medications": ["Namenda 10mg", "Aspirin 81mg"],
                    "allergies": [],
                    "medical_history": ["Stroke", "Hypertension"]
                },
                "emergency_contacts": [
                    {"name": "Linda Chen", "relationship": "Wife", "phone": "(555) 234-5678"}
                ],
                "behavioral_patterns": {
                    "wandering_tendency": "High",
                    "preferred_routes": ["Chinatown area"],
                    "trigger_locations": ["Old restaurant"],
                    "safe_hours": "10am - 3pm"
                }
            },
            {
                "id": "P003",
                "name": "Elizabeth Morrison",
                "age": 75,
                "status": "warning",
                "location": "40.7614,-73.9776",
                "battery": 92,
                "active_alerts": 2,
                "medical_info": {
                    "diagnosis": "Mixed Dementia",
                    "medications": ["Donepezil 10mg", "Vitamin E"],
                    "allergies": ["Sulfa drugs"],
                    "medical_history": ["Arthritis", "Osteoporosis"]
                },
                "emergency_contacts": [
                    {"name": "Michael Morrison", "relationship": "Son", "phone": "(555) 345-6789"}
                ],
                "behavioral_patterns": {
                    "wandering_tendency": "Low",
                    "preferred_routes": ["Garden path"],
                    "trigger_locations": [],
                    "safe_hours": "8am - 6pm"
                }
            }
        ]
        
        for patient_data in patients_data:
            patient = Patient(**patient_data, last_seen=datetime.utcnow())
            session.add(patient)
        
        # Create sample locations
        for patient_id in ["P001", "P002", "P003"]:
            base_lat = 40.7580 + random.uniform(-0.01, 0.01)
            base_lng = -73.9855 + random.uniform(-0.01, 0.01)
            
            for i in range(20):
                location = Location(
                    patient_id=patient_id,
                    latitude=base_lat + random.uniform(-0.001, 0.001),
                    longitude=base_lng + random.uniform(-0.001, 0.001),
                    accuracy=random.uniform(5, 15),
                    timestamp=datetime.utcnow() - timedelta(minutes=i*30)
                )
                session.add(location)
        
        # Create sample zones
        zones_data = [
            {
                "id": "Z001",
                "patient_id": "P001",
                "name": "Home Safe Zone",
                "type": "safe",
                "coordinates": [
                    {"lat": 40.7580, "lng": -73.9855},
                    {"lat": 40.7590, "lng": -73.9855},
                    {"lat": 40.7590, "lng": -73.9845},
                    {"lat": 40.7580, "lng": -73.9845}
                ],
                "active": True
            },
            {
                "id": "Z002",
                "patient_id": "P001",
                "name": "Park Area",
                "type": "warning",
                "radius": 200,
                "active": True
            }
        ]
        
        for zone_data in zones_data:
            zone = Zone(**zone_data)
            session.add(zone)
        
        # Create sample alerts
        alerts_data = [
            {
                "id": "A001",
                "patient_id": "P002",
                "type": "battery",
                "level": "medium",
                "message": "Low battery - 45%",
                "description": "Device battery is running low",
                "acknowledged": False,
                "resolved": False
            },
            {
                "id": "A002",
                "patient_id": "P003",
                "type": "geofence",
                "level": "high",
                "message": "Left safe zone",
                "description": "Patient has left the designated safe zone",
                "location": {"lat": 40.7614, "lng": -73.9776},
                "acknowledged": True,
                "acknowledged_by": "Admin",
                "acknowledged_at": datetime.utcnow() - timedelta(minutes=5),
                "resolved": False
            }
        ]
        
        for alert_data in alerts_data:
            alert = Alert(**alert_data, timestamp=datetime.utcnow())
            session.add(alert)
        
        # Create sample vitals
        for patient_id in ["P001", "P002", "P003"]:
            for i in range(10):
                vital = Vital(
                    patient_id=patient_id,
                    heart_rate=random.randint(60, 90),
                    blood_pressure_systolic=random.randint(110, 140),
                    blood_pressure_diastolic=random.randint(70, 90),
                    oxygen_level=random.randint(95, 99),
                    temperature=round(random.uniform(36.5, 37.5), 1),
                    timestamp=datetime.utcnow() - timedelta(hours=i*2)
                )
                session.add(vital)
        
        # Create sample activities
        activities_data = [
            {
                "patient_id": "P001",
                "type": "status_change",
                "description": "Status changed to safe",
                "timestamp": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "patient_id": "P002",
                "type": "alert",
                "description": "Battery low alert triggered",
                "timestamp": datetime.utcnow() - timedelta(minutes=30)
            },
            {
                "patient_id": "P003",
                "type": "movement",
                "description": "Left home zone",
                "timestamp": datetime.utcnow() - timedelta(minutes=15)
            }
        ]
        
        for activity_data in activities_data:
            activity = Activity(**activity_data)
            session.add(activity)
        
        await session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
