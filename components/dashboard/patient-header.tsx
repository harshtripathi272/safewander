import { useEffect, useState, useMemo } from "react"
import type { Patient, Zone } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Battery, Signal, MapPin, History, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PatientHeaderProps {
  patient: Patient
  zones?: Zone[]
  currentZoneName?: string
  riskScore?: number
}

const statusConfig = {
  safe: { label: "SAFE", className: "bg-[var(--accent-primary-muted)] text-[var(--status-safe)]", icon: "🟢" },
  advisory: { label: "ADVISORY", className: "bg-amber-500/15 text-[var(--status-advisory)]", icon: "🟡" },
  warning: { label: "WARNING", className: "bg-orange-500/15 text-[var(--status-warning)]", icon: "🟠" },
  urgent: { label: "URGENT", className: "bg-red-500/15 text-[var(--status-urgent)]", icon: "🔴" },
  emergency: { label: "EMERGENCY", className: "bg-red-600/20 text-[var(--status-emergency)] animate-pulse", icon: "🆘" },
}

// Calculate distance between two points in meters (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Handle exact same coordinates
  if (lat1 === lat2 && lng1 === lng2) return 0
  
  const R = 6371000 // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Determine current zone based on patient position
function getCurrentZone(patientLat: number, patientLng: number, zones: Zone[]): { 
  zone: Zone | null; 
  status: string; 
  distance: number;
  closestSafeZone: Zone | null;
  isInSafeZone: boolean;
} {
  if (!zones?.length) {
    return { zone: null, status: "safe", distance: 0, closestSafeZone: null, isInSafeZone: true }
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

    console.log(`[ZoneCheck] ${zone.name}: distance=${distance.toFixed(1)}m, radius=${zoneRadius}m, inside=${isInside}`)

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
  let status = "safe"
  
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

  console.log(`[ZoneResult] isInSafe=${isInSafe}, isInDanger=${isInDanger}, status=${status}, zone=${currentZone?.name}`)

  return { 
    zone: currentZone, 
    status, 
    distance: minDistanceToSafeCenter,
    closestSafeZone,
    isInSafeZone: isInSafe
  }
}

export function PatientHeader({ patient, zones = [], currentZoneName, riskScore }: PatientHeaderProps) {
  // Get current position - use defaults if not available
  const patientLat = patient?.currentPosition?.lat ?? 37.7749
  const patientLng = patient?.currentPosition?.lng ?? -122.4194

  // Calculate zone info using useMemo - recalculates when position or zones change
  const currentZoneInfo = useMemo(() => {
    console.log('[PatientHeader] Recalculating zone for position:', patientLat, patientLng)
    return getCurrentZone(patientLat, patientLng, zones)
  }, [patientLat, patientLng, zones])

  // Use calculated status or fall back to patient status
  const effectiveStatus = currentZoneInfo.status || patient?.status || "safe"
  const statusInfo = statusConfig[effectiveStatus as keyof typeof statusConfig] || statusConfig.safe
  const device = patient?.device ?? { batteryLevel: 0, signalStrength: "none" }

  // Determine zone display name
  const zoneDisplayName = currentZoneName || currentZoneInfo.zone?.name || 
    (currentZoneInfo.closestSafeZone ? `Near ${currentZoneInfo.closestSafeZone.name}` : "Unknown Location")
  const zoneType = currentZoneInfo.zone?.type || (effectiveStatus === "safe" ? "safe" : "unknown")

  // Log for debugging
  useEffect(() => {
    console.log('[PatientHeader] Zone updated:', {
      position: { lat: patientLat, lng: patientLng },
      zone: currentZoneInfo.zone?.name,
      status: effectiveStatus,
      distance: currentZoneInfo.distance
    })
  }, [patientLat, patientLng, currentZoneInfo, effectiveStatus])

  return (
    <div className={cn(
      "flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6 transition-all duration-500",
      effectiveStatus === "emergency" 
        ? "border-red-500/50 bg-red-500/10 animate-pulse" 
        : effectiveStatus === "urgent"
          ? "border-orange-500/30 bg-orange-500/5"
          : effectiveStatus === "warning"
            ? "border-yellow-500/30 bg-yellow-500/5"
            : effectiveStatus === "advisory"
              ? "border-blue-500/30 bg-blue-500/5"
              : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
    )}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar
            className={cn(
              "h-16 w-16 border-[3px] transition-all duration-300",
              effectiveStatus === "safe"
                ? "border-[var(--status-safe)]"
                : effectiveStatus === "emergency"
                  ? "border-red-500 animate-pulse"
                  : effectiveStatus === "urgent"
                    ? "border-orange-500"
                    : effectiveStatus === "advisory"
                      ? "border-blue-500"
                      : "border-[var(--status-warning)]",
            )}
          >
            <AvatarImage
              src={patient?.photo && patient.photo !== "string" ? patient.photo : "/placeholder.svg"}
            />
            <AvatarFallback>
              {patient?.firstName?.[0] || ""}{patient?.lastName?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          {/* Status indicator dot */}
          <span className={cn(
            "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[var(--bg-secondary)]",
            effectiveStatus === "safe" ? "bg-green-500" :
            effectiveStatus === "advisory" ? "bg-blue-500" :
            effectiveStatus === "warning" ? "bg-orange-500" :
            effectiveStatus === "urgent" ? "bg-red-500" :
            "bg-red-600 animate-ping"
          )} />
        </div>

        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
              {patient?.firstName || ""} {patient?.lastName || ""}
            </h2>
            <Badge className={cn("uppercase tracking-wide font-bold", statusInfo.className)}>
              <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
              LIVE: {statusInfo.label}
            </Badge>
            {riskScore !== undefined && riskScore > 0 && (
              <Badge variant="outline" className="text-xs">
                Risk: {riskScore}%
              </Badge>
            )}
          </div>
          
          {/* Dynamic Zone Display */}
          <div className="mt-1 flex items-center gap-2 text-sm">
            <MapPin className={cn(
              "h-4 w-4",
              zoneType === "danger" ? "text-red-500" :
              zoneType === "restricted" ? "text-orange-500" :
              zoneType === "safe" ? "text-green-500" :
              zoneType === "buffer" ? "text-blue-500" :
              zoneType === "routine" ? "text-purple-500" :
              "text-yellow-500"
            )} />
            <span className={cn(
              "font-medium",
              zoneType === "danger" ? "text-red-500" :
              zoneType === "restricted" ? "text-orange-500" :
              zoneType === "safe" ? "text-green-500" :
              zoneType === "buffer" ? "text-blue-500" :
              zoneType === "routine" ? "text-purple-500" :
              "text-yellow-500"
            )}>
              {zoneDisplayName}
            </span>
            <span className="text-[var(--text-tertiary)]">•</span>
            <span className="text-[var(--text-secondary)] capitalize">
              {zoneType === "unknown" ? "Outside Safe Zone" : `${zoneType} Zone`}
            </span>
            {currentZoneInfo.distance > 0 && zoneType !== "safe" && (
              <>
                <span className="text-[var(--text-tertiary)]">•</span>
                <span className="text-[var(--text-tertiary)]">
                  {Math.round(currentZoneInfo.distance)}m from safe zone
                </span>
              </>
            )}
          </div>

          {/* Warning message for non-safe states */}
          {effectiveStatus !== "safe" && (
            <div className={cn(
              "mt-2 flex items-center gap-2 text-xs font-medium",
              effectiveStatus === "emergency" ? "text-red-500" :
              effectiveStatus === "urgent" ? "text-orange-500" :
              effectiveStatus === "warning" ? "text-yellow-600" :
              "text-blue-500"
            )}>
              <AlertTriangle className="h-3 w-3" />
              {effectiveStatus === "emergency" && "EMERGENCY: Patient in danger zone! Immediate action required."}
              {effectiveStatus === "urgent" && "URGENT: Patient in restricted area or approaching danger."}
              {effectiveStatus === "warning" && "WARNING: Patient has left the safe zone."}
              {effectiveStatus === "advisory" && "Advisory: Patient near safe zone boundary or in buffer zone."}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Device Status */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Battery
              className={cn(
                "h-4 w-4",
                device.batteryLevel > 50 ? "text-[var(--status-safe)]" :
                device.batteryLevel > 20 ? "text-[var(--status-warning)]" :
                "text-[var(--status-urgent)]",
              )}
            />
            <span className="text-[var(--text-secondary)]">{device.batteryLevel}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Signal className={cn(
              "h-4 w-4",
              device.signalStrength === "strong" ? "text-[var(--status-safe)]" :
              device.signalStrength === "weak" ? "text-[var(--status-warning)]" :
              "text-[var(--text-tertiary)]"
            )} />
            <span className="text-[var(--text-secondary)] capitalize">{device.signalStrength || "Unknown"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-[var(--border-default)] bg-transparent">
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          {effectiveStatus !== "safe" && (
            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Respond
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
