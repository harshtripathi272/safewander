"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Download, MapPin, Bell, ChevronDown, Users, AlertTriangle, Activity, Navigation } from "lucide-react"
import { usePatients } from "@/lib/hooks/use-patients"
import { useAlerts, useActivities } from "@/lib/hooks/use-alerts"
import { apiClient } from "@/lib/api-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"

export default function ReportsPage() {
  const { patients, isLoading: patientsLoading } = usePatients()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [locationHistory, setLocationHistory] = useState<any[]>([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)

  // Use selected patient or first patient as default
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0]
  const { alerts } = useAlerts(selectedPatient?.id)
  const { activities } = useActivities(selectedPatient?.id, 100)

  // Fetch location history when patient changes
  useEffect(() => {
    if (selectedPatient?.id) {
      setIsLoadingLocations(true)
      apiClient.getPatientLocations(selectedPatient.id, 100)
        .then(locations => {
          setLocationHistory(locations || [])
        })
        .catch(error => {
          console.error("Failed to fetch location history:", error)
          setLocationHistory([])
        })
        .finally(() => {
          setIsLoadingLocations(false)
        })
    }
  }, [selectedPatient?.id])

  // Filter alerts that are zone crossings (geofence type)
  const zoneCrossingAlerts = alerts.filter((alert: any) =>
    alert.type === "geofence" || (alert.message && alert.message.toLowerCase().includes("zone"))
  )

  // Stats based on real data
  const zoneExitsThisWeek = zoneCrossingAlerts.filter((a: any) => {
    const alertDate = new Date(a.timestamp || a.triggeredAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return alertDate > weekAgo
  }).length

  const alertsThisMonth = alerts.filter((a: any) => {
    const alertDate = new Date(a.timestamp || a.triggeredAt)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return alertDate > monthAgo
  }).length

  const totalActivities = activities.length
  const locationsToday = locationHistory.filter(loc => {
    const locDate = new Date(loc.timestamp || loc.created_at)
    const today = new Date()
    return locDate.toDateString() === today.toDateString()
  }).length

  // Generate CSV for zone crossings
  const downloadCSV = () => {
    if (zoneCrossingAlerts.length === 0) {
      toast.error("No zone crossing data to export")
      return
    }

    const headers = ["Timestamp", "Alert Type", "Level", "Message", "Location", "Status"]
    const rows = zoneCrossingAlerts.map((alert: any) => [
      new Date(alert.timestamp || alert.triggeredAt).toLocaleString(),
      alert.type,
      alert.level || alert.severity,
      alert.message || alert.title,
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

  // Generate detailed report with all data
  const downloadDetailedReport = () => {
    if (alerts.length === 0 && activities.length === 0 && locationHistory.length === 0) {
      toast.error("No data to export")
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
        activities: activities.length,
        locationRecords: locationHistory.length,
        resolved: alerts.filter((a: any) => a.resolved).length,
        pending: alerts.filter((a: any) => !a.resolved).length
      },
      alerts: alerts.map((a: any) => ({
        timestamp: a.timestamp || a.triggeredAt,
        type: a.type,
        level: a.level || a.severity,
        message: a.message || a.title,
        description: a.description,
        location: a.location || a.triggeredLocation,
        resolved: a.resolved,
        resolvedAt: a.resolved_at || a.resolvedAt
      })),
      activities: activities.map((act: any) => ({
        timestamp: act.timestamp,
        type: act.type || act.title,
        description: act.description,
        location: act.location,
        zone: act.zone
      })),
      locationHistory: locationHistory.map(loc => ({
        timestamp: loc.timestamp || loc.created_at,
        latitude: loc.latitude || loc.lat,
        longitude: loc.longitude || loc.lng,
        accuracy: loc.accuracy
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

  // Download location history CSV
  const downloadLocationHistory = () => {
    if (locationHistory.length === 0) {
      toast.error("No location history to export")
      return
    }

    const headers = ["Timestamp", "Latitude", "Longitude", "Accuracy (m)"]
    const rows = locationHistory.map(loc => [
      new Date(loc.timestamp || loc.created_at).toLocaleString(),
      loc.latitude || loc.lat,
      loc.longitude || loc.lng,
      loc.accuracy || "N/A"
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `location-history-${selectedPatient?.firstName}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Location history downloaded!")
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

        {/* Quick Stats - Updated with all data types */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <Activity className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{totalActivities}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Activity Events
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <Navigation className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{locationsToday}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Locations • Today
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
              <Button onClick={downloadLocationHistory} variant="outline" className="border-[var(--border-default)] bg-transparent flex-1 sm:flex-none">
                <Navigation className="mr-2 h-4 w-4" />
                Location History (CSV)
              </Button>
              <Button onClick={downloadDetailedReport} variant="outline" className="border-[var(--border-default)] bg-transparent flex-1 sm:flex-none">
                <FileText className="mr-2 h-4 w-4" />
                Full Report (JSON)
              </Button>
            </div>
            <p className="mt-3 text-xs text-[var(--text-tertiary)]">
              Reports contain all tracking data, alerts, and activity events for {selectedPatient.firstName}.
            </p>
          </CardContent>
        </Card>

        {/* Tabbed Data View */}
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="activities">
              <Activity className="h-4 w-4 mr-2" />
              Activities ({activities.length})
            </TabsTrigger>
            <TabsTrigger value="locations">
              <Navigation className="h-4 w-4 mr-2" />
              Locations ({locationHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Alert History</h2>
            {alerts.length === 0 ? (
              <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)]">No alerts recorded yet.</p>
                  <p className="text-sm text-[var(--text-tertiary)] mt-2">
                    Alerts will appear here when safety events are detected.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 20).map((alert: any) => (
                  <Card
                    key={alert.id}
                    className="border-[var(--border-subtle)] bg-[var(--bg-secondary)] border-l-4"
                    style={{
                      borderLeftColor: (alert.level || alert.severity) === "critical" ? "#ef4444" :
                        (alert.level || alert.severity) === "high" ? "#f97316" :
                          (alert.level || alert.severity) === "medium" ? "#eab308" : "#3b82f6"
                    }}
                  >
                    <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)]">
                          <AlertTriangle className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-[var(--text-primary)] truncate">{alert.message || alert.title}</h3>
                            <Badge
                              variant="secondary"
                              className={
                                (alert.level || alert.severity) === "critical" || (alert.level || alert.severity) === "high"
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                              }
                            >
                              {alert.level || alert.severity}
                            </Badge>
                            {alert.resolved && (
                              <Badge className="bg-green-500/15 text-green-400">Resolved</Badge>
                            )}
                          </div>
                          <p className="text-sm text-[var(--text-tertiary)] line-clamp-1">{alert.description}</p>
                          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                            {new Date(alert.timestamp || alert.triggeredAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {alerts.length > 20 && (
                  <p className="text-center text-sm text-[var(--text-tertiary)]">
                    Showing 20 of {alerts.length} alerts. Download full report for all data.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Activity Events</h2>
            {activities.length === 0 ? (
              <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)]">No activity events recorded yet.</p>
                  <p className="text-sm text-[var(--text-tertiary)] mt-2">
                    Zone entries, exits, and other activities will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 20).map((activity: any, idx: number) => (
                  <Card
                    key={activity.id || idx}
                    className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)]">
                        <Activity className="h-5 w-5 text-[var(--accent-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[var(--text-primary)] truncate">{activity.type || activity.title || "Activity"}</p>
                          {activity.zone && (
                            <Badge variant="outline">{activity.zone}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-tertiary)] line-clamp-1">{activity.description}</p>
                        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {activities.length > 20 && (
                  <p className="text-center text-sm text-[var(--text-tertiary)]">
                    Showing 20 of {activities.length} activities.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Location History Tab */}
          <TabsContent value="locations" className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Location Tracking History</h2>
            {isLoadingLocations ? (
              <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <CardContent className="p-8 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent mx-auto" />
                  <p className="mt-4 text-[var(--text-secondary)]">Loading location history...</p>
                </CardContent>
              </Card>
            ) : locationHistory.length === 0 ? (
              <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <CardContent className="p-8 text-center">
                  <Navigation className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)]">No location history recorded yet.</p>
                  <p className="text-sm text-[var(--text-tertiary)] mt-2">
                    GPS tracking data will appear here as the patient moves.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {locationHistory.slice(0, 20).map((location, idx) => (
                  <Card
                    key={location.id || idx}
                    className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                        <MapPin className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)]">
                          {(location.latitude || location.lat)?.toFixed(6)}, {(location.longitude || location.lng)?.toFixed(6)}
                        </p>
                        <p className="text-sm text-[var(--text-tertiary)]">
                          Accuracy: {location.accuracy ? `${location.accuracy}m` : "N/A"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                          {new Date(location.timestamp || location.created_at).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {locationHistory.length > 20 && (
                  <p className="text-center text-sm text-[var(--text-tertiary)]">
                    Showing 20 of {locationHistory.length} locations. Download CSV for all data.
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
