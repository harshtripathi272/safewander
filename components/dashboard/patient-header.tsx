"use client"

import { useEffect, useMemo } from "react"
import type { Patient, Zone } from "@/lib/types"
import { demoZones } from "@/lib/data"
import { calculateZoneInfo, getStatusConfig, getZoneColor, getStatusColor, type PatientStatus } from "@/lib/zone-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Battery, Signal, MapPin, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PatientHeaderProps {
  patient: Patient
  zones?: Zone[]
  currentZoneName?: string
  riskScore?: number
}

export function PatientHeader({ patient, zones = [], currentZoneName, riskScore }: PatientHeaderProps) {
  // Get current position - use defaults if not available
  const patientLat = patient?.currentPosition?.lat ?? 37.7749
  const patientLng = patient?.currentPosition?.lng ?? -122.4194

  // Use provided zones or fall back to demoZones for consistency
  const displayZones = zones.length > 0 ? zones : demoZones

  // Calculate zone info using the SINGLE SOURCE OF TRUTH
  const zoneInfo = useMemo(() => {
    console.log('[PatientHeader] Calculating zone for position:', patientLat, patientLng)
    return calculateZoneInfo(patientLat, patientLng, displayZones)
  }, [patientLat, patientLng, displayZones])

  // Get status configuration
  const effectiveStatus = zoneInfo.status
  const statusInfo = getStatusConfig(effectiveStatus)
  const device = patient?.device ?? { batteryLevel: 0, signalStrength: "none" }

  // Use override zone name if provided, otherwise use calculated
  const zoneDisplayName = currentZoneName || zoneInfo.zoneDisplayName
  const zoneType = zoneInfo.zoneType
  const zoneColor = getZoneColor(zoneType)

  // Log for debugging
  useEffect(() => {
    console.log('[PatientHeader] Zone updated:', {
      position: { lat: patientLat, lng: patientLng },
      zone: zoneInfo.zone?.name,
      status: effectiveStatus,
      distance: zoneInfo.distance
    })
  }, [patientLat, patientLng, zoneInfo, effectiveStatus])

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
                effectiveStatus === "warning" ? "bg-amber-500" :
                  effectiveStatus === "urgent" ? "bg-orange-500" :
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
            <MapPin className="h-4 w-4" style={{ color: zoneColor }} />
            <span className="font-medium" style={{ color: zoneColor }}>
              {zoneDisplayName}
            </span>
            <span className="text-[var(--text-tertiary)]">•</span>
            <span className="text-[var(--text-secondary)] capitalize">
              {zoneType === "unknown" ? "Outside Safe Zone" : `${zoneType} Zone`}
            </span>
            {zoneInfo.distance > 0 && !zoneInfo.isInSafeZone && (
              <>
                <span className="text-[var(--text-tertiary)]">•</span>
                <span className="text-[var(--text-tertiary)]">
                  {Math.round(zoneInfo.distance)}m from safe zone
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
                  effectiveStatus === "warning" ? "text-amber-600" :
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
      </div>
    </div>
  )
}
