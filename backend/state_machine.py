"""
Finite State Machine for Alert Escalation
SAFE → ADVISORY → WARNING → URGENT → EMERGENCY
"""

from enum import Enum
from datetime import datetime
from typing import Tuple, Optional

from config import FSM_THRESHOLDS


class PatientState(str, Enum):
    SAFE = "safe"
    ADVISORY = "advisory"
    WARNING = "warning"
    URGENT = "urgent"
    EMERGENCY = "emergency"


def transition_state(
    current_state: str,
    risk_score: int,
    state_entered_at: datetime,
    near_danger: bool = False,
    caregiver_resolved: bool = False
) -> Tuple[str, Optional[str]]:
    """
    Compute FSM state transition based on risk score and conditions.
    
    Args:
        current_state: Current patient state (string)
        risk_score: Current risk score (0-100)
        state_entered_at: When current state was entered
        near_danger: Whether patient is near danger zone
        caregiver_resolved: Whether caregiver has manually resolved
    
    Returns:
        Tuple of (new_state, alert_message)
        alert_message is None if no transition occurred
    """
    # Convert string to enum if needed
    try:
        current = PatientState(current_state.lower())
    except ValueError:
        current = PatientState.SAFE
    
    # Manual override - caregiver resolves always returns to SAFE
    if caregiver_resolved:
        return PatientState.SAFE.value, "Caregiver resolved situation - returning to safe state"
    
    time_in_state = (datetime.utcnow() - state_entered_at).total_seconds()
    
    new_state = current
    alert_message = None
    
    if current == PatientState.SAFE:
        # SAFE → ADVISORY: Risk reaches 20
        if risk_score >= FSM_THRESHOLDS["safe_to_advisory"]:
            new_state = PatientState.ADVISORY
            alert_message = f"Risk elevated to {risk_score} - entering advisory mode"
    
    elif current == PatientState.ADVISORY:
        # ADVISORY → WARNING: Risk 40+ for 5 minutes
        if risk_score >= FSM_THRESHOLDS["advisory_to_warning"]:
            if time_in_state > FSM_THRESHOLDS["advisory_hold_time"]:
                new_state = PatientState.WARNING
                alert_message = f"Sustained risk ({risk_score}) for {int(time_in_state/60)}min - entering warning mode"
        # Can also de-escalate back to SAFE
        elif risk_score < FSM_THRESHOLDS["safe_to_advisory"]:
            new_state = PatientState.SAFE
            alert_message = "Risk normalized - returning to safe state"
    
    elif current == PatientState.WARNING:
        # WARNING → URGENT: Risk 60+ OR near danger zone
        if risk_score >= FSM_THRESHOLDS["warning_to_urgent"] or near_danger:
            new_state = PatientState.URGENT
            reason = "near danger zone" if near_danger else f"high risk ({risk_score})"
            alert_message = f"⚠️ {reason.upper()} - entering urgent mode"
        # Can de-escalate to ADVISORY
        elif risk_score < FSM_THRESHOLDS["advisory_to_warning"]:
            new_state = PatientState.ADVISORY
            alert_message = "Risk decreased - returning to advisory mode"
    
    elif current == PatientState.URGENT:
        # URGENT → EMERGENCY: Risk 80+ for 10 minutes
        if risk_score >= FSM_THRESHOLDS["urgent_to_emergency"]:
            if time_in_state > FSM_THRESHOLDS["urgent_hold_time"]:
                new_state = PatientState.EMERGENCY
                alert_message = f"🚨 EMERGENCY: Critical risk ({risk_score}) sustained for {int(time_in_state/60)}min - immediate action required"
        # Can de-escalate to WARNING
        elif risk_score < FSM_THRESHOLDS["warning_to_urgent"] and not near_danger:
            new_state = PatientState.WARNING
            alert_message = "Risk decreased - returning to warning mode"
    
    elif current == PatientState.EMERGENCY:
        # EMERGENCY can only be resolved by caregiver (handled above)
        # Or auto de-escalate if risk drops significantly
        if risk_score < FSM_THRESHOLDS["advisory_to_warning"] and not near_danger:
            new_state = PatientState.WARNING
            alert_message = "Risk decreased significantly - de-escalating from emergency"
    
    return new_state.value, alert_message


def state_to_alert_level(state: str) -> str:
    """Map FSM state to alert level for API compatibility."""
    mapping = {
        "safe": "low",
        "advisory": "low",
        "warning": "medium",
        "urgent": "high",
        "emergency": "critical",
    }
    return mapping.get(state.lower(), "low")


def get_state_priority(state: str) -> int:
    """Get numeric priority for state comparison (higher = more urgent)."""
    priorities = {
        "safe": 0,
        "advisory": 1,
        "warning": 2,
        "urgent": 3,
        "emergency": 4,
    }
    return priorities.get(state.lower(), 0)


def should_create_alert(old_state: str, new_state: str) -> bool:
    """Determine if state transition should create an alert."""
    old_priority = get_state_priority(old_state)
    new_priority = get_state_priority(new_state)
    
    # Create alert for escalations and significant de-escalations
    return old_priority != new_priority


def get_state_description(state: str) -> str:
    """Get human-readable description of state."""
    descriptions = {
        "safe": "Patient is in a safe zone with normal activity",
        "advisory": "Patient activity being monitored - minor risk detected",
        "warning": "Patient may be wandering - caregiver attention recommended",
        "urgent": "Patient at risk - immediate caregiver response required",
        "emergency": "EMERGENCY - Patient missing or in danger - activate search protocol",
    }
    return descriptions.get(state.lower(), "Unknown state")
