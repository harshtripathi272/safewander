import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { demoPatient } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Settings, MapPin, Phone, MessageSquare, AlertTriangle, Star, Pill, Activity } from "lucide-react"
import { GPSLinkSection } from "@/components/tracker/gps-link-section"

const statusConfig = {
  safe: { label: "SAFE", className: "bg-[var(--accent-primary-muted)] text-[var(--status-safe)]" },
  advisory: { label: "ADVISORY", className: "bg-amber-500/15 text-[var(--status-advisory)]" },
  warning: { label: "WARNING", className: "bg-orange-500/15 text-[var(--status-warning)]" },
  urgent: { label: "URGENT", className: "bg-red-500/15 text-[var(--status-urgent)]" },
  emergency: { label: "EMERGENCY", className: "bg-red-600/20 text-[var(--status-emergency)]" },
}

export default function PatientProfilePage() {
  const patient = demoPatient
  const statusInfo = statusConfig[patient.status]

  const age = Math.floor(
    (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  )

  return (
    <AppShell
      breadcrumb={[{ label: "Patients", href: "/patients" }, { label: `${patient.firstName} ${patient.lastName}` }]}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="border-[var(--border-default)] bg-transparent">
            Export
          </Button>
          <Button className="bg-[var(--accent-primary)]">
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Top Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient Info Card */}
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)] lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start gap-6">
                <Avatar className="h-28 w-28 border-4 border-[var(--status-safe)]">
                  <AvatarImage src={patient.photo || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {patient.firstName[0]}
                    {patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                      {patient.firstName} {patient.lastName}
                    </h1>
                    <Badge className={cn("uppercase", statusInfo.className)}>{statusInfo.label}</Badge>
                  </div>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    DOB:{" "}
                    {new Date(patient.dateOfBirth).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    ({age} Years Old)
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-[var(--bg-tertiary)]">
                      {patient.diagnosis}
                    </Badge>
                    <Badge variant="secondary" className="bg-[var(--bg-tertiary)]">
                      {patient.bloodType}
                    </Badge>
                    <Badge variant="secondary" className="bg-[var(--bg-tertiary)]">
                      {patient.weight}
                    </Badge>
                    <Badge variant="secondary" className="bg-[var(--bg-tertiary)]">
                      {patient.height}
                    </Badge>
                  </div>

                  <p className="mt-4 text-sm text-[var(--text-secondary)]">{patient.distinguishingFeatures}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Status Card */}
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-[var(--text-primary)]">Device Status</CardTitle>
              <Badge className="bg-[var(--accent-primary-muted)] text-[var(--status-safe)]">Online</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-[var(--accent-primary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{patient.device.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">#{patient.device.id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Battery</span>
                  <span className="font-medium text-[var(--text-primary)]">{patient.device.batteryLevel}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                  <div
                    className="h-full bg-[var(--status-safe)]"
                    style={{ width: `${patient.device.batteryLevel}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-tertiary)] p-3">
                <MapPin className="h-4 w-4 text-[var(--text-tertiary)]" />
                <div>
                  <p className="text-sm text-[var(--text-primary)]">123 Maple Street, Home</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Updated 2 mins ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GPS Location Access Section */}
        <GPSLinkSection
          patientId={patient.id}
          patientName={`${patient.firstName} ${patient.lastName}`}
        />

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Medical Profile */}
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-[var(--text-primary)]">Medical Profile</CardTitle>
              <Button variant="link" className="h-auto p-0 text-[var(--accent-primary)]">
                View History
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                  Conditions
                </p>
                <div className="flex flex-wrap gap-2">
                  {patient.conditions.map((condition) => (
                    <Badge key={condition} variant="secondary" className="bg-[var(--bg-tertiary)]">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                  Medications
                </p>
                <div className="space-y-2">
                  {patient.medications.map((med) => (
                    <div key={med.name} className="flex items-center gap-2 rounded-lg bg-[var(--bg-tertiary)] p-2">
                      <Pill className="h-4 w-4 text-[var(--accent-secondary)]" />
                      <div>
                        <p className="text-sm text-[var(--text-primary)]">{med.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {med.dosage} • {med.frequency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                  Allergies
                </p>
                {patient.allergies.map((allergy) => (
                  <div
                    key={allergy}
                    className="flex items-center gap-2 rounded-lg bg-red-500/10 p-2 text-[var(--status-urgent)]"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">{allergy}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Behavioral Insights */}
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[var(--text-primary)]">Behavioral Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                  Wandering Triggers
                </p>
                <ul className="space-y-1.5">
                  {patient.wanderingTriggers.map((trigger) => (
                    <li key={trigger} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--status-warning)]" />
                      {trigger}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                  Calming Strategies
                </p>
                <ul className="space-y-1.5">
                  {patient.calmingStrategies.map((strategy) => (
                    <li key={strategy} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--status-safe)]" />
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-[var(--accent-secondary-muted)] p-3">
                <p className="text-xs font-medium text-[var(--accent-secondary)]">Caregiver Note</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Patient responds best to calm, familiar voices. Avoid sudden movements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-[var(--text-primary)]">Emergency Contacts</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`/placeholder.svg?height=40&width=40&query=${contact.name} portrait`} />
                        <AvatarFallback>
                          {contact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{contact.name}</p>
                          {contact.isPrimary && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)]">{contact.relationship}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1 bg-[var(--accent-primary)]">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-[var(--border-default)] bg-transparent"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full border-[var(--status-urgent)] text-[var(--status-urgent)] hover:bg-red-500/10 bg-transparent"
              >
                <Phone className="mr-2 h-4 w-4" />
                Contact Emergency Services
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
