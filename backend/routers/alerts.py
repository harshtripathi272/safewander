from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete
from typing import List
from database import get_db, Alert, Patient, Activity
from schemas import AlertCreate, AlertResponse, ActivityCreate, ActivityResponse
from datetime import datetime
import uuid

router = APIRouter()

@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    patient_id: str = None,
    unacknowledged_only: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """Get all alerts or alerts for a specific patient"""
    query = select(Alert).order_by(desc(Alert.timestamp))
    
    if patient_id:
        query = query.where(Alert.patient_id == patient_id)
    
    if unacknowledged_only:
        query = query.where(Alert.acknowledged == False)
    
    result = await db.execute(query)
    alerts = result.scalars().all()
    return alerts

@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific alert"""
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert

@router.post("/", response_model=AlertResponse)
async def create_alert(alert: AlertCreate, db: AsyncSession = Depends(get_db)):
    """Create a new alert"""
    db_alert = Alert(
        id=str(uuid.uuid4()),
        **alert.model_dump()
    )
    db.add(db_alert)
    
    # Update patient's active alerts count
    result = await db.execute(select(Patient).where(Patient.id == alert.patient_id))
    patient = result.scalar_one_or_none()
    
    if patient:
        patient.active_alerts = (patient.active_alerts or 0) + 1
        
        # Update patient status based on alert level
        if alert.level == "critical":
            patient.status = "emergency"
        elif alert.level == "high" and patient.status != "emergency":
            patient.status = "warning"
    
    # Create activity log
    activity = Activity(
        patient_id=alert.patient_id,
        type="alert",
        description=f"{alert.type.value} alert: {alert.message}",
        extra_data={"alert_id": db_alert.id, "level": alert.level.value}
    )
    db.add(activity)
    
    await db.commit()
    await db.refresh(db_alert)
    return db_alert

@router.put("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    request_body: dict,
    db: AsyncSession = Depends(get_db)
):
    """Acknowledge an alert"""
    acknowledged_by = request_body.get("acknowledged_by", "Unknown")
    
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.acknowledged = True
    alert.acknowledged_at = datetime.utcnow()
    alert.acknowledged_by = acknowledged_by
    
    await db.commit()
    await db.refresh(alert)
    return alert

@router.put("/{alert_id}/resolve")
async def resolve_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    """Resolve an alert"""
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = True
    alert.resolved_at = datetime.utcnow()
    
    # Update patient's active alerts count
    patient_result = await db.execute(select(Patient).where(Patient.id == alert.patient_id))
    patient = patient_result.scalar_one_or_none()
    
    if patient:
        patient.active_alerts = max(0, (patient.active_alerts or 0) - 1)
        
        # Update patient status if no more alerts
        if patient.active_alerts == 0:
            patient.status = "safe"
    
    await db.commit()
    await db.refresh(alert)
    return alert

@router.delete("/clear")
async def clear_all_alerts(
    patient_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Clear all alerts or alerts for a specific patient"""
    if patient_id:
        # Delete alerts for specific patient
        await db.execute(delete(Alert).where(Alert.patient_id == patient_id))
        
        # Reset patient's active alerts count
        result = await db.execute(select(Patient).where(Patient.id == patient_id))
        patient = result.scalar_one_or_none()
        if patient:
            patient.active_alerts = 0
            patient.status = "safe"
    else:
        # Delete all alerts
        await db.execute(delete(Alert))
        
        # Reset all patients' active alerts count
        result = await db.execute(select(Patient))
        patients = result.scalars().all()
        for patient in patients:
            patient.active_alerts = 0
            patient.status = "safe"
    
    await db.commit()
    return {"message": "Alerts cleared successfully"}

@router.get("/activities/{patient_id}", response_model=List[ActivityResponse])
async def get_activities(
    patient_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get activity timeline for a patient"""
    result = await db.execute(
        select(Activity)
        .where(Activity.patient_id == patient_id)
        .order_by(desc(Activity.timestamp))
        .limit(limit)
    )
    activities = result.scalars().all()
    return activities

@router.post("/activities", response_model=ActivityResponse)
async def create_activity(activity: ActivityCreate, db: AsyncSession = Depends(get_db)):
    """Create a new activity log"""
    db_activity = Activity(**activity.model_dump())
    db.add(db_activity)
    await db.commit()
    await db.refresh(db_activity)
    return db_activity
