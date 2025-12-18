"""
Monitoring Loop for SafeWander
Background task that runs every N seconds to process patient status.
"""

import asyncio
from datetime import datetime
from typing import List, Optional

from config import LOOP_INTERVAL, DANGER_ZONE_PROXIMITY


async def run_monitoring_loop():
    """
    Background task that runs every LOOP_INTERVAL seconds.
    This is the main system loop that orchestrates all monitoring.
    
    For each active patient:
    1. Get latest location
    2. Update movement history
    3. Compute risk score
    4. Detect anomalies
    5. Update FSM state
    6. Trigger alerts if needed
    7. If Emergency -> compute search radius
    """
    from database import async_session_maker
    
    while True:
        try:
            async with async_session_maker() as db:
                patients = await get_active_patients(db)
                
                for patient in patients:
                    await process_patient(db, patient)
                
        except Exception as e:
            print(f"[MonitoringLoop] Error: {e}")
        
        await asyncio.sleep(LOOP_INTERVAL)


async def get_active_patients(db):
    """Get all patients that are actively being monitored."""
    from database import Patient
    from sqlalchemy import select
    
    result = await db.execute(
        select(Patient).where(Patient.status != "inactive")
    )
    return result.scalars().all()


async def process_patient(db, patient):
    """
    Process single patient through the monitoring pipeline.
    """
    from database import Location, Zone
    from sqlalchemy import select, desc
    from risk_engine import compute_risk_score
    from state_machine import transition_state, state_to_alert_level
    from baseline import get_baseline
    from anomaly import detect_anomaly
    from geo_utils import get_zone_status, calculate_speed
    
    patient_id = patient.id
    
    # 1. Get latest locations
    result = await db.execute(
        select(Location)
        .where(Location.patient_id == patient_id)
        .order_by(desc(Location.timestamp))
        .limit(10)
    )
    locations = result.scalars().all()
    
    if not locations:
        return  # No location data
    
    latest = locations[0]
    lat, lon = latest.latitude, latest.longitude
    
    # 2. Get patient zones
    result = await db.execute(
        select(Zone)
        .where(Zone.patient_id == patient_id)
        .where(Zone.active == True)
    )
    zones = result.scalars().all()
    zones_data = [
        {
            "id": z.id,
            "name": z.name,
            "type": z.type,
            "center": z.coordinates[0] if z.coordinates else {"lat": 0, "lng": 0},
            "radius": z.radius or 100,
        }
        for z in zones
    ]
    
    # 3. Calculate time outside safe zone
    time_outside_safe = 0
    if patient.last_safe_zone_exit:
        time_outside_safe = (datetime.utcnow() - patient.last_safe_zone_exit).total_seconds()
    
    # 4. Get baseline and check for anomaly
    baseline = await get_baseline(db, patient_id)
    
    current_speed = latest.speed or 0.8
    current_duration = time_outside_safe if time_outside_safe > 0 else 0
    
    has_anomaly = detect_anomaly(current_speed, current_duration, baseline)
    
    # 5. Check zone status
    zone_status = get_zone_status(lat, lon, zones_data)
    near_danger = zone_status["nearest_danger_dist"] < DANGER_ZONE_PROXIMITY
    
    # 6. Compute risk score
    gps_signal = "good"  # TODO: get from device status
    no_response_time = 0  # TODO: track last acknowledgement
    
    risk_score = compute_risk_score(
        lat=lat,
        lon=lon,
        zones=zones_data,
        gps_signal=gps_signal,
        time_outside_safe=int(time_outside_safe),
        no_response_time=no_response_time,
        current_hour=datetime.now().hour,
        has_anomaly=has_anomaly,
        usual_walk_time=False  # TODO: check baseline
    )
    
    # 7. FSM state transition
    current_state = patient.fsm_state or "safe"
    state_entered_at = patient.state_entered_at or datetime.utcnow()
    
    new_state, alert_message = transition_state(
        current_state=current_state,
        risk_score=risk_score,
        state_entered_at=state_entered_at,
        near_danger=near_danger
    )
    
    # 8. Update patient
    patient.risk_score = risk_score
    
    if new_state != current_state:
        patient.fsm_state = new_state
        patient.state_entered_at = datetime.utcnow()
        
        # Update patient status for backward compatibility
        if new_state == "emergency":
            patient.status = "emergency"
        elif new_state in ["urgent", "warning"]:
            patient.status = "warning"
        else:
            patient.status = "safe"
        
        # Create alert for state change
        if alert_message:
            await create_state_change_alert(
                db, patient_id, new_state, alert_message, lat, lon
            )
    
    # Track safe zone exit
    if not zone_status["in_safe"] and not patient.last_safe_zone_exit:
        patient.last_safe_zone_exit = datetime.utcnow()
    elif zone_status["in_safe"]:
        patient.last_safe_zone_exit = None
    
    await db.commit()


async def create_state_change_alert(db, patient_id: str, new_state: str, 
                                     message: str, lat: float, lon: float):
    """Create an alert when FSM state changes."""
    from database import Alert
    from state_machine import state_to_alert_level
    import uuid
    
    alert_level = state_to_alert_level(new_state)
    
    alert = Alert(
        id=str(uuid.uuid4()),
        patient_id=patient_id,
        type="geofence",
        level=alert_level,
        message=message,
        description=f"State changed to {new_state.upper()}",
        location={"lat": lat, "lng": lon},
        timestamp=datetime.utcnow(),
    )
    db.add(alert)


def start_monitoring_loop():
    """Start the monitoring loop as a background task."""
    asyncio.create_task(run_monitoring_loop())
    print(f"[MonitoringLoop] Started with {LOOP_INTERVAL}s interval")
