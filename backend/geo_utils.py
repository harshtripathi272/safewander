"""
Geospatial Utilities for SafeWander
Haversine distance, point-in-circle, zone detection, GPS noise handling.
"""

import math
from typing import List, Tuple, Optional, Dict

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance in meters between two GPS coordinates using Haversine formula.
    """
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


def point_in_circle(point_lat: float, point_lon: float, 
                    center_lat: float, center_lon: float, radius: float) -> bool:
    """
    Check if a point is inside a circular zone.
    """
    distance = haversine_distance(point_lat, point_lon, center_lat, center_lon)
    return distance <= radius


def get_zone_status(lat: float, lon: float, zones: List[Dict]) -> Dict:
    """
    Determine which zone(s) the point is in.
    Zones should have: type, center (dict with lat/lng), radius
    
    Returns:
        {
            "in_safe": bool,
            "in_buffer": bool,
            "in_danger": bool,
            "in_restricted": bool,
            "nearest_danger_dist": float (meters, inf if no danger zones),
            "current_zone_name": str or None
        }
    """
    result = {
        "in_safe": False,
        "in_buffer": False,
        "in_danger": False,
        "in_restricted": False,
        "nearest_danger_dist": float('inf'),
        "current_zone_name": None,
    }
    
    for zone in zones:
        if not zone.get("center"):
            continue
            
        center_lat = zone["center"].get("lat", 0)
        center_lon = zone["center"].get("lng", zone["center"].get("lon", 0))
        radius = zone.get("radius", 100)
        zone_type = zone.get("type", "safe").lower()
        
        distance = haversine_distance(lat, lon, center_lat, center_lon)
        
        if zone_type == "danger":
            if distance < result["nearest_danger_dist"]:
                result["nearest_danger_dist"] = distance
            if distance <= radius:
                result["in_danger"] = True
                result["current_zone_name"] = zone.get("name", "Danger Zone")
        
        elif zone_type == "safe":
            if distance <= radius:
                result["in_safe"] = True
                result["current_zone_name"] = zone.get("name", "Safe Zone")
        
        elif zone_type == "buffer":
            if distance <= radius:
                result["in_buffer"] = True
                if not result["current_zone_name"]:
                    result["current_zone_name"] = zone.get("name", "Buffer Zone")
        
        elif zone_type == "restricted":
            if distance <= radius:
                result["in_restricted"] = True
                result["current_zone_name"] = zone.get("name", "Restricted Zone")
    
    return result


def moving_average_location(locations: List[Dict], window: int = 5) -> Tuple[float, float]:
    """
    Calculate moving average of last N GPS samples for noise reduction.
    Each location should have 'lat' and 'lng' keys.
    """
    if not locations:
        return (0.0, 0.0)
    
    recent = locations[-window:] if len(locations) >= window else locations
    
    avg_lat = sum(loc.get("lat", 0) for loc in recent) / len(recent)
    avg_lng = sum(loc.get("lng", loc.get("lon", 0)) for loc in recent) / len(recent)
    
    return (avg_lat, avg_lng)


def check_consecutive_outside(locations: List[Dict], center_lat: float, 
                               center_lon: float, radius: float, n: int = 3) -> bool:
    """
    Require N consecutive samples outside zone before triggering.
    Returns True if last N locations are ALL outside the zone.
    """
    if len(locations) < n:
        return False
    
    recent = locations[-n:]
    
    for loc in recent:
        lat = loc.get("lat", 0)
        lon = loc.get("lng", loc.get("lon", 0))
        if point_in_circle(lat, lon, center_lat, center_lon, radius):
            return False  # At least one location is inside
    
    return True  # All N locations are outside


def calculate_speed(loc1: Dict, loc2: Dict) -> float:
    """
    Calculate speed in m/s between two location records.
    Each location should have lat, lng, and timestamp.
    """
    from datetime import datetime
    
    lat1, lon1 = loc1.get("lat", 0), loc1.get("lng", loc1.get("lon", 0))
    lat2, lon2 = loc2.get("lat", 0), loc2.get("lng", loc2.get("lon", 0))
    
    distance = haversine_distance(lat1, lon1, lat2, lon2)
    
    # Parse timestamps
    t1 = loc1.get("timestamp")
    t2 = loc2.get("timestamp")
    
    if isinstance(t1, str):
        t1 = datetime.fromisoformat(t1.replace('Z', '+00:00'))
    if isinstance(t2, str):
        t2 = datetime.fromisoformat(t2.replace('Z', '+00:00'))
    
    if t1 and t2:
        time_diff = abs((t2 - t1).total_seconds())
        if time_diff > 0:
            return distance / time_diff
    
    return 0.0


def get_heading(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate heading (bearing) in degrees from point 1 to point 2.
    Returns value between 0 and 360.
    """
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    dlon = lon2 - lon1
    x = math.sin(dlon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    
    heading = math.atan2(x, y)
    heading = math.degrees(heading)
    heading = (heading + 360) % 360
    
    return heading
