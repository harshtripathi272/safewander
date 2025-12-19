// Zone utilities for consistent status calculation across all components
import type { Zone } from "./types"

export type PatientStatus = "safe" | "advisory" | "warning" | "urgent" | "emergency"

export interface ZoneInfo {
  zone: Zone | null
  status: PatientStatus
  distance: number
  closestSafeZone: Zone | null
  isInSafeZone: boolean
  zoneType: string
  zoneDisplayName: string
}

// Zone colors from ALGORITHM_SPEC.md
export const ZONE_COLORS: Record<string, string> = {
  safe: "#10b981",       // 🟢 Green
  buffer: "#3b82f6",     // 🔵 Blue
  danger: "#ef4444",     // 🔴 Red
  restricted: "#f97316", // 🟠 Orange
  routine: "#8b5cf6",    // 🟣 Purple
  trusted: "#3b82f6",    // 🔵 Blue
  unknown: "#f59e0b",    // 🟡 Yellow
}

// Status colors for patient marker and badges
export const STATUS_COLORS: Record<PatientStatus, string> = {
  safe: "#10b981",
  advisory: "#3b82f6",
  warning: "#f59e0b",
  urgent: "#f97316",
  emergency: "#ef4444",
}

// Status configuration for UI display
export const STATUS_CONFIG = {
  safe: { label: "SAFE", className: "bg-[var(--accent-primary-muted)] text-[var(--status-safe)]", icon: "🟢" },
  advisory: { label: "ADVISORY", className: "bg-blue-500/15 text-blue-500", icon: "🔵" },
  warning: { label: "WARNING", className: "bg-amber-500/15 text-[var(--status-warning)]", icon: "🟡" },
  urgent: { label: "URGENT", className: "bg-orange-500/15 text-[var(--status-urgent)]", icon: "🟠" },
  emergency: { label: "EMERGENCY", className: "bg-red-600/20 text-[var(--status-emergency)] animate-pulse", icon: "🔴" },
}

/**
 * Calculate distance between two points in meters using Haversine formula
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Handle exact same coordinates
  if (lat1 === lat2 && lng1 === lng2) return 0

  const R = 6371000 // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Determine current zone and status based on patient position
 * This is the SINGLE SOURCE OF TRUTH for patient status calculation
 * All components should use this function to ensure consistency
 */
export function calculateZoneInfo(patientLat: number, patientLng: number, zones: Zone[]): ZoneInfo {
  // Default values when no zones
  if (!zones?.length) {
    return {
      zone: null,
      status: "safe",
      distance: 0,
      closestSafeZone: null,
      isInSafeZone: true,
      zoneType: "safe",
      zoneDisplayName: "No zones configured"
    }
  }

  let currentZone: Zone | null = null
  let closestSafeZone: Zone | null = null
  let minDistanceToSafeCenter = Infinity
  let isInDanger = false
  let isInRestricted = false
  let isInSafe = false
  let isInBuffer = false
  let isInRoutine = false

  // First pass: Check all zones and find which ones the patient is inside
  for (const zone of zones) {
    if (!zone.center) continue

    const distance = calculateDistance(patientLat, patientLng, zone.center.lat, zone.center.lng)
    const zoneRadius = zone.radius || 100
    const isInside = distance <= zoneRadius

    // Track closest safe zone (by distance to center)
    if (zone.type === "safe") {
      if (distance < minDistanceToSafeCenter) {
        minDistanceToSafeCenter = distance
        closestSafeZone = zone
      }
    }

    if (isInside) {
      switch (zone.type) {
        case "danger":
          isInDanger = true
          currentZone = zone // Danger always takes priority
          break
        case "restricted":
          isInRestricted = true
          if (!isInDanger) currentZone = zone
          break
        case "buffer":
          isInBuffer = true
          if (!isInDanger && !isInRestricted && !isInSafe) currentZone = zone
          break
        case "safe":
          isInSafe = true
          if (!isInDanger && !isInRestricted) currentZone = zone
          break
        case "routine":
          isInRoutine = true
          if (!currentZone) currentZone = zone
          break
      }
    }
  }

  // Determine status based on what zones patient is in
  // Priority order: danger > restricted > safe > buffer > routine > outside
  let status: PatientStatus = "safe"

  if (isInDanger) {
    status = "emergency"
  } else if (isInRestricted) {
    status = "urgent"
  } else if (isInSafe) {
    // Patient is inside a safe zone - they are SAFE
    status = "safe"
  } else if (isInBuffer) {
    status = "advisory"
  } else if (isInRoutine) {
    // In routine zone but not safe zone
    status = "advisory"
  } else {
    // Not in any zone - check distance from closest safe zone
    if (closestSafeZone) {
      const safeZoneRadius = closestSafeZone.radius || 50
      const distanceFromSafeEdge = minDistanceToSafeCenter - safeZoneRadius

      if (distanceFromSafeEdge > 150) {
        status = "warning"
      } else if (distanceFromSafeEdge > 50) {
        status = "advisory"
      } else {
        // Very close to safe zone edge
        status = "advisory"
      }
    } else {
      status = "warning"
    }
  }

  // Determine zone type and display name
  const zoneType = currentZone?.type || (isInSafe ? "safe" : "unknown")
  const zoneDisplayName = currentZone?.name ||
    (closestSafeZone ? `Near ${closestSafeZone.name}` : "Unknown Location")

  return {
    zone: currentZone,
    status,
    distance: minDistanceToSafeCenter,
    closestSafeZone,
    isInSafeZone: isInSafe,
    zoneType,
    zoneDisplayName
  }
}

/**
 * Get the appropriate color for a zone type
 */
export function getZoneColor(zoneType: string): string {
  return ZONE_COLORS[zoneType] || ZONE_COLORS.unknown
}

/**
 * Get the appropriate color for a status
 */
export function getStatusColor(status: PatientStatus): string {
  return STATUS_COLORS[status] || STATUS_COLORS.safe
}

/**
 * Get status configuration for UI display
 */
export function getStatusConfig(status: PatientStatus) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.safe
}
