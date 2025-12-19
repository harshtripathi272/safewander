"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Patient, Zone } from "@/lib/types"
import { demoZones } from "@/lib/data"
import { calculateZoneInfo, getZoneColor, getStatusColor, ZONE_COLORS, type PatientStatus } from "@/lib/zone-utils"

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

// Component to show coordinates on hover/click
function MapCoordinateTracker() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null)

  useMapEvents({
    mousemove(e) {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
    mouseout() {
      setCoords(null)
    },
    click(e) {
      setClickedCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
      setTimeout(() => setClickedCoords(null), 3000)
    },
  })

  const displayCoords = clickedCoords || coords

  if (!displayCoords) return null

  return (
    <div 
      className="absolute top-4 right-4 z-[1000] bg-[var(--bg-secondary)]/95 backdrop-blur-sm border border-[var(--border-default)] rounded-lg px-3 py-2 shadow-lg"
      style={{ pointerEvents: 'none' }}
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--text-tertiary)]">
          {clickedCoords ? '📍' : '🖱️'}
        </span>
        <span className="font-mono text-[var(--text-primary)]">
          {displayCoords.lat.toFixed(6)}, {displayCoords.lng.toFixed(6)}
        </span>
      </div>
    </div>
  )
}

export function LiveMap({ patient, zones, className }: LiveMapProps) {
  const [mapReady, setMapReady] = useState(false)

  // Use provided zones or fall back to demoZones for consistency
  const displayZones = useMemo(() => {
    return zones.length > 0 ? zones : demoZones
  }, [zones])

  // San Francisco coordinates (matching demoZones)
  const patientLat = patient?.currentPosition?.lat ?? 37.7749
  const patientLng = patient?.currentPosition?.lng ?? -122.4194
  const homeLat = 37.7749
  const homeLng = -122.4194

  // Calculate current zone using the SINGLE SOURCE OF TRUTH
  const zoneInfo = useMemo(() => {
    return calculateZoneInfo(patientLat, patientLng, displayZones)
  }, [patientLat, patientLng, displayZones])

  // Get colors from zone info
  const statusColor = getStatusColor(zoneInfo.status)
  const zoneColor = getZoneColor(zoneInfo.zoneType)

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
          <MapCoordinateTracker />

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

          {/* Patient marker - color based on current status from zone calculation */}
          <Marker position={[patientLat, patientLng]} icon={createCustomIcon(statusColor)}>
            <Popup>
              <div className="text-sm">
                <strong>{patient?.firstName} {patient?.lastName}</strong>
                <br />
                Zone: {zoneInfo.zoneDisplayName}
                <br />
                Status: {zoneInfo.status.charAt(0).toUpperCase() + zoneInfo.status.slice(1)}
                {!zoneInfo.isInSafeZone && zoneInfo.distance > 0 && (
                  <>
                    <br />
                    Distance: {Math.round(zoneInfo.distance)}m from safe zone
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
            {zoneInfo.zoneDisplayName}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {zoneInfo.zone ? (
              <>{zoneInfo.zone.radius || 100}m radius • {zoneInfo.zoneType.charAt(0).toUpperCase() + zoneInfo.zoneType.slice(1)} Zone</>
            ) : (
              <>Outside all zones • {Math.round(zoneInfo.distance)}m from safe zone</>
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
              {zoneInfo.status.toUpperCase()}
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
