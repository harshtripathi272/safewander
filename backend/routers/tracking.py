from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from database import get_db, Location, Zone, Patient
from schemas import LocationCreate, LocationResponse, ZoneCreate, ZoneResponse
from datetime import datetime
import uuid
import json

router = APIRouter()

# WebSocket connection manager for real-time tracking
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
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
            # Echo back or process data
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
    """Record a new location for a patient"""
    db_location = Location(**location.model_dump())
    db.add(db_location)
    
    # Update patient's last seen and location
    result = await db.execute(select(Patient).where(Patient.id == location.patient_id))
    patient = result.scalar_one_or_none()
    
    if patient:
        patient.last_seen = datetime.utcnow()
        patient.location = f"{location.latitude},{location.longitude}"
    
    await db.commit()
    await db.refresh(db_location)
    
    # Broadcast to WebSocket clients
    await manager.broadcast({
        "type": "location_update",
        "patient_id": location.patient_id,
        "location": {
            "lat": location.latitude,
            "lng": location.longitude,
            "timestamp": datetime.utcnow().isoformat()
        }
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
    """Create a new geofence zone"""
    db_zone = Zone(
        id=str(uuid.uuid4()),
        **zone.model_dump()
    )
    db.add(db_zone)
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
