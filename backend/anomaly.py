"""
Statistical Anomaly Detection for SafeWander
Detects confusion patterns using simple statistics, not ML.
"""

from typing import List, Dict


def detect_anomaly(
    current_speed: float,
    current_duration: float,
    baseline: Dict,
    speed_threshold: float = 0.5  # m/s deviation considered anomalous
) -> bool:
    """
    Detect behavioral anomaly using simple statistics.
    
    Args:
        current_speed: Current walking speed in m/s
        current_duration: Current trip duration in seconds
        baseline: Dict with avg_speed, avg_duration, std_speed, std_duration
        speed_threshold: Threshold for speed deviation
    
    Returns:
        True if anomaly detected, False otherwise
    """
    # Duration anomaly: >2 standard deviations above average
    avg_duration = baseline.get("avg_duration", 900)
    std_duration = baseline.get("std_duration", 300)
    
    if current_duration > avg_duration + 2 * std_duration:
        return True
    
    # Speed anomaly: significant deviation from baseline
    avg_speed = baseline.get("avg_speed", 0.8)
    
    if abs(current_speed - avg_speed) > speed_threshold:
        return True
    
    return False


def count_direction_changes(headings: List[float], threshold: float = 45.0) -> int:
    """
    Count significant direction changes (confusion indicator).
    
    Args:
        headings: List of heading values in degrees (0-360)
        threshold: Minimum angle change to count as significant
    
    Returns:
        Number of significant direction changes
    """
    if len(headings) < 2:
        return 0
    
    changes = 0
    for i in range(1, len(headings)):
        diff = abs(headings[i] - headings[i-1])
        # Handle wrap-around at 360 degrees
        if diff > 180:
            diff = 360 - diff
        if diff > threshold:
            changes += 1
    
    return changes


def is_circling_pattern(locations: List[Dict], threshold_distance: float = 20.0) -> bool:
    """
    Detect if patient is exhibiting circling/confused pattern.
    Returns True if patient returns near starting point multiple times.
    
    Args:
        locations: List of location dicts with lat, lng
        threshold_distance: Distance in meters to consider "returning"
    """
    from geo_utils import haversine_distance
    
    if len(locations) < 5:
        return False
    
    start_lat = locations[0].get("lat", 0)
    start_lng = locations[0].get("lng", locations[0].get("lon", 0))
    
    returns = 0
    was_far = False
    
    for loc in locations[1:]:
        lat = loc.get("lat", 0)
        lng = loc.get("lng", loc.get("lon", 0))
        distance = haversine_distance(start_lat, start_lng, lat, lng)
        
        if distance > threshold_distance * 3:
            was_far = True
        elif was_far and distance < threshold_distance:
            returns += 1
            was_far = False
    
    # 2+ returns to start indicates potential confusion
    return returns >= 2


def calculate_wandering_score(
    direction_changes: int,
    is_circling: bool,
    duration_ratio: float  # current_duration / avg_duration
) -> int:
    """
    Calculate wandering/confusion score 0-100.
    
    Args:
        direction_changes: Number of significant direction changes
        is_circling: Whether circling pattern detected
        duration_ratio: How much longer than usual (1.0 = normal)
    
    Returns:
        Score 0-100 indicating confusion level
    """
    score = 0
    
    # Direction changes scoring (more changes = more confusion)
    if direction_changes > 10:
        score += 40
    elif direction_changes > 5:
        score += 25
    elif direction_changes > 2:
        score += 10
    
    # Circling pattern
    if is_circling:
        score += 30
    
    # Duration ratio (taking much longer than usual)
    if duration_ratio > 3.0:
        score += 30
    elif duration_ratio > 2.0:
        score += 20
    elif duration_ratio > 1.5:
        score += 10
    
    return min(score, 100)


def get_anomaly_description(
    current_speed: float,
    current_duration: float,
    baseline: Dict,
    direction_changes: int = 0
) -> List[str]:
    """
    Get human-readable descriptions of detected anomalies.
    """
    descriptions = []
    
    avg_duration = baseline.get("avg_duration", 900)
    std_duration = baseline.get("std_duration", 300)
    avg_speed = baseline.get("avg_speed", 0.8)
    
    if current_duration > avg_duration + 2 * std_duration:
        mins = int(current_duration / 60)
        avg_mins = int(avg_duration / 60)
        descriptions.append(f"Trip unusually long: {mins}min vs typical {avg_mins}min")
    
    speed_diff = current_speed - avg_speed
    if abs(speed_diff) > 0.5:
        if speed_diff > 0:
            descriptions.append(f"Moving faster than usual: {current_speed:.1f}m/s vs {avg_speed:.1f}m/s")
        else:
            descriptions.append(f"Moving slower than usual: {current_speed:.1f}m/s vs {avg_speed:.1f}m/s")
    
    if direction_changes > 5:
        descriptions.append(f"Frequent direction changes: {direction_changes} changes detected")
    
    return descriptions
