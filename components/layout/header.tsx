"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Search, Settings, X, Check, AlertTriangle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAlerts } from "@/lib/hooks/use-alerts"
import { usePatients } from "@/lib/hooks/use-patients"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface HeaderProps {
  title?: string
  breadcrumb?: { label: string; href?: string }[]
}

export function Header({ title, breadcrumb }: HeaderProps) {
  const { patients } = usePatients()
  const primaryPatient = patients[0]
  const { alerts, mutate } = useAlerts(primaryPatient?.id)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(false)

  const unreadAlerts = alerts.filter((a: any) => !a.acknowledged && !a.resolved)
  const alertCount = unreadAlerts.length

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await apiClient.acknowledgeAlert(alertId, "Admin")
      await mutate()
      toast.success("Alert acknowledged")
    } catch (error) {
      toast.error("Failed to acknowledge alert")
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      await apiClient.resolveAlert(alertId)
      await mutate()
      toast.success("Alert resolved")
    } catch (error) {
      toast.error("Failed to resolve alert")
    }
  }

  const handleClearAllNotifications = async () => {
    try {
      await apiClient.clearAlerts(primaryPatient?.id)
      await mutate()
      toast.success("All notifications cleared")
    } catch (error) {
      toast.error("Failed to clear notifications")
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6">
      {/* Left Section */}
      <div>
        {breadcrumb ? (
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-[var(--text-tertiary)]">/</span>}
                <span
                  className={
                    index === breadcrumb.length - 1
                      ? "font-medium text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }
                >
                  {item.label}
                </span>
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h1>
        )}
      </div>

      {/* Center Section - Search */}
      <div className="hidden max-w-md flex-1 px-8 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <Input
            type="search"
            placeholder="Search patients, zones..."
            className="h-10 border-[var(--border-default)] bg-[var(--bg-tertiary)] pl-9 text-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* System Status */}
        <div className="hidden items-center gap-2 rounded-full bg-[var(--accent-primary-muted)] px-3 py-1.5 lg:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--status-safe)]" />
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--status-safe)]">
            System Operational
          </span>
        </div>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-[var(--text-secondary)]" />
              {alertCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-[var(--status-urgent)] px-1.5 text-xs text-white">
                  {alertCount > 9 ? "9+" : alertCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {alertCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  onClick={handleClearAllNotifications}
                >
                  Clear All
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {unreadAlerts.length === 0 ? (
              <div className="py-6 text-center text-sm text-[var(--text-tertiary)]">
                No new notifications
              </div>
            ) : (
              <>
                {unreadAlerts.slice(0, 5).map((alert: any) => (
                  <DropdownMenuItem key={alert.id} className="flex flex-col items-start gap-1 p-3">
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.level === 'critical' ? 'text-[var(--status-urgent)]' :
                          alert.level === 'high' ? 'text-[var(--status-warning)]' :
                          'text-[var(--status-advisory)]'
                        }`} />
                        <span className="font-medium text-[var(--text-primary)]">{alert.message}</span>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="mt-1 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAcknowledgeAlert(alert.id)
                        }}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Acknowledge
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-[var(--status-safe)]"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleResolveAlert(alert.id)
                        }}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Resolve
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))}
                {unreadAlerts.length > 5 && (
                  <DropdownMenuSeparator />
                )}
                <DropdownMenuItem asChild>
                  <Link href="/alerts" className="w-full justify-center text-[var(--accent-primary)]">
                    View All Alerts
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Sheet */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-[var(--text-secondary)]" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Quick Settings</SheetTitle>
              <SheetDescription>
                Configure your notification preferences
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications" className="flex flex-col gap-1">
                    <span>Push Notifications</span>
                    <span className="text-xs text-[var(--text-tertiary)]">Receive alerts on your device</span>
                  </Label>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-alerts" className="flex flex-col gap-1">
                    <span>Sound Alerts</span>
                    <span className="text-xs text-[var(--text-tertiary)]">Play sound for critical alerts</span>
                  </Label>
                  <Switch
                    id="sound-alerts"
                    checked={soundAlerts}
                    onCheckedChange={setSoundAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-alerts" className="flex flex-col gap-1">
                    <span>Email Alerts</span>
                    <span className="text-xs text-[var(--text-tertiary)]">Receive daily summary emails</span>
                  </Label>
                  <Switch
                    id="email-alerts"
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                  />
                </div>
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-4">
                <Link href="/settings">
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    All Settings
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* User Avatar */}
        <Avatar className="h-9 w-9 border-2 border-[var(--accent-primary)]">
          <AvatarImage src="/placeholder.svg?height=36&width=36" />
          <AvatarFallback>SJ</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
