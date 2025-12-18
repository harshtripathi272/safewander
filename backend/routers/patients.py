from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database import get_db, Patient
from schemas import PatientCreate, PatientResponse
import uuid

router = APIRouter()

@router.get("/")
async def get_patients(db: AsyncSession = Depends(get_db)):
    """Get all patients"""
    from database import Location
    from sqlalchemy import desc
    
    result = await db.execute(select(Patient))
    patients = result.scalars().all()
    
    # Convert to frontend format and add current_position
    patient_list = []
    for p in patients:
        patient_dict = PatientResponse.model_validate(p).dict()
        
        # Get latest location for this patient
        location_result = await db.execute(
            select(Location)
            .where(Location.patient_id == p.id)
            .order_by(desc(Location.timestamp))
            .limit(1)
        )
        latest_location = location_result.scalar_one_or_none()
        
        if latest_location:
            patient_dict['current_position'] = {
                'lat': latest_location.latitude,
                'lng': latest_location.longitude
            }
        
        patient_list.append(patient_dict)
    
    return patient_list

@router.get("/{patient_id}")
async def get_patient(patient_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific patient by ID"""
    from database import Location
    from sqlalchemy import desc
    
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Convert to frontend format
    patient_dict = PatientResponse.model_validate(patient).dict()
    
    # Get latest location
    location_result = await db.execute(
        select(Location)
        .where(Location.patient_id == patient_id)
        .order_by(desc(Location.timestamp))
        .limit(1)
    )
    latest_location = location_result.scalar_one_or_none()
    
    if latest_location:
        patient_dict['current_position'] = {
            'lat': latest_location.latitude,
            'lng': latest_location.longitude
        }
    
    return patient_dict

@router.post("/", response_model=PatientResponse)
async def create_patient(patient: PatientCreate, db: AsyncSession = Depends(get_db)):
    """Create a new patient"""
    db_patient = Patient(
        id=str(uuid.uuid4()),
        **patient.model_dump()
    )
    db.add(db_patient)
    await db.commit()
    await db.refresh(db_patient)
    return db_patient

@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str, 
    patient: PatientCreate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a patient"""
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    db_patient = result.scalar_one_or_none()
    
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    for key, value in patient.model_dump(exclude_unset=True).items():
        setattr(db_patient, key, value)
    
    await db.commit()
    await db.refresh(db_patient)
    return db_patient

@router.delete("/{patient_id}")
async def delete_patient(patient_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a patient"""
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    db_patient = result.scalar_one_or_none()
    
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    await db.delete(db_patient)
    await db.commit()
    return {"message": "Patient deleted successfully"}

@router.put("/{patient_id}/reset-status")
async def reset_patient_status(patient_id: str, db: AsyncSession = Depends(get_db)):
    """Reset patient FSM state to safe - used for demo reset"""
    from datetime import datetime
    
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    db_patient = result.scalar_one_or_none()
    
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Reset FSM state to safe
    db_patient.status = "safe"
    db_patient.fsm_state = "safe"
    db_patient.risk_score = 0
    db_patient.state_entered_at = datetime.utcnow()
    db_patient.last_safe_zone_exit = None
    db_patient.active_alerts = 0
    
    await db.commit()
    await db.refresh(db_patient)
    
    return {"message": "Patient status reset to safe", "status": "safe", "fsm_state": "safe"}
