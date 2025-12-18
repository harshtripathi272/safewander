"use client"

import { AppShell } from "@/components/layout/app-shell"
import { PatientHeader } from "@/components/dashboard/patient-header"
import { LiveMap } from "@/components/dashboard/live-map"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { VitalsPanel } from "@/components/dashboard/vitals-panel"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { SimulationPanel } from "@/components/dashboard/simulation-panel"
import { usePatients } from "@/lib/hooks/use-patients"
import { useZones } from "@/lib/hooks/use-tracking"
import { useActivities } from "@/lib/hooks/use-alerts"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { patients, isLoading: patientsLoading } = usePatients()
  const primaryPatient = patients[0] // Use first patient as primary
  const { zones } = useZones(primaryPatient?.id)
  const { activities } = useActivities(primaryPatient?.id)

  // Debug logging for position updates
  if (primaryPatient?.currentPosition) {
    console.log('[Dashboard] Patient position updated:', primaryPatient.currentPosition)
  }

  // Check if we're in demo mode (you can toggle this)
  const isDemoMode = process.env.NODE_ENV === 'development'

  if (patientsLoading || !primaryPatient) {
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

        {/* Patient Header */}
        <PatientHeader patient={primaryPatient} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Map (takes 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <LiveMap patient={primaryPatient} zones={zones} className="h-[500px]" />

            {/* Simulation Panel - Only in development */}
            {isDemoMode && <SimulationPanel patientId={primaryPatient.id} />}
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
