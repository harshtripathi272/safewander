from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from database import get_db, Location, Zone, Patient, Alert
from schemas import LocationCreate, LocationResponse, ZoneCreate, ZoneResponse
from datetime import datetime
import uuid
import json

# Import algorithm modules
from risk_engine import compute_risk_score
from state_machine import transition_state, state_to_alert_level
from baseline import get_baseline
from anomaly import detect_anomaly
from geo_utils import get_zone_status
from config import DANGER_ZONE_PROXIMITY, ZONE_DEFAULTS

router = APIRouter()

# WebSocket connection manager for real-time tracking
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time location updates"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast({"type": "location_update", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/locations/{patient_id}", response_model=List[LocationResponse])
async def get_patient_locations(
    patient_id: str,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get location history for a patient"""
    result = await db.execute(
        select(Location)
        .where(Location.patient_id == patient_id)
        .order_by(desc(Location.timestamp))
        .limit(limit)
    )
    locations = result.scalars().all()
    return locations

@router.post("/locations", response_model=LocationResponse)
async def create_location(location: LocationCreate, db: AsyncSession = Depends(get_db)):
    """
    Record a new location for a patient.
    Integrates: risk scoring, FSM state transitions, anomaly detection.
    """
    db_location = Location(**location.model_dump())
    db.add(db_location)
    
    # Get patient
    result = await db.execute(select(Patient).where(Patient.id == location.patient_id))
    patient = result.scalar_one_or_none()
    
    if not patient:
        await db.commit()
        await db.refresh(db_location)
        return db_location
    
    # Update patient's last seen and location
    patient.last_seen = datetime.utcnow()
    patient.location = f"{location.latitude},{location.longitude}"
    
    # Get patient zones
    zone_result = await db.execute(
        select(Zone)
        .where(Zone.patient_id == location.patient_id)
        .where(Zone.active == True)
    )
    zones = zone_result.scalars().all()
    zones_data = [
        {
            "id": z.id,
            "name": z.name,
            "type": z.type or "safe",
            "center": z.coordinates[0] if z.coordinates else {"lat": 0, "lng": 0},
            "radius": z.radius or 100,
        }
        for z in zones
    ]
    
    # Calculate time outside safe zone
    time_outside_safe = 0
    if patient.last_safe_zone_exit:
        time_outside_safe = int((datetime.utcnow() - patient.last_safe_zone_exit).total_seconds())
    
    # Get baseline and check for anomaly
    baseline = await get_baseline(db, location.patient_id)
    current_speed = location.speed or 0.8
    has_anomaly = detect_anomaly(current_speed, time_outside_safe, baseline)
    
    # Check zone status
    zone_status = get_zone_status(location.latitude, location.longitude, zones_data)
    near_danger = zone_status["nearest_danger_dist"] < DANGER_ZONE_PROXIMITY
    
    # Compute risk score
    risk_score = compute_risk_score(
        lat=location.latitude,
        lon=location.longitude,
        zones=zones_data,
        gps_signal="good",
        time_outside_safe=time_outside_safe,
        no_response_time=0,
        current_hour=datetime.now().hour,
        has_anomaly=has_anomaly
    )
    
    # FSM state transition
    current_state = patient.fsm_state or "safe"
    state_entered_at = patient.state_entered_at or datetime.utcnow()
    
    new_state, alert_message = transition_state(
        current_state=current_state,
        risk_score=risk_score,
        state_entered_at=state_entered_at,
        near_danger=near_danger
    )
    
    # Update patient with new risk data
    patient.risk_score = risk_score
    
    if new_state != current_state:
        patient.fsm_state = new_state
        patient.state_entered_at = datetime.utcnow()
        
        # Update legacy status for backward compatibility
        if new_state == "emergency":
            patient.status = "emergency"
        elif new_state in ["urgent", "warning"]:
            patient.status = "warning"
        else:
            patient.status = "safe"
        
        # Create alert for state change
        if alert_message:
            alert_level = state_to_alert_level(new_state)
            db_alert = Alert(
                id=str(uuid.uuid4()),
                patient_id=location.patient_id,
                type="geofence",
                level=alert_level,
                message=alert_message,
                description=f"State changed to {new_state.upper()}. Risk score: {risk_score}",
                location={"lat": location.latitude, "lng": location.longitude},
                timestamp=datetime.utcnow()
            )
            db.add(db_alert)
            patient.active_alerts = (patient.active_alerts or 0) + 1
    
    # Track safe zone exit/entry
    if not zone_status["in_safe"] and not patient.last_safe_zone_exit:
        patient.last_safe_zone_exit = datetime.utcnow()
    elif zone_status["in_safe"]:
        patient.last_safe_zone_exit = None
    
    await db.commit()
    await db.refresh(db_location)
    
    # Broadcast to WebSocket clients with enhanced data
    await manager.broadcast({
        "type": "location_update",
        "patient_id": location.patient_id,
        "location": {
            "lat": location.latitude,
            "lng": location.longitude,
            "timestamp": datetime.utcnow().isoformat()
        },
        "risk_score": risk_score,
        "fsm_state": new_state,
        "zone_status": zone_status["current_zone_name"]
    })
    
    return db_location

@router.get("/zones", response_model=List[ZoneResponse])
async def get_zones(patient_id: str = None, db: AsyncSession = Depends(get_db)):
    """Get all zones or zones for a specific patient"""
    query = select(Zone)
    if patient_id:
        query = query.where(Zone.patient_id == patient_id)
    
    result = await db.execute(query.where(Zone.active == True))
    zones = result.scalars().all()
    return zones

@router.post("/zones", response_model=ZoneResponse)
async def create_zone(zone: ZoneCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new geofence zone.
    Auto-generates buffer zone for safe zones.
    """
    zone_id = str(uuid.uuid4())
    db_zone = Zone(
        id=zone_id,
        **zone.model_dump()
    )
    db.add(db_zone)
    
    # Auto-generate buffer zone for safe zones
    if zone.type == "safe" and zone.radius:
        buffer_zone = Zone(
            id=str(uuid.uuid4()),
            patient_id=zone.patient_id,
            name=f"{zone.name} - Buffer",
            type="buffer",
            coordinates=zone.coordinates,
            radius=zone.radius + ZONE_DEFAULTS["buffer_offset"],
            active=True,
            is_auto_generated=True,
            risk_weight=10
        )
        db.add(buffer_zone)
    
    await db.commit()
    await db.refresh(db_zone)
    return db_zone

@router.delete("/zones/{zone_id}")
async def delete_zone(zone_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a zone"""
    result = await db.execute(select(Zone).where(Zone.id == zone_id))
    zone = result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    zone.active = False
    await db.commit()
    return {"message": "Zone deleted successfully"}

@router.get("/risk/{patient_id}")
async def get_patient_risk(patient_id: str, db: AsyncSession = Depends(get_db)):
    """Get current risk score and FSM state for a patient"""
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {
        "patient_id": patient_id,
        "risk_score": patient.risk_score or 0,
        "fsm_state": patient.fsm_state or "safe",
        "state_entered_at": patient.state_entered_at.isoformat() if patient.state_entered_at else None,
        "last_safe_zone_exit": patient.last_safe_zone_exit.isoformat() if patient.last_safe_zone_exit else None
    }
