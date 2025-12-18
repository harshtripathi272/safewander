"use client"

import dynamic from "next/dynamic"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MapPin, History, Phone, Pencil } from "lucide-react"
import { demoPatient, demoZones } from "@/lib/data"
import { cn } from "@/lib/utils"

// Dynamically import the map container with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

// Import Leaflet and map updater dynamically
const MapUpdaterComponent = dynamic(() => import("./map-updater"), { ssr: false })
const MapIcons = dynamic(() => import("./map-icons"), { ssr: false })

export default function MapPage() {
  const patientLat = demoPatient?.currentPosition?.lat ?? 40.7580
  const patientLng = demoPatient?.currentPosition?.lng ?? -73.9855
  const homeLat = 40.7580
  const homeLng = -73.9855

  const zoneColors: Record<string, string> = {
    safe: "#10b981",
    trusted: "#3b82f6",
    routine: "#8b5cf6",
    danger: "#ef4444",
  }

  return (
    <AppShell title="Live Map">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <Input
              placeholder="Search patient or zone..."
              className="h-10 border-[var(--border-default)] bg-[var(--bg-tertiary)] pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="bg-[var(--accent-primary-muted)] text-[var(--accent-primary)]">
              All Zones
            </Button>
            <Button
              variant="outline"
              className="border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent"
            >
              <span className="mr-2 h-2 w-2 rounded-full bg-[var(--status-safe)]" />
              Safe
            </Button>
            <Button
              variant="outline"
              className="border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent"
            >
              <span className="mr-2 h-2 w-2 rounded-full bg-purple-500" />
              Routine
            </Button>
            <Button
              variant="outline"
              className="border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent"
            >
              <span className="mr-2 h-2 w-2 rounded-full bg-[var(--status-urgent)]" />
              Danger
            </Button>
          </div>
        </div>

        {/* Full Map */}
        <div className="relative h-[calc(100vh-220px)] overflow-hidden rounded-xl border border-[var(--border-subtle)]">
          {typeof window !== 'undefined' && (
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
              
              <MapUpdaterComponent center={[patientLat, patientLng]} />
              <MapIcons 
                homeLat={homeLat}
                homeLng={homeLng}
                patientLat={patientLat}
                patientLng={patientLng}
                patient={demoPatient}
                zones={demoZones}
                zoneColors={zoneColors}
              />
            </MapContainer>
          )}

          {/* Live Tracking Card */}
          <Card className="absolute bottom-6 left-6 z-[1000] w-80 border-[var(--border-default)] bg-[var(--bg-secondary)]/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs font-medium uppercase tracking-wide text-red-400">Live Tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-[var(--status-safe)]">
                  <AvatarImage src={demoPatient.photo || "/placeholder.svg"} />
                  <AvatarFallback>ER</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {demoPatient.firstName} {demoPatient.lastName}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">Last update: Just now</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin className="h-4 w-4" />
                <span>Elm Street, Safe Zone</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-[var(--border-default)] bg-transparent">
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
                <Button size="sm" className="flex-1 bg-[var(--accent-primary)]">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Geofences Card */}
          <Card className="absolute bottom-6 right-6 z-[1000] w-72 border-[var(--border-default)] bg-[var(--bg-secondary)]/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-primary)]">Active Geofences</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoZones.map((zone) => (
                <div
                  key={zone.id}
                  className={cn(
                    "rounded-lg border-l-4 bg-[var(--bg-tertiary)] p-3",
                    zone.type === "safe" && "border-l-[var(--status-safe)]",
                    zone.type === "routine" && "border-l-purple-500",
                    zone.type === "danger" && "border-l-[var(--status-urgent)]",
                  )}
                >
                  <p className="text-sm font-medium text-[var(--text-primary)]">{zone.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} Zone • {zone.radius}m radius
                  </p>
                </div>
              ))}
              <Button variant="outline" className="mt-2 w-full border-[var(--border-default)] bg-transparent">
                <Pencil className="mr-2 h-4 w-4" />
                Edit All Zones
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
