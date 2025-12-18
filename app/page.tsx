"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { PatientHeader } from "@/components/dashboard/patient-header"
import { LiveMapWrapper } from "@/components/dashboard/live-map-wrapper"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { VitalsPanel } from "@/components/dashboard/vitals-panel"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { SimulationPanel } from "@/components/dashboard/simulation-panel"
import { usePatients } from "@/lib/hooks/use-patients"
import { useZones } from "@/lib/hooks/use-tracking"
import { useActivities } from "@/lib/hooks/use-alerts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, Users } from "lucide-react"
import { demoZones } from "@/lib/data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

  // Debug logging for position updates
  if (selectedPatient?.currentPosition) {
    console.log('[Dashboard] Patient position updated:', selectedPatient.currentPosition)
  }

  // Check if we're in demo mode (you can toggle this)
  const isDemoMode = process.env.NODE_ENV === 'development'

  if (patientsLoading || !selectedPatient) {
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

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 p-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-500 text-white">DEMO MODE</Badge>
              <p className="text-sm text-[var(--text-secondary)]">
                Use the Demo Control Panel below to simulate scenarios for your video
              </p>
            </div>
          </div>
        )}

        {/* Patient Selector */}
        {patients.length > 1 && (
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-[var(--text-tertiary)]" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">Viewing Patient:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedPatient.photo || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedPatient.firstName} {selectedPatient.lastName}</span>
                  <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {patients.map((patient) => (
                  <DropdownMenuItem
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className="gap-3 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={patient.photo || "/placeholder.svg"} />
                      <AvatarFallback>
                        {patient.firstName[0]}{patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {patient.device?.id || "No device"}
                      </p>
                    </div>
                    {patient.id === selectedPatient.id && (
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Patient Header - Pass zones for dynamic zone detection */}
        <PatientHeader patient={selectedPatient} zones={displayZones} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Map (takes 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <LiveMapWrapper patient={selectedPatient} zones={displayZones} className="h-[500px]" />

            {/* Simulation Panel - Only in development */}
            {isDemoMode && <SimulationPanel patientId={selectedPatient.id} />}
          </div>

          {/* Right - Actions & Vitals */}
          <div className="space-y-6">
            <QuickActions />
            <VitalsPanel />
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
