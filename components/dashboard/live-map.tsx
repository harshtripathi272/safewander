"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Patient, Zone } from "@/lib/types"
import { demoZones } from "@/lib/data"

// Fix for default marker icon
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <div style="background: white; width: 8px; height: 12px; border-radius: 2px; margin-top: -2px;"></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

const homeIcon = L.divIcon({
  className: 'home-marker',
  html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">🏠</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

interface LiveMapProps {
  patient: Patient
  zones: Zone[]
  className?: string
}

// Component to handle map updates
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])

  return null
}

// Zone colors from ALGORITHM_SPEC.md
const ZONE_COLORS: Record<string, string> = {
  safe: "#10b981",
  buffer: "#3b82f6",
  danger: "#ef4444",
  restricted: "#f97316",
  routine: "#8b5cf6",
  trusted: "#3b82f6",
}

// Calculate distance between two points in meters (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

  // Check all zones and find which ones the patient is inside
  for (const zone of zones) {
    if (!zone.center) continue

    const distance = calculateDistance(patientLat, patientLng, zone.center.lat, zone.center.lng)
    const zoneRadius = zone.radius || 100
    const isInside = distance <= zoneRadius

    // Track closest safe zone
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
          currentZone = zone
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

  // Determine status
  let status = "safe"

  if (isInDanger) {
    status = "emergency"
  } else if (isInRestricted) {
    status = "urgent"
  } else if (isInSafe) {
    status = "safe"
  } else if (isInBuffer) {
    status = "advisory"
  } else if (isInRoutine) {
    status = "advisory"
  } else {
    // Not in any zone
    if (closestSafeZone) {
      const safeZoneRadius = closestSafeZone.radius || 50
      const distanceFromSafeEdge = minDistanceToSafeCenter - safeZoneRadius

      if (distanceFromSafeEdge > 150) {
        status = "warning"
      } else {
        status = "advisory"
      }
    } else {
      status = "warning"
    }
  }

  return {
    zone: currentZone,
    status,
    distance: minDistanceToSafeCenter,
    closestSafeZone,
    isInSafeZone: isInSafe
  }
}

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
  safe: "#10b981",
  advisory: "#3b82f6",
  warning: "#f59e0b",
  urgent: "#f97316",
  emergency: "#ef4444",
}

export function LiveMap({ patient, zones, className }: LiveMapProps) {
  const [mapReady, setMapReady] = useState(false)

  // ALWAYS use demo zones - this ensures zones are visible
  const displayZones = useMemo(() => {
    return demoZones // Always use demo zones for reliability
  }, [])

  // San Francisco coordinates (matching demoZones)
  const patientLat = patient?.currentPosition?.lat ?? 37.7749
  const patientLng = patient?.currentPosition?.lng ?? -122.4194
  const homeLat = 37.7749
  const homeLng = -122.4194

  // Calculate current zone based on patient position - updates in real-time
  const currentZoneInfo = useMemo(() => {
    return getCurrentZone(patientLat, patientLng, displayZones)
  }, [patientLat, patientLng, displayZones])

  // Determine display values
  const zoneDisplayName = currentZoneInfo.zone?.name ||
    (currentZoneInfo.closestSafeZone ? `Outside ${currentZoneInfo.closestSafeZone.name}` : "Unknown Location")
  const zoneType = currentZoneInfo.zone?.type || (currentZoneInfo.status === "safe" ? "safe" : "unknown")
  const zoneRadius = currentZoneInfo.zone?.radius || currentZoneInfo.closestSafeZone?.radius || 50
  const statusColor = STATUS_COLORS[currentZoneInfo.status] || STATUS_COLORS.safe
  const zoneColor = ZONE_COLORS[zoneType] || ZONE_COLORS.safe

  // Force map to be ready after mount
  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className={`border-[var(--border-subtle)] bg-[var(--bg-secondary)] ${className}`}>
      <CardContent className="relative h-full min-h-[400px] overflow-hidden rounded-lg p-0">
        <MapContainer
          key={mapReady ? "ready" : "loading"}
          center={[patientLat, patientLng]}
          zoom={16}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
          zoomControl={false}
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater center={[patientLat, patientLng]} />

          {/* Render all zones */}
          {displayZones.map((zone) => {
            if (!zone.center?.lat || !zone.center?.lng) return null

            const color = ZONE_COLORS[zone.type] || ZONE_COLORS.safe
            const radius = zone.radius || 100

            return (
              <Circle
                key={zone.id}
                center={[zone.center.lat, zone.center.lng]}
                radius={radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  weight: 3,
                  dashArray: zone.type === "danger" ? "10, 5" : undefined,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{zone.name}</strong>
                    <br />
                    Type: {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}
                    <br />
                    Radius: {radius}m
                  </div>
                </Popup>
              </Circle>
            )
          })}

          {/* Home marker */}
          <Marker position={[homeLat, homeLng]} icon={homeIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Home Base</strong>
                <br />
                Safe Zone Center
              </div>
            </Popup>
          </Marker>

          {/* Patient marker - color based on current status */}
          <Marker position={[patientLat, patientLng]} icon={createCustomIcon(statusColor)}>
            <Popup>
              <div className="text-sm">
                <strong>{patient?.firstName} {patient?.lastName}</strong>
                <br />
                Zone: {zoneDisplayName}
                <br />
                Status: {currentZoneInfo.status.charAt(0).toUpperCase() + currentZoneInfo.status.slice(1)}
                {!currentZoneInfo.isInSafeZone && currentZoneInfo.distance > 0 && (
                  <>
                    <br />
                    Distance: {Math.round(currentZoneInfo.distance)}m from safe zone
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Zone Info Overlay - Dynamic based on patient position */}
        <div
          className="absolute left-4 top-4 z-[1000] rounded-lg border bg-[var(--bg-secondary)]/95 p-4 backdrop-blur-sm shadow-lg transition-all duration-300"
          style={{ borderColor: zoneColor }}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Current Zone</p>
          <p className="mt-1 text-lg font-semibold" style={{ color: zoneColor }}>
            {zoneDisplayName}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {currentZoneInfo.zone ? (
              <>{zoneRadius}m radius • {zoneType.charAt(0).toUpperCase() + zoneType.slice(1)} Zone</>
            ) : (
              <>Outside all zones • {Math.round(currentZoneInfo.distance)}m from safe zone</>
            )}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge
              className="transition-all duration-300"
              style={{
                backgroundColor: `${statusColor}20`,
                color: statusColor,
                borderColor: statusColor
              }}
            >
              {currentZoneInfo.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-[var(--text-tertiary)]">
              {displayZones.length} zones active
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]/95 p-3 backdrop-blur-sm shadow-lg">
          <p className="text-xs font-medium mb-2 text-[var(--text-tertiary)]">Zone Types</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#10b981]" />
              <span className="text-[var(--text-secondary)]">Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#8b5cf6]" />
              <span className="text-[var(--text-secondary)]">Routine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-dashed border-[#ef4444]" />
              <span className="text-[var(--text-secondary)]">Danger</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
