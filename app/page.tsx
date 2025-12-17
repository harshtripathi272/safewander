"use client"

import { AppShell } from "@/components/layout/app-shell"
import { PatientHeader } from "@/components/dashboard/patient-header"
import { LiveMap } from "@/components/dashboard/live-map"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { VitalsPanel } from "@/components/dashboard/vitals-panel"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { usePatients } from "@/lib/hooks/use-patients"
import { useZones } from "@/lib/hooks/use-tracking"
import { useActivities } from "@/lib/hooks/use-alerts"

export default function DashboardPage() {
  const { patients, isLoading: patientsLoading } = usePatients()
  const primaryPatient = patients[0] // Use first patient as primary
  const { zones } = useZones(primaryPatient?.id)
  const { activities } = useActivities(primaryPatient?.id)

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
        {/* Patient Header */}
        <PatientHeader patient={primaryPatient} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left - Map (takes 2 columns) */}
          <div className="lg:col-span-2">
            <LiveMap patient={primaryPatient} zones={zones} className="h-[500px]" />
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
