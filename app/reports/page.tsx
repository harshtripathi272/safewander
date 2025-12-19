"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Download, MapPin, Bell, ChevronDown, Users, AlertTriangle } from "lucide-react"
import { usePatients } from "@/lib/hooks/use-patients"
import { useAlerts } from "@/lib/hooks/use-alerts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function ReportsPage() {
  const { patients, isLoading: patientsLoading } = usePatients()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  // Use selected patient or first patient as default
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0]
  const { alerts } = useAlerts(selectedPatient?.id)

  // Filter alerts that are zone crossings (geofence type)
  const zoneCrossingAlerts = alerts.filter(alert =>
    alert.type === "geofence" || alert.message?.toLowerCase().includes("zone")
  )

  // Stats based on real data
  const zoneExitsThisWeek = zoneCrossingAlerts.filter(a => {
    const alertDate = new Date(a.timestamp)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return alertDate > weekAgo
  }).length

  const alertsThisMonth = alerts.filter(a => {
    const alertDate = new Date(a.timestamp)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return alertDate > monthAgo
  }).length

  // Generate CSV for zone crossings
  const downloadCSV = () => {
    if (zoneCrossingAlerts.length === 0) {
      toast.error("No zone crossing data to export")
      return
    }

    const headers = ["Timestamp", "Alert Type", "Level", "Message", "Location", "Status"]
    const rows = zoneCrossingAlerts.map(alert => [
      new Date(alert.timestamp).toLocaleString(),
      alert.type,
      alert.level,
      alert.message,
      alert.location ? `${alert.location.lat?.toFixed(4)}, ${alert.location.lng?.toFixed(4)}` : "N/A",
      alert.resolved ? "Resolved" : alert.acknowledged ? "Acknowledged" : "Active"
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `zone-crossings-${selectedPatient?.firstName}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Report downloaded successfully!")
  }

  // Generate detailed report
  const downloadDetailedReport = () => {
    if (alerts.length === 0) {
      toast.error("No alert data to export")
      return
    }

    const report = {
      generatedAt: new Date().toISOString(),
      patient: {
        name: `${selectedPatient?.firstName} ${selectedPatient?.lastName}`,
        id: selectedPatient?.id
      },
      summary: {
        totalAlerts: alerts.length,
        zoneCrossings: zoneCrossingAlerts.length,
        resolved: alerts.filter(a => a.resolved).length,
        pending: alerts.filter(a => !a.resolved).length
      },
      alerts: alerts.map(a => ({
        timestamp: a.timestamp,
        type: a.type,
        level: a.level,
        message: a.message,
        description: a.description,
        location: a.location,
        resolved: a.resolved,
        resolvedAt: a.resolved_at
      }))
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `full-report-${selectedPatient?.firstName}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Full report downloaded!")
  }

  if (patientsLoading) {
    return (
      <AppShell title="Reports">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent mx-auto" />
            <p className="mt-4 text-[var(--text-secondary)]">Loading reports...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!selectedPatient) {
    return (
      <AppShell title="Reports">
        <div className="flex h-96 items-center justify-center">
          <p className="text-[var(--text-secondary)]">No patients found. Add a patient first.</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Reports">
      <div className="space-y-6">
        {/* Patient Selector */}
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[var(--accent-primary)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Reports for:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedPatient.photo || "/placeholder.svg"} />
                        <AvatarFallback>
                          {selectedPatient.firstName?.[0]}{selectedPatient.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</span>
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
                            {patient.firstName?.[0]}{patient.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{patient.firstName} {patient.lastName}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - Removed Active Hours */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                  <MapPin className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{zoneExitsThisWeek}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Zone Exits • This Week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-primary-muted)]">
                  <Bell className="h-5 w-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{alertsThisMonth}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Total Alerts • This Month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Report Section */}
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <CardHeader>
            <CardTitle className="text-lg text-[var(--text-primary)]">Download Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={downloadCSV} className="bg-[var(--accent-primary)] flex-1 sm:flex-none">
                <Download className="mr-2 h-4 w-4" />
                Zone Crossings (CSV)
              </Button>
              <Button onClick={downloadDetailedReport} variant="outline" className="border-[var(--border-default)] bg-transparent flex-1 sm:flex-none">
                <FileText className="mr-2 h-4 w-4" />
                Full Report (JSON)
              </Button>
            </div>
            <p className="mt-3 text-xs text-[var(--text-tertiary)]">
              Reports contain all zone crossing events and alerts for {selectedPatient.firstName}.
            </p>
          </CardContent>
        </Card>

        {/* Zone Crossing Events */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Zone Crossing History</h2>
          {zoneCrossingAlerts.length === 0 ? (
            <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)]">No zone crossing events recorded yet.</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-2">
                  Zone crossings will appear here when the patient moves between zones.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {zoneCrossingAlerts.slice(0, 10).map((alert) => (
                <Card
                  key={alert.id}
                  className="border-[var(--border-subtle)] bg-[var(--bg-secondary)] border-l-4"
                  style={{
                    borderLeftColor: alert.level === "critical" ? "#ef4444" :
                      alert.level === "high" ? "#f97316" :
                        alert.level === "medium" ? "#eab308" : "#3b82f6"
                  }}
                >
                  <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)]">
                        <AlertTriangle className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-[var(--text-primary)] truncate">{alert.message}</h3>
                          <Badge
                            variant="secondary"
                            className={
                              alert.level === "critical" || alert.level === "high"
                                ? "bg-red-500/15 text-red-400"
                                : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                            }
                          >
                            {alert.level}
                          </Badge>
                          {alert.resolved && (
                            <Badge className="bg-green-500/15 text-green-400">Resolved</Badge>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-tertiary)] line-clamp-1">{alert.description}</p>
                        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const text = `${alert.message}\n${alert.description}\nTime: ${new Date(alert.timestamp).toLocaleString()}`
                          navigator.clipboard.writeText(text)
                          toast.success("Copied to clipboard")
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {zoneCrossingAlerts.length > 10 && (
                <p className="text-center text-sm text-[var(--text-tertiary)]">
                  Showing 10 of {zoneCrossingAlerts.length} events. Download full report for all data.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
