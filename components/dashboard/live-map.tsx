"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Plus, Minus, Crosshair, Layers } from "lucide-react"
import type { Patient, Zone } from "@/lib/types"

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

export function LiveMap({ patient, zones, className }: LiveMapProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  // Auto-refresh every 2 seconds for live location updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const patientLat = patient?.currentPosition?.lat ?? 40.7580
  const patientLng = patient?.currentPosition?.lng ?? -73.9855
  const homeLat = 40.7580
  const homeLng = -73.9855

  const zoneColors: Record<string, string> = {
    safe: "#10b981",
    trusted: "#3b82f6",
    routine: "#8b5cf6",
    danger: "#ef4444",
  }

  return (
    <Card className={`border-[var(--border-subtle)] bg-[var(--bg-secondary)] ${className}`}>
      <CardContent className="relative h-full min-h-[400px] overflow-hidden rounded-lg p-0">
        <MapContainer
          center={[patientLat, patientLng]}
          zoom={15}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater center={[patientLat, patientLng]} />

          {/* Home marker */}
          <Marker position={[homeLat, homeLng]} icon={homeIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Home Base</strong>
                <br />
                Reference Location
              </div>
            </Popup>
          </Marker>

          {/* Patient marker */}
          <Marker position={[patientLat, patientLng]} icon={createCustomIcon("#10b981")}>
            <Popup>
              <div className="text-sm">
                <strong>{patient?.firstName} {patient?.lastName}</strong>
                <br />
                Last update: Just now
                <br />
                Status: {patient?.status || "Active"}
              </div>
            </Popup>
          </Marker>

          {/* Geofence zones */}
          {zones.map((zone) => {
            if (!zone.center) return null
            const color = zoneColors[zone.type] || zoneColors.safe
            
            return (
              <Circle
                key={zone.id}
                center={[zone.center.lat, zone.center.lng]}
                radius={zone.radius || 100}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: zone.type === "danger" ? "5, 5" : undefined,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{zone.name}</strong>
                    <br />
                    Type: {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}
                    <br />
                    Radius: {zone.radius}m
                  </div>
                </Popup>
              </Circle>
            )
          })}
        </MapContainer>

        {/* Zone Info Overlay */}
        {patient?.currentPosition && zones.length > 0 && (
          <div className="absolute left-4 top-4 z-[1000] rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]/95 p-4 backdrop-blur-sm shadow-lg">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Current Zone</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
              {zones[0]?.name || "Unknown Zone"}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {zones[0]?.radius ? `${zones[0].radius}m radius` : "N/A"} • {zones[0]?.type ? zones[0].type.charAt(0).toUpperCase() + zones[0].type.slice(1) : "Unknown"} Zone
            </p>
            <Badge className={`mt-2 ${zones[0]?.type === 'safe'
              ? 'bg-[var(--accent-primary-muted)] text-[var(--status-safe)]'
              : zones[0]?.type === 'danger'
                ? 'bg-red-500/15 text-[var(--status-urgent)]'
                : 'bg-blue-500/15 text-blue-500'
              }`}>
              Inside Zone
            </Badge>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]/95 p-3 backdrop-blur-sm shadow-lg">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[var(--status-safe)]" />
              <span className="text-[var(--text-secondary)]">Safe Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="text-[var(--text-secondary)]">Routine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-dashed border-[var(--status-urgent)]" />
              <span className="text-[var(--text-secondary)]">Danger</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
