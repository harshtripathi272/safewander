"use client"

import { useState, useMemo } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { PatientHeader } from "@/components/dashboard/patient-header"
import { LiveMapWrapper } from "@/components/dashboard/live-map-wrapper"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { SimulationPanel } from "@/components/dashboard/simulation-panel"
import { usePatients } from "@/lib/hooks/use-patients"
import { useZones } from "@/lib/hooks/use-tracking"
import { useActivities } from "@/lib/hooks/use-alerts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Users, Plus } from "lucide-react"
import { demoZones } from "@/lib/data"
import { calculateZoneInfo, getStatusConfig, getStatusColor } from "@/lib/zone-utils"
import Link from "next/link"
import { GPSLinkSection } from "@/components/tracker/gps-link-section"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const { patients, isLoading: patientsLoading } = usePatients()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  // Use selected patient or first patient as default
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0]
  const { zones } = useZones(selectedPatient?.id)

  // ALWAYS show zones - fallback to demo zones if API returns empty
  const displayZones = zones.length > 0 ? zones : demoZones
  const { activities } = useActivities(selectedPatient?.id)

  // Calculate zone info for selected patient using SINGLE SOURCE OF TRUTH
  const selectedPatientZoneInfo = useMemo(() => {
    if (!selectedPatient?.currentPosition) return null
    return calculateZoneInfo(
      selectedPatient.currentPosition.lat ?? 37.7749,
      selectedPatient.currentPosition.lng ?? -122.4194,
      displayZones
    )
  }, [selectedPatient?.currentPosition, displayZones])

  // Get the calculated status for the selected patient
  const selectedPatientStatus = selectedPatientZoneInfo?.status || 'safe'
  const selectedPatientStatusConfig = getStatusConfig(selectedPatientStatus)

  // Debug logging for position updates
  if (selectedPatient?.currentPosition) {
    console.log('[Dashboard] Patient position updated:', selectedPatient.currentPosition, 'Status:', selectedPatientStatus)
  }

  // Check if we're in demo mode (you can toggle this)
  const isDemoMode = process.env.NODE_ENV === 'development'

  if (patientsLoading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent mx-auto" />
            <p className="mt-4 text-[var(--text-secondary)]">Loading dashboard...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  // Show empty state if no patients
  if (!selectedPatient || patients.length === 0) {
    return (
      <AppShell title="Dashboard">
        <div className="flex h-96 flex-col items-center justify-center gap-6">
          <div className="text-center">
            <Users className="h-16 w-16 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">No Patients Yet</h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Add your first patient to start monitoring
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

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 p-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-500 text-white">DEMO MODE</Badge>
              <p className="text-sm text-[var(--text-secondary)]">
                Use the Demo Control Panel Below To Simulate Our Demo Patient
              </p>
            </div>
          </div>
        )}

        {/* Patient Selector - Always visible */}
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[var(--accent-primary)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Currently Monitoring:</span>
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
                      <Badge
                        className={selectedPatientStatusConfig.className}
                        style={{ marginLeft: '4px' }}
                      >
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
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {patients.length} Patient{patients.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Header - Pass zones for dynamic zone detection */}
        <PatientHeader patient={selectedPatient} zones={displayZones} />

        {/* GPS Location Access Section */}
        <GPSLinkSection
          patientId={selectedPatient.id}
          patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
        />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Map (takes 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <LiveMapWrapper patient={selectedPatient} zones={displayZones} className="h-[500px]" />

            {/* Simulation Panel - Only in development */}
            {isDemoMode && <SimulationPanel patientId={selectedPatient.id} />}
          </div>

          {/* Right - Actions & Activity */}
          <div className="space-y-6">
            <QuickActions />
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
