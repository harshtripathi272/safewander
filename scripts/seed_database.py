import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Add backend directory to path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.append(str(backend_dir))

from database import async_session_maker, Patient, Zone
import uuid

async def seed_database():
    print("🌱 Seeding database with demo data...")
    
    async with async_session_maker() as db:
        # Create demo patient
        patient = Patient(
            id="P001",
            name="John Doe",
            age=78,
            status="safe",
            location="40.7580,-73.9855",
            last_seen=datetime.utcnow(),
            battery=85,
            active_alerts=0,
            medical_info={
                "diagnosis": "Alzheimer's Disease - Early Stage",
                "medications": ["Donepezil", "Memantine"],
                "allergies": ["Penicillin"],
                "medical_history": ["Hypertension", "Type 2 Diabetes"]
            },
            emergency_contacts=[
                {
                    "name": "Jane Doe",
                    "relationship": "Daughter",
                    "phone": "+1-555-0123"
                },
                {
                    "name": "Dr. Smith",
                    "relationship": "Primary Care Physician",
                    "phone": "+1-555-0456"
                }
            ],
            behavioral_patterns={
                "trigger_locations": ["Grocery store", "Park"],
                "distinguishing_features": "Wears a blue jacket"
            },
            photo_url="/placeholder-user.jpg",
            # FSM fields
            fsm_state="safe",
            risk_score=0,
            state_entered_at=datetime.utcnow(),
            mobility_level="medium"
        )
        db.add(patient)
        
        # Create safe zone around home
        safe_zone = Zone(
            id=str(uuid.uuid4()),
            patient_id="P001",
            name="Home",
            type="safe",
            coordinates=[{"lat": 40.7580, "lng": -73.9855}],
            radius=100,
            active=True,
            is_auto_generated=False,
            risk_weight=0
        )
        db.add(safe_zone)
        
        # Create buffer zone (auto-generated)
        buffer_zone = Zone(
            id=str(uuid.uuid4()),
            patient_id="P001",
            name="Home - Buffer",
            type="buffer",
            coordinates=[{"lat": 40.7580, "lng": -73.9855}],
            radius=150,
            active=True,
            is_auto_generated=True,
            risk_weight=10
        )
        db.add(buffer_zone)
        
        # Create danger zone
        danger_zone = Zone(
            id=str(uuid.uuid4()),
            patient_id="P001",
            name="Busy Road",
            type="danger",
            coordinates=[{"lat": 40.7620, "lng": -73.9900}],
            radius=50,
            active=True,
            is_auto_generated=False,
            risk_weight=40
        )
        db.add(danger_zone)
        
        await db.commit()
        
        print("✅ Database seeded successfully!")
        print(f"   - Created patient: {patient.name} (ID: {patient.id})")
        print(f"   - Created 3 zones: Safe, Buffer, Danger")

if __name__ == "__main__":
    asyncio.run(seed_database())
