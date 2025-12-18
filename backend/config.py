"""
SafeWander Configuration
All weights, thresholds, and defaults are configurable here.
"""

# Risk Scoring Weights (per algorithm spec)
RISK_WEIGHTS = {
    "outside_safe_zone": 30,
    "near_danger_zone": 40,      # <50m from danger
    "night_hours": 15,           # 8pm-6am
    "duration_outside": 20,      # >10 min outside
    "no_caregiver_response": 25, # >10 min no ack
    "gps_weak": 10,
    "in_buffer_zone": 10,
    "in_restricted_zone": 25,
}

# FSM Transition Thresholds
FSM_THRESHOLDS = {
    "safe_to_advisory": 20,
    "advisory_to_warning": 40,
    "warning_to_urgent": 60,
    "urgent_to_emergency": 80,
    "advisory_hold_time": 300,   # 5 min in seconds
    "urgent_hold_time": 600,     # 10 min in seconds
}

# Zone Defaults (meters)
ZONE_DEFAULTS = {
    "safe_radius": 100,
    "buffer_offset": 50,         # auto-generated around safe zones
    "danger_radius": 50,
    "restricted_radius": 75,
}

# Night hours range (24-hour format)
NIGHT_START = 20  # 8pm
NIGHT_END = 6     # 6am

# GPS noise handling
GPS_CONSECUTIVE_SAMPLES = 3     # require 3 samples outside zone before trigger
GPS_MOVING_AVERAGE_WINDOW = 5   # use last 5 samples for smoothing

# Search radius factors
TERRAIN_FACTOR = 1.0
MOBILITY_FACTORS = {
    "high": 1.2,
    "medium": 1.0,
    "low": 0.5,
    "wheelchair": 0.3,
}

# Monitoring loop interval (seconds)
LOOP_INTERVAL = 5

# Default patient walking speed (m/s)
DEFAULT_WALK_SPEED = 0.8

# Danger zone proximity threshold (meters)
DANGER_ZONE_PROXIMITY = 50

# Duration thresholds (seconds)
TIME_OUTSIDE_THRESHOLD = 600    # 10 minutes
NO_RESPONSE_THRESHOLD = 600     # 10 minutes

# Anomaly detection
SPEED_DEVIATION_THRESHOLD = 0.5  # m/s
DURATION_STD_MULTIPLIER = 2      # standard deviations
