"use client"

import { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MapPin, History, Phone, Pencil, Users, ChevronDown, Trash2, X } from "lucide-react"
import { demoPatient, demoZones } from "@/lib/data"
import { cn } from "@/lib/utils"
import { usePatients } from "@/lib/hooks/use-patients"
import { useZones } from "@/lib/hooks/use-tracking"
import { calculateZoneInfo, getStatusConfig, ZONE_COLORS } from "@/lib/zone-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Zone } from "@/lib/types"

// Dynamically import map components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)
const MapUpdaterComponent = dynamic(() => import("./map-updater"), { ssr: false })
const MapIcons = dynamic(() => import("./map-icons"), { ssr: false })
const MapCoordinateTracker = dynamic(() => import("./map-coordinate-tracker"), { ssr: false })

export default function MapPage() {
  const { patients, isLoading: patientsLoading } = usePatients()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [editZonesOpen, setEditZonesOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0] || demoPatient
  const { zones: apiZones, createZone, updateZone, deleteZone: deleteZoneApi, mutate: mutateZones } = useZones(selectedPatient?.id)
  
  // Use API zones if available, otherwise fall back to demoZones
  // This ensures consistency with the dashboard
  const displayZones = apiZones.length > 0 ? apiZones : demoZones

  // San Francisco coordinates (matching zones)
  const patientLat = selectedPatient?.currentPosition?.lat ?? 37.7749
  const patientLng = selectedPatient?.currentPosition?.lng ?? -122.4194
  const homeLat = 37.7749
  const homeLng = -122.4194

  // Calculate zone info for selected patient using SINGLE SOURCE OF TRUTH
  const selectedPatientZoneInfo = useMemo(() => {
    return calculateZoneInfo(patientLat, patientLng, displayZones)
  }, [patientLat, patientLng, displayZones])

  const selectedPatientStatus = selectedPatientZoneInfo.status
  const selectedPatientStatusConfig = getStatusConfig(selectedPatientStatus)

  // Helper to get status for any patient based on their position
  const getPatientStatus = (patient: typeof selectedPatient) => {
    if (!patient?.currentPosition) return 'safe'
    const zoneInfo = calculateZoneInfo(
      patient.currentPosition.lat ?? 37.7749,
      patient.currentPosition.lng ?? -122.4194,
      displayZones
    )
    return zoneInfo.status
  }

  // Handle zone editing - now calls API
  const handleSaveZone = async (zone: Zone) => {
    setIsSaving(true)
    try {
      // Check if this is a real zone from the API (UUID format) vs demo zone or new zone
      const isExistingApiZone = zone.id && 
        !zone.id.startsWith('zone-') && 
        zone.id.length > 10 && 
        zone.id.includes('-')
      
      if (isExistingApiZone) {
        // Update existing zone (has a real UUID from backend)
        await updateZone(zone.id, {
          ...zone,
          patientId: zone.patientId || selectedPatient?.id,
        })
      } else {
        // Create new zone (either new zone with empty id, or demo zone being saved)
        await createZone({
          ...zone,
          id: undefined, // Let backend generate the ID
          patientId: selectedPatient?.id,
        })
      }
      setEditingZone(null)
    } catch (error) {
      console.error('Failed to save zone:', error)
      alert('Failed to save zone. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteZone = async (zoneId: string) => {
    try {
      await deleteZoneApi(zoneId)
    } catch (error) {
      console.error('Failed to delete zone:', error)
      alert('Failed to delete zone. Please try again.')
    }
  }

  const handleAddNewZone = () => {
    setEditingZone({
      id: "",
      patientId: selectedPatient?.id || "1",
      name: "New Zone",
      type: "safe",
      shape: "circle",
      center: { lat: patientLat, lng: patientLng },
      radius: 50,
      isActive: true,
    })
  }

  if (patientsLoading) {
    return (
      <AppShell title="Live Map">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent mx-auto" />
            <p className="mt-4 text-[var(--text-secondary)]">Loading map...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  // Show empty state if no patients
  if (!selectedPatient || patients.length === 0) {
    return (
      <AppShell title="Live Map">
        <div className="flex h-96 flex-col items-center justify-center gap-6">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">No Patients to Track</h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Add a patient first to view their location on the map
            </p>
          </div>
          <Link href="/patients">
            <Button className="bg-[var(--accent-primary)]">
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Live Map">
      <div className="space-y-4">
        {/* Patient Selector Card */}
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[var(--accent-primary)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Tracking:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 h-10">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedPatient.photo || "/placeholder.svg"} />
                        <AvatarFallback>
                          {selectedPatient.firstName?.[0]}{selectedPatient.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                      <Badge className={selectedPatientStatusConfig.className} style={{ marginLeft: '4px' }}>
                        {selectedPatientStatus.toUpperCase()}
                      </Badge>
                      <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72">
                    {patients.map((patient) => {
                      const patientStatus = getPatientStatus(patient)
                      const statusConfig = getStatusConfig(patientStatus)
                      return (
                        <DropdownMenuItem
                          key={patient.id}
                          onClick={() => setSelectedPatientId(patient.id)}
                          className="gap-3 cursor-pointer p-3"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={patient.photo || "/placeholder.svg"} />
                            <AvatarFallback>
                              {patient.firstName?.[0]}{patient.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">
                              {patient.device?.id || "No device"} • Battery: {patient.device?.batteryLevel || 100}%
                            </p>
                          </div>
                          <Badge className={statusConfig.className}>
                            {patientStatus.toUpperCase()}
                          </Badge>
                        </DropdownMenuItem>
                      )
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/patients" className="gap-2 cursor-pointer p-3">
                        <Plus className="h-4 w-4" />
                        <span>Add New Patient</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Zone Filter Buttons */}
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="bg-[var(--accent-primary-muted)] text-[var(--accent-primary)]">
                  All Zones
                </Button>
                <Button variant="outline" size="sm" className="border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent">
                  <span className="mr-2 h-2 w-2 rounded-full bg-[#10b981]" />
                  Safe
                </Button>
                <Button variant="outline" size="sm" className="border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent">
                  <span className="mr-2 h-2 w-2 rounded-full bg-[#f97316]" />
                  Restricted
                </Button>
                <Button variant="outline" size="sm" className="border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent">
                  <span className="mr-2 h-2 w-2 rounded-full bg-[#ef4444]" />
                  Danger
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Map */}
        <div className="relative h-[calc(100vh-260px)] overflow-hidden rounded-xl border border-[var(--border-subtle)]">
          <MapContainer
            center={[patientLat, patientLng]}
            zoom={16}
            style={{ height: "100%", width: "100%", zIndex: 1 }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdaterComponent center={[patientLat, patientLng]} />
            
            {/* Render zones directly here */}
            {displayZones.map((zone) => {
              const centerLat = zone.center?.lat ?? 37.7749
              const centerLng = zone.center?.lng ?? -122.4194
              const color = ZONE_COLORS[zone.type] || ZONE_COLORS.safe
              const radius = zone.radius || 100

              return (
                <Circle
                  key={zone.id}
                  center={[centerLat, centerLng]}
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
                      <br />
                      Risk: {zone.type === "safe" ? "+0" : zone.type === "buffer" ? "+10" : zone.type === "restricted" ? "+25" : "+40"}
                    </div>
                  </Popup>
                </Circle>
              )
            })}

            <MapIcons
              homeLat={homeLat}
              homeLng={homeLng}
              patientLat={patientLat}
              patientLng={patientLng}
              patient={selectedPatient}
              zones={displayZones}
              zoneColors={ZONE_COLORS}
            />
            <MapCoordinateTracker />
          </MapContainer>

          {/* Active Geofences Card - Only card on the map */}
          <Card className="absolute bottom-6 right-6 z-[1000] w-72 border-[var(--border-default)] bg-[var(--bg-secondary)]/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-primary)]">Active Geofences</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAddNewZone}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayZones.map((zone) => (
                <div
                  key={zone.id}
                  className={cn(
                    "rounded-lg border-l-4 bg-[var(--bg-tertiary)] p-3 cursor-pointer hover:bg-[var(--bg-tertiary)]/80 transition-colors",
                    zone.type === "safe" && "border-l-[#10b981]",
                    zone.type === "routine" && "border-l-[#8b5cf6]",
                    zone.type === "restricted" && "border-l-[#f97316]",
                    zone.type === "danger" && "border-l-[#ef4444]",
                    zone.type === "buffer" && "border-l-[#3b82f6]",
                  )}
                  onClick={() => setEditingZone(zone)}
                >
                  <p className="text-sm font-medium text-[var(--text-primary)]">{zone.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} Zone • {zone.radius}m radius
                  </p>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="mt-2 w-full border-[var(--border-default)] bg-transparent"
                onClick={() => setEditZonesOpen(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit All Zones
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit All Zones Dialog */}
      <Dialog open={editZonesOpen} onOpenChange={setEditZonesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Geofence Zones</DialogTitle>
            <DialogDescription>
              Configure safe zones, danger zones, and restricted areas for {selectedPatient.firstName}.
              Risk weights from ALGORITHM_SPEC: Safe (+0), Buffer (+10), Restricted (+25), Danger (+40)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {displayZones.map((zone) => (
              <div key={zone.id} className="flex items-center gap-4 p-3 rounded-lg border border-[var(--border-default)]">
                <div 
                  className="h-4 w-4 rounded-full" 
                  style={{ backgroundColor: ZONE_COLORS[zone.type] || ZONE_COLORS.safe }}
                />
                <div className="flex-1">
                  <p className="font-medium">{zone.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} • {zone.radius}m • 
                    ({zone.center?.lat.toFixed(4)}, {zone.center?.lng.toFixed(4)})
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setEditZonesOpen(false)
                    setEditingZone(zone)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteZone(zone.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditZonesOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setEditZonesOpen(false)
              handleAddNewZone()
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Single Zone Dialog */}
      <Dialog open={editingZone !== null} onOpenChange={(open) => !open && setEditingZone(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingZone?.id ? "Edit Zone" : "Add New Zone"}</DialogTitle>
            <DialogDescription>
              Configure zone parameters. Buffer zones are auto-generated around safe zones.
            </DialogDescription>
          </DialogHeader>
          
          {editingZone && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Zone Name</Label>
                <Input 
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  placeholder="e.g., Home Perimeter"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Zone Type</Label>
                <Select 
                  value={editingZone.type}
                  onValueChange={(value) => setEditingZone({ ...editingZone, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safe">🟢 Safe Zone (Risk: +0)</SelectItem>
                    <SelectItem value="restricted">🟠 Restricted Zone (Risk: +25)</SelectItem>
                    <SelectItem value="danger">🔴 Danger Zone (Risk: +40)</SelectItem>
                    <SelectItem value="routine">🟣 Routine Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Radius (meters)</Label>
                <Input 
                  type="number"
                  value={editingZone.radius}
                  onChange={(e) => setEditingZone({ ...editingZone, radius: parseInt(e.target.value) || 50 })}
                  min={10}
                  max={500}
                />
                <p className="text-xs text-[var(--text-tertiary)]">
                  Recommended: Safe (100m), Danger (50m), Restricted (75m)
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input 
                    type="number"
                    step="0.0001"
                    value={editingZone.center?.lat || 37.7749}
                    onChange={(e) => setEditingZone({ 
                      ...editingZone, 
                      center: { ...editingZone.center!, lat: parseFloat(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input 
                    type="number"
                    step="0.0001"
                    value={editingZone.center?.lng || -122.4194}
                    onChange={(e) => setEditingZone({ 
                      ...editingZone, 
                      center: { ...editingZone.center!, lng: parseFloat(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingZone(null)}>
              Cancel
            </Button>
            <Button onClick={() => editingZone && handleSaveZone(editingZone)}>
              Save Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
