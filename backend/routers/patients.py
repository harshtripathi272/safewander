from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database import get_db, Patient
from schemas import PatientCreate, PatientResponse
import uuid

router = APIRouter()

@router.get("/", response_model=List[PatientResponse])
async def get_patients(db: AsyncSession = Depends(get_db)):
    """Get all patients"""
    result = await db.execute(select(Patient))
    patients = result.scalars().all()
    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific patient by ID"""
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return patient

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
