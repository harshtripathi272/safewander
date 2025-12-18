"""
Behavioral Baseline Modeling for SafeWander
Rolling 7-14 day averages for patient behavior patterns.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Dict, Optional


async def get_baseline(db: AsyncSession, patient_id: str) -> Dict:
    """
    Get behavioral baseline for patient.
    Returns default values if no baseline exists.
    """
    from database import Baseline
    
    result = await db.execute(
        select(Baseline).where(Baseline.patient_id == patient_id)
    )
    baseline = result.scalar_one_or_none()
    
    if not baseline:
        # Return defaults for new patients
        return {
            "avg_speed": 0.8,      # m/s
            "avg_duration": 900,   # seconds (15 min)
            "std_speed": 0.2,
            "std_duration": 300,   # 5 min standard deviation
            "common_walk_hours": [7, 8, 9, 17, 18, 19],  # Default morning/evening
        }
    
    return {
        "avg_speed": baseline.avg_speed,
        "avg_duration": baseline.avg_duration,
        "std_speed": baseline.std_speed,
        "std_duration": baseline.std_duration,
        "common_walk_hours": baseline.common_walk_hours or [7, 8, 9, 17, 18, 19],
    }


async def update_baseline(
    db: AsyncSession, 
    patient_id: str, 
    speed: float, 
    duration: float,
    is_emergency: bool = False
) -> None:
    """
    Update rolling average for patient baseline.
    Skip updates during emergency events (don't pollute baseline).
    
    Uses exponential moving average for smooth updates.
    """
    from database import Baseline
    
    # Do NOT update baseline during emergency events
    if is_emergency:
        return
    
    result = await db.execute(
        select(Baseline).where(Baseline.patient_id == patient_id)
    )
    baseline = result.scalar_one_or_none()
    
    if not baseline:
        # Create new baseline
        baseline = Baseline(
            patient_id=patient_id,
            avg_speed=speed,
            avg_duration=duration,
            std_speed=0.2,
            std_duration=300,
            sample_count=1,
        )
        db.add(baseline)
    else:
        # Exponential moving average update
        alpha = 0.1  # Smoothing factor (lower = slower adaptation)
        
        # Update averages
        old_avg_speed = baseline.avg_speed
        old_avg_duration = baseline.avg_duration
        
        baseline.avg_speed = alpha * speed + (1 - alpha) * old_avg_speed
        baseline.avg_duration = alpha * duration + (1 - alpha) * old_avg_duration
        
        # Update standard deviations (simplified running calculation)
        speed_dev = abs(speed - old_avg_speed)
        duration_dev = abs(duration - old_avg_duration)
        
        baseline.std_speed = alpha * speed_dev + (1 - alpha) * baseline.std_speed
        baseline.std_duration = alpha * duration_dev + (1 - alpha) * baseline.std_duration
        
        baseline.sample_count += 1
    
    baseline.updated_at = datetime.utcnow()
    await db.commit()


async def reset_baseline(db: AsyncSession, patient_id: str) -> None:
    """
    Reset baseline to defaults.
    Use when caregiver flags significant status changes.
    """
    from database import Baseline
    
    result = await db.execute(
        select(Baseline).where(Baseline.patient_id == patient_id)
    )
    baseline = result.scalar_one_or_none()
    
    if baseline:
        baseline.avg_speed = 0.8
        baseline.avg_duration = 900
        baseline.std_speed = 0.2
        baseline.std_duration = 300
        baseline.sample_count = 0
        baseline.updated_at = datetime.utcnow()
        await db.commit()


def is_usual_walk_time(current_hour: int, common_hours: list) -> bool:
    """Check if current hour is a usual walking time for this patient."""
    return current_hour in common_hours


async def add_walk_hour(db: AsyncSession, patient_id: str, hour: int) -> None:
    """Add an hour to common walking times if frequently observed."""
    from database import Baseline
    
    result = await db.execute(
        select(Baseline).where(Baseline.patient_id == patient_id)
    )
    baseline = result.scalar_one_or_none()
    
    if baseline and baseline.common_walk_hours:
        if hour not in baseline.common_walk_hours:
            # Simple approach: add if we see it, list management can be enhanced
            hours = list(baseline.common_walk_hours)
            hours.append(hour)
            baseline.common_walk_hours = hours[-10:]  # Keep last 10 unique hours
            await db.commit()
