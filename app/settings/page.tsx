"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { demoPatient } from "@/lib/data"
import { Bell, BedDouble, AlertTriangle, DoorOpen, Heart, History, Save, Pencil, Moon, Users } from "lucide-react"

export default function SettingsPage() {
  return (
    <AppShell breadcrumb={[{ label: "Settings" }, { label: "Alerts & Preferences" }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Alerts & Preferences</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Configure safety notifications for {demoPatient.firstName} {demoPatient.lastName}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-[var(--accent-primary-muted)] text-[var(--status-safe)]">
              <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-current" />
              System Active
            </Badge>
            <Button variant="outline" className="border-[var(--border-default)] bg-transparent">
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button className="bg-[var(--accent-primary)]">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Sensor Sensitivity Section */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Sensor Sensitivity & Triggers</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Bed Exit Detection */}
            <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/15">
                    <BedDouble className="h-5 w-5 text-purple-400" />
                  </div>
                  <CardTitle className="text-base text-[var(--text-primary)]">Bed Exit Detection</CardTitle>
                </div>
                <Switch defaultChecked />
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-[var(--text-tertiary)]">
                  Alert when weight is removed from bed sensor
                </CardDescription>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">Sensitivity</span>
                    <span className="text-[var(--text-primary)]">Medium</span>
                  </div>
                  <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
                  <div className="mt-1 flex justify-between text-xs text-[var(--text-tertiary)]">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fall Detection */}
            <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <CardTitle className="text-base text-[var(--text-primary)]">Fall Detection</CardTitle>
                </div>
                <Switch defaultChecked />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--text-tertiary)]">
                  Radar-based rapid descent triggers
                </CardDescription>
                <Badge className="mt-3 bg-red-500/15 text-[var(--status-urgent)]">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  High priority enabled
                </Badge>
              </CardContent>
            </Card>

            {/* Room Exit */}
            <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15">
                    <DoorOpen className="h-5 w-5 text-orange-400" />
                  </div>
                  <CardTitle className="text-base text-[var(--text-primary)]">Room Exit / Wander</CardTitle>
                </div>
                <Switch defaultChecked />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--text-tertiary)]">
                  Alert when door opens or patient leaves monitored area
                </CardDescription>
              </CardContent>
            </Card>

            {/* Vital Signs */}
            <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/15">
                    <Heart className="h-5 w-5 text-gray-400" />
                  </div>
                  <CardTitle className="text-base text-[var(--text-primary)]">Vital Signs</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
                  Not Connected
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--text-tertiary)]">
                  Heart rate & oxygen level monitoring
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notification Channels */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notification Channels</h2>
          </div>

          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="p-4 text-left text-sm font-medium text-[var(--text-tertiary)]">Alert Severity</th>
                    <th className="p-4 text-center text-sm font-medium text-[var(--text-tertiary)]">Push App</th>
                    <th className="p-4 text-center text-sm font-medium text-[var(--text-tertiary)]">SMS Text</th>
                    <th className="p-4 text-center text-sm font-medium text-[var(--text-tertiary)]">Phone Call</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <td className="p-4 text-sm text-[var(--text-primary)]">Low Priority</td>
                    <td className="p-4 text-center">
                      <Checkbox defaultChecked />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox />
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <td className="p-4 text-sm text-[var(--text-primary)]">Medium Priority</td>
                    <td className="p-4 text-center">
                      <Checkbox defaultChecked />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox defaultChecked />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 text-sm text-[var(--text-primary)]">Critical Priority</td>
                    <td className="p-4 text-center">
                      <Checkbox defaultChecked />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox defaultChecked />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox defaultChecked />
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Escalation & Quiet Hours */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Escalation Protocol */}
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <AlertTriangle className="h-5 w-5 text-[var(--status-warning)]" />
              <CardTitle className="text-base text-[var(--text-primary)]">Escalation Protocol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-[var(--bg-tertiary)] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="mb-2 bg-[var(--accent-primary-muted)] text-[var(--status-safe)]">
                      1. Immediately
                    </Badge>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Primary Caregiver</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Sarah Jenkins (You)</p>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-tertiary)]">
                <span>Wait 5 min</span>
              </div>

              <div className="rounded-lg bg-[var(--bg-tertiary)] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="mb-2 bg-orange-500/15 text-[var(--status-warning)]">2. If No Response</Badge>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Backup Contact</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Dr. Emily Chen</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <Moon className="h-5 w-5 text-[var(--accent-secondary)]" />
              <CardTitle className="text-base text-[var(--text-primary)]">Quiet Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-[var(--bg-tertiary)] p-4">
                <p className="text-sm font-medium text-[var(--text-primary)]">Night Schedule</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">10:00 PM - 07:00 AM</p>
                <p className="text-xs text-[var(--text-tertiary)]">Every Day</p>
              </div>

              <Button variant="outline" className="w-full border-[var(--border-default)] bg-transparent">
                + Add New Schedule
              </Button>

              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--text-tertiary)]" />
                  <span className="text-sm text-[var(--text-secondary)]">Caregiver Handoff</span>
                </div>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">Current: Sarah Jenkins</p>
                <Button variant="outline" size="sm" className="mt-2 border-[var(--border-default)] bg-transparent">
                  Handoff Shift
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
