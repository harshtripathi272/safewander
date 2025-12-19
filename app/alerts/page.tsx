"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { usePatients } from "@/lib/hooks/use-patients"
import { useAlerts } from "@/lib/hooks/use-alerts"
import { apiClient } from "@/lib/api-client"
import { Bell, MapPin, Heart, Check, AlertTriangle, History, Video, Activity, Users, ChevronDown, Trash2, Radio } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

const alertIcons: Record<string, any> = {
  geofence: MapPin,
  vitals: Heart,
  fall: AlertTriangle,
  inactivity: Activity,
  battery: Bell,
}

const severityConfig = {
  low: { label: "Low Priority", className: "bg-[var(--accent-secondary-muted)] text-[var(--accent-secondary)]" },
  medium: { label: "Medium Priority", className: "bg-amber-500/15 text-[var(--status-advisory)]" },
  high: { label: "High Priority", className: "bg-orange-500/15 text-[var(--status-warning)]" },
  critical: { label: "Critical Priority", className: "bg-red-500/15 text-[var(--status-urgent)]" },
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export default function AlertsPage() {
  const { patients } = usePatients()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  // Use selected patient or first patient as default
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0]
  const { alerts, isLoading, mutate } = useAlerts(selectedPatient?.id)

  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [filter, setFilter] = useState("all")
  const [lastAlertCount, setLastAlertCount] = useState(0)

  // Auto-select newest alert when new alerts arrive (real-time sync)
  useEffect(() => {
    if (alerts.length > 0) {
      // If we got new alerts, auto-select the newest one
      if (alerts.length > lastAlertCount) {
        setSelectedAlert(alerts[0]) // Alerts are sorted by timestamp desc
        // Show toast for new alert
        if (lastAlertCount > 0) {
          toast.info(`New alert: ${(alerts[0] as any).message || alerts[0].title || 'Alert received'}`, {
            duration: 3000,
            position: "top-right",
          })
        }
      }
      // If no alert is selected, select the first one
      else if (!selectedAlert) {
        setSelectedAlert(alerts[0])
      }
      setLastAlertCount(alerts.length)
    }
  }, [alerts, lastAlertCount, selectedAlert])

  const filteredAlerts = alerts.filter((alert: any) => {
    if (filter === "all") return true
    if (filter === "critical") return alert.level === "critical" || alert.level === "high"
    if (filter === "warning") return alert.level === "medium" || alert.level === "low"
    return true
  })

  const handleResolveAlert = async () => {
    if (!selectedAlert) return
    try {
      console.log('[Alerts] Resolving alert:', selectedAlert.id)
      const result = await apiClient.resolveAlert(selectedAlert.id)
      console.log('[Alerts] Resolve result:', result)

      // Force immediate revalidation
      await mutate(undefined, { revalidate: true })

      // Update selected alert to show resolved state immediately
      setSelectedAlert({ ...selectedAlert, resolved: true, resolved_at: new Date().toISOString() })

      console.log('[Alerts] Alert resolved successfully')
    } catch (error) {
      console.error("[Alerts] Error resolving alert:", error)
      alert(`Failed to resolve alert: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleAcknowledgeAlert = async () => {
    if (!selectedAlert) return
    try {
      console.log('[Alerts] Acknowledging alert:', selectedAlert.id)
      const result = await apiClient.acknowledgeAlert(selectedAlert.id, "Admin")
      console.log('[Alerts] Acknowledge result:', result)

      // Force immediate revalidation
      await mutate(undefined, { revalidate: true })

      // Update selected alert to show acknowledged state immediately
      setSelectedAlert({
        ...selectedAlert,
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: "Admin"
      })

      console.log('[Alerts] Alert acknowledged successfully')
    } catch (error) {
      console.error("[Alerts] Error acknowledging alert:", error)
      alert(`Failed to acknowledge alert: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleClearAllAlerts = async () => {
    try {
      await apiClient.clearAlerts(selectedPatient?.id)
      await mutate(undefined, { revalidate: true })
      setSelectedAlert(null)
      toast.success("All alerts cleared successfully")
    } catch (error) {
      console.error("[Alerts] Error clearing alerts:", error)
      toast.error("Failed to clear alerts")
    }
  }

  if (isLoading) {
    return (
      <AppShell breadcrumb={[{ label: "Alerts & Timeline" }]}>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent mx-auto" />
            <p className="mt-4 text-[var(--text-secondary)]">Loading alerts...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!selectedPatient) {
    return (
      <AppShell breadcrumb={[{ label: "Alerts & Timeline" }]}>
        <div className="flex h-96 items-center justify-center">
          <p className="text-[var(--text-secondary)]">No patients found</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell breadcrumb={[{ label: "Alerts & Timeline" }]}>
      <div className="space-y-6">
        {/* Patient Selector */}
        {patients.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[var(--text-tertiary)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Viewing Alerts for:</span>
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
                      onClick={() => {
                        setSelectedPatientId(patient.id)
                        setSelectedAlert(null)
                      }}
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

            {/* Clear All Button */}
            {alerts.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All Alerts
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Alerts?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all alerts for {selectedPatient.firstName} {selectedPatient.lastName}.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAllAlerts}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}

        {/* Patient Context Bar */}
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-[var(--status-safe)]">
                <AvatarImage
                  src={
                    selectedPatient.photo && selectedPatient.photo !== "string"
                      ? selectedPatient.photo
                      : "/placeholder.svg"
                  }
                />
                <AvatarFallback>
                  {selectedPatient.firstName[0]}
                  {selectedPatient.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                  <Badge className="bg-[var(--accent-primary-muted)] text-[var(--status-safe)] uppercase">
                    Monitoring Active
                  </Badge>
                </div>
                {/* Battery status and location */}
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span>Zone: {selectedPatient.currentZone}</span>
                  <span>•</span>
                  <span>Battery: {selectedPatient.device.batteryLevel}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-[var(--border-default)] bg-transparent">
                <History className="mr-2 h-4 w-4" />
                Full History
              </Button>
              <Button variant="outline" className="border-[var(--border-default)] bg-transparent">
                <Video className="mr-2 h-4 w-4" />
                Live Feed
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Live Alerts Panel */}
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-[var(--text-primary)]">
                <Bell className="h-5 w-5 text-[var(--accent-primary)]" />
                Live Alerts
              </CardTitle>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="bg-[var(--bg-tertiary)]">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="critical" className="text-xs">
                    Critical
                  </TabsTrigger>
                  <TabsTrigger value="warning" className="text-xs">
                    Warning
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredAlerts.length === 0 && (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-[var(--text-secondary)]">No alerts</p>
                </div>
              )}

              {filteredAlerts.map((alert: any) => {
                const Icon = alertIcons[alert.type] || Bell
                const severity = severityConfig[alert.level as keyof typeof severityConfig] || severityConfig.low
                const isSelected = selectedAlert?.id === alert.id

                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={cn(
                      "cursor-pointer rounded-lg border-l-4 p-4 transition-all",
                      alert.level === "critical" && "border-l-[var(--status-urgent)]",
                      alert.level === "high" && "border-l-[var(--status-warning)]",
                      alert.level === "medium" && "border-l-[var(--status-advisory)]",
                      alert.level === "low" && "border-l-[var(--accent-secondary)]",
                      isSelected ? "bg-[var(--bg-hover)]" : "bg-[var(--bg-tertiary)]",
                      "hover:bg-[var(--bg-hover)]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                            alert.level === "critical" && "bg-red-500/15 text-[var(--status-urgent)]",
                            alert.level === "high" && "bg-orange-500/15 text-[var(--status-warning)]",
                            alert.level === "medium" && "bg-amber-500/15 text-[var(--status-advisory)]",
                            alert.level === "low" && "bg-blue-500/15 text-[var(--accent-secondary)]",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[var(--text-primary)]">{alert.message}</p>
                            {!alert.resolved && (
                              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--status-urgent)]" />
                            )}
                          </div>
                          <Badge className={cn("mt-1", severity.className)}>{severity.label}</Badge>
                          {alert.description && (
                            <p className="mt-1 text-sm text-[var(--text-tertiary)]">{alert.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-[var(--text-tertiary)]">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Incident Detail Panel */}
          {selectedAlert && (
            <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "uppercase",
                          selectedAlert.resolved
                            ? "bg-[var(--accent-primary-muted)] text-[var(--status-safe)]"
                            : "bg-red-500/15 text-[var(--status-urgent)]",
                        )}
                      >
                        {selectedAlert.resolved ? "Resolved" : "Action Required"}
                      </Badge>
                      <span className="text-xs text-[var(--text-tertiary)]">ID #{selectedAlert.id}</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">{selectedAlert.message}</h2>
                    <p className="text-sm text-[var(--text-secondary)]">{selectedAlert.description}</p>
                  </div>
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full",
                      !selectedAlert.resolved ? "animate-pulse-emergency bg-red-500/20" : "bg-[var(--bg-tertiary)]",
                    )}
                  >
                    <Bell className="h-6 w-6 text-[var(--status-urgent)]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alert Details */}
                <div>
                  <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                    Alert Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Type:</span>
                      <span className="text-[var(--text-primary)]">{selectedAlert.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Level:</span>
                      <span className="text-[var(--text-primary)]">{selectedAlert.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Status:</span>
                      <span className="text-[var(--text-primary)]">
                        {selectedAlert.resolved ? "Resolved" : selectedAlert.acknowledged ? "Acknowledged" : "Active"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Triggered:</span>
                      <span className="text-[var(--text-primary)]">
                        {new Date(selectedAlert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!selectedAlert.resolved && (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleResolveAlert}
                      className="flex-1 bg-[var(--status-safe)] hover:bg-[var(--status-safe)]/90"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Resolve Alert
                    </Button>
                    {!selectedAlert.acknowledged && (
                      <Button
                        onClick={handleAcknowledgeAlert}
                        variant="outline"
                        className="flex-1 border-[var(--border-default)] bg-transparent"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Acknowledge
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}
