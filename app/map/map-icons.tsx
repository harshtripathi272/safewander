"use client"

import { Marker, Circle, Popup } from "react-leaflet"
import L from "leaflet"
import type { Patient, Zone } from "@/lib/types"

// Custom icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 35px; height: 35px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <div style="background: white; width: 8px; height: 12px; border-radius: 2px; margin-top: -2px;"></div>
    </div>`,
    iconSize: [35, 35],
    iconAnchor: [17, 17],
  })
}

const homeIcon = L.divIcon({
  className: 'home-marker',
  html: `<div style="background-color: #3b82f6; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🏠</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

interface MapIconsProps {
  homeLat: number
  homeLng: number
  patientLat: number
  patientLng: number
  patient: Patient
  zones: Zone[]
  zoneColors: Record<string, string>
}

export default function MapIcons({ homeLat, homeLng, patientLat, patientLng, patient, zones, zoneColors }: MapIconsProps) {
  return (
    <>
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
    </>
  )
}
