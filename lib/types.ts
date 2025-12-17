export type PatientStatus = "safe" | "advisory" | "warning" | "urgent" | "emergency"
export type AlertSeverity = "low" | "medium" | "high" | "critical"
export type AlertStatus = "active" | "acknowledged" | "resolved" | "escalated"
export type ZoneType = "safe" | "trusted" | "routine" | "danger"

export interface Patient {
  id: string
  firstName: string
  lastName: string
  photo: string
  dateOfBirth: string
  height: string
  weight: string
  eyeColor: string
  hairColor: string
  distinguishingFeatures: string
  diagnosis: string
  conditions: string[]
  medications: { name: string; dosage: string; frequency: string }[]
  allergies: string[]
  bloodType: string
  wanderingTriggers: string[]
  calmingStrategies: string[]
  communicationAbility: "full" | "limited" | "nonverbal"
  mobilityLevel: "high" | "medium" | "low" | "wheelchair"
  device: {
    id: string
    name: string
    batteryLevel: number
    signalStrength: "strong" | "weak" | "none"
    lastUpdate: string
  }
  currentPosition: { lat: number; lng: number }
  currentZone: string
  status: PatientStatus
  emergencyContacts: {
    id: string
    name: string
    relationship: string
    phone: string
    isPrimary: boolean
  }[]
}

export interface Zone {
  id: string
  patientId: string
  name: string
  type: ZoneType
  shape: "circle" | "polygon"
  center: { lat: number; lng: number }
  radius: number
  coordinates?: { lat: number; lng: number }[]
  isActive: boolean
  color: string
}

export interface Alert {
  id: string
  patientId: string
  type: "zone_exit" | "fall" | "door_open" | "vitals" | "battery" | "signal_lost"
  severity: AlertSeverity
  status: AlertStatus
  title: string
  description: string
  triggeredAt: string
  triggeredLocation: { lat: number; lng: number }
  escalationLevel: number
  escalationHistory: {
    level: number
    triggeredAt: string
    action: string
    recipient: string
  }[]
  resolvedAt?: string
  resolvedBy?: string
  resolution?: string
}

export interface ActivityEvent {
  id: string
  patientId: string
  type: "zone_enter" | "zone_exit" | "alert" | "check_in" | "vitals"
  title: string
  description: string
  timestamp: string
  zone?: string
}
