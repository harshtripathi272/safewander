from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from database import get_db, Emergency, Patient, Activity
from schemas import EmergencyCreate, EmergencyResponse
from datetime import datetime
import uuid

# Import algorithm modules
from baseline import get_baseline
from config import MOBILITY_FACTORS, TERRAIN_FACTOR

router = APIRouter()

@router.get("/", response_model=List[EmergencyResponse])
async def get_emergencies(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Get all emergencies"""
    query = select(Emergency)
    
    if active_only:
        query = query.where(Emergency.status == "active")
    
    result = await db.execute(query)
    emergencies = result.scalars().all()
    return emergencies

@router.get("/{emergency_id}", response_model=EmergencyResponse)
async def get_emergency(emergency_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific emergency"""
    result = await db.execute(select(Emergency).where(Emergency.id == emergency_id))
    emergency = result.scalar_one_or_none()
    
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
    
    return emergency

@router.post("/", response_model=EmergencyResponse)
async def create_emergency(emergency: EmergencyCreate, db: AsyncSession = Depends(get_db)):
    """Activate emergency mode for a patient"""
    # Check if there's already an active emergency
    existing = await db.execute(
        select(Emergency)
        .where(Emergency.patient_id == emergency.patient_id)
        .where(Emergency.status == "active")
    )
    
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Emergency already active for this patient")
    
    # Create emergency
    # Calculate search radius using baseline speed and time missing
    baseline = await get_baseline(db, emergency.patient_id)
    
    # Get patient for mobility level
    patient_result = await db.execute(select(Patient).where(Patient.id == emergency.patient_id))
    patient = patient_result.scalar_one_or_none()
    
    # Time missing calculation
    time_missing = 0
    if patient and patient.last_seen:
        time_missing = (datetime.utcnow() - patient.last_seen).total_seconds()
    
    # Search radius = avg_speed * time_missing * mobility_factor * terrain_factor
    avg_speed = baseline.get("avg_speed", 0.8)  # m/s
    mobility_level = patient.mobility_level if patient else "medium"
    mobility_factor = MOBILITY_FACTORS.get(mobility_level, 1.0)
    
    estimated_radius = avg_speed * time_missing * mobility_factor * TERRAIN_FACTOR
    estimated_radius = max(estimated_radius, 100)  # Minimum 100m
    estimated_radius = min(estimated_radius, 5000)  # Maximum 5km
    
    # Use estimated radius if not explicitly provided
    search_radius = emergency.search_radius if emergency.search_radius else estimated_radius
    
    db_emergency = Emergency(
        id=str(uuid.uuid4()),
        patient_id=emergency.patient_id,
        last_known_location=emergency.last_known_location,
        search_radius=search_radius,
        timeline=[{
            "time": datetime.utcnow().isoformat(),
            "event": f"Emergency activated. Estimated search radius: {int(estimated_radius)}m",
            "type": "system"
        }]
    )
    db.add(db_emergency)
    
    # Update patient status to emergency
    result = await db.execute(select(Patient).where(Patient.id == emergency.patient_id))
    patient = result.scalar_one_or_none()
    
    if patient:
        patient.status = "emergency"
    
    # Create activity log
    activity = Activity(
        patient_id=emergency.patient_id,
        type="emergency",
        description="Emergency mode activated",
        extra_data={"emergency_id": db_emergency.id}
    )
    db.add(activity)
    
    await db.commit()
    await db.refresh(db_emergency)
    return db_emergency

@router.put("/{emergency_id}/resolve")
async def resolve_emergency(
    emergency_id: str,
    resolution_type: str = "resolved",
    db: AsyncSession = Depends(get_db)
):
    """Resolve an emergency"""
    result = await db.execute(select(Emergency).where(Emergency.id == emergency_id))
    emergency = result.scalar_one_or_none()
    
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
    
    emergency.status = resolution_type
    emergency.resolved_at = datetime.utcnow()
    
    # Add to timeline
    if not emergency.timeline:
        emergency.timeline = []
    emergency.timeline.append({
        "time": datetime.utcnow().isoformat(),
        "event": f"Emergency {resolution_type}",
        "type": "system"
    })
    
    # Update patient status
    patient_result = await db.execute(select(Patient).where(Patient.id == emergency.patient_id))
    patient = patient_result.scalar_one_or_none()
    
    if patient:
        patient.status = "safe" if resolution_type == "resolved" else "monitoring"
    
    await db.commit()
    return {"message": f"Emergency {resolution_type} successfully"}

@router.put("/{emergency_id}/update-search-radius")
async def update_search_radius(
    emergency_id: str,
    radius: float,
    db: AsyncSession = Depends(get_db)
):
    """Update search radius for an emergency"""
    result = await db.execute(select(Emergency).where(Emergency.id == emergency_id))
    emergency = result.scalar_one_or_none()
    
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
    
    emergency.search_radius = radius
    
    # Add to timeline
    if not emergency.timeline:
        emergency.timeline = []
    emergency.timeline.append({
        "time": datetime.utcnow().isoformat(),
        "event": f"Search radius updated to {radius}m",
        "type": "update"
    })
    
    await db.commit()
    return {"message": "Search radius updated successfully"}

@router.delete("/clear")
async def clear_all_emergencies(
    patient_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Clear all emergencies or emergencies for a specific patient"""
    if patient_id:
        # Delete emergencies for specific patient
        await db.execute(delete(Emergency).where(Emergency.patient_id == patient_id))
        
        # Reset patient status
        result = await db.execute(select(Patient).where(Patient.id == patient_id))
        patient = result.scalar_one_or_none()
        if patient:
            patient.status = "safe"
    else:
        # Delete all emergencies
        await db.execute(delete(Emergency))
        
        # Reset all patients' status
        result = await db.execute(select(Patient))
        patients = result.scalars().all()
        for patient in patients:
            if patient.status == "emergency":
                patient.status = "safe"
    
    await db.commit()
    return {"message": "Emergencies cleared successfully"}
