"""
Rule-Based Risk Scoring Engine for SafeWander
Computes risk score 0-100 based on weighted factors.
"""

from typing import List, Dict
from datetime import datetime

from config import (
    RISK_WEIGHTS, 
    NIGHT_START, 
    NIGHT_END,
    TIME_OUTSIDE_THRESHOLD,
    NO_RESPONSE_THRESHOLD,
    DANGER_ZONE_PROXIMITY
)
from geo_utils import get_zone_status


def compute_risk_score(
    lat: float,
    lon: float,
    zones: List[Dict],
    gps_signal: str = "good",          # "good" | "weak" | "lost"
    time_outside_safe: int = 0,        # seconds since exiting safe zone
    no_response_time: int = 0,         # seconds since last caregiver acknowledgement
    current_hour: int = None,          # 24-hour format, defaults to current hour
    has_anomaly: bool = False,         # whether anomaly was detected
    usual_walk_time: bool = False      # if True, reduces risk by 30%
) -> int:
    """
    Compute risk score 0-100 based on weighted factors.
    
    Factors considered:
    - Zone status (outside safe, in buffer, in restricted, near danger)
    - Time of day (night hours)
    - Duration outside safe zone
    - Caregiver response time
    - GPS signal quality
    - Behavioral anomaly
    """
    if current_hour is None:
        current_hour = datetime.now().hour
    
    risk = 0
    zone_status = get_zone_status(lat, lon, zones)
    
    # --- Zone-based risk ---
    
    # Not in any safe zone
    if not zone_status["in_safe"]:
        risk += RISK_WEIGHTS["outside_safe_zone"]
    
    # In buffer zone (early detection)
    if zone_status["in_buffer"]:
        risk += RISK_WEIGHTS["in_buffer_zone"]
    
    # In restricted zone
    if zone_status["in_restricted"]:
        risk += RISK_WEIGHTS["in_restricted_zone"]
    
    # Near danger zone (within 50m)
    if zone_status["nearest_danger_dist"] < DANGER_ZONE_PROXIMITY:
        risk += RISK_WEIGHTS["near_danger_zone"]
    
    # Inside danger zone - even higher risk
    if zone_status["in_danger"]:
        risk += RISK_WEIGHTS["near_danger_zone"]  # Stack with proximity
    
    # --- Time-based risk ---
    
    # Night hours (8pm - 6am)
    if is_night_hours(current_hour):
        risk += RISK_WEIGHTS["night_hours"]
    
    # Duration outside safe zone > 10 minutes
    if time_outside_safe > TIME_OUTSIDE_THRESHOLD:
        risk += RISK_WEIGHTS["duration_outside"]
    
    # --- Response-based risk ---
    
    # No caregiver response > 10 minutes
    if no_response_time > NO_RESPONSE_THRESHOLD:
        risk += RISK_WEIGHTS["no_caregiver_response"]
    
    # --- Device-based risk ---
    
    if gps_signal == "weak":
        risk += RISK_WEIGHTS["gps_weak"]
    elif gps_signal == "lost":
        risk += RISK_WEIGHTS["gps_weak"] * 2  # Double points for lost signal
    
    # --- Anomaly boost ---
    
    if has_anomaly:
        risk += 10  # Additional 10 points for behavioral anomaly
    
    # --- Smart zone adjustments ---
    
    # During usual walk time, reduce risk by 30%
    if usual_walk_time:
        risk = int(risk * 0.7)
    
    # Night exit multiplier (1.3x)
    if is_night_hours(current_hour) and not zone_status["in_safe"]:
        risk = int(risk * 1.3)
    
    return min(risk, 100)


def is_night_hours(hour: int) -> bool:
    """Check if current hour is within night hours (8pm - 6am)."""
    return hour >= NIGHT_START or hour < NIGHT_END


def get_risk_level(score: int) -> str:
    """Convert numeric risk score to level string."""
    if score < 20:
        return "low"
    elif score < 40:
        return "medium"
    elif score < 60:
        return "high"
    else:
        return "critical"


def get_risk_factors(
    lat: float,
    lon: float,
    zones: List[Dict],
    gps_signal: str = "good",
    time_outside_safe: int = 0,
    no_response_time: int = 0,
    current_hour: int = None,
    has_anomaly: bool = False
) -> List[str]:
    """
    Return list of active risk factors for explanation/logging.
    """
    if current_hour is None:
        current_hour = datetime.now().hour
    
    factors = []
    zone_status = get_zone_status(lat, lon, zones)
    
    if not zone_status["in_safe"]:
        factors.append("Outside safe zone")
    
    if zone_status["in_buffer"]:
        factors.append("In buffer zone")
    
    if zone_status["in_restricted"]:
        factors.append("In restricted zone")
    
    if zone_status["nearest_danger_dist"] < DANGER_ZONE_PROXIMITY:
        factors.append(f"Near danger zone ({int(zone_status['nearest_danger_dist'])}m)")
    
    if zone_status["in_danger"]:
        factors.append("INSIDE danger zone")
    
    if is_night_hours(current_hour):
        factors.append("Night hours")
    
    if time_outside_safe > TIME_OUTSIDE_THRESHOLD:
        factors.append(f"Outside for {time_outside_safe // 60} minutes")
    
    if no_response_time > NO_RESPONSE_THRESHOLD:
        factors.append(f"No response for {no_response_time // 60} minutes")
    
    if gps_signal != "good":
        factors.append(f"GPS signal {gps_signal}")
    
    if has_anomaly:
        factors.append("Behavioral anomaly detected")
    
    return factors
