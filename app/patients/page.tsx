"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, ChevronRight, MapPin } from "lucide-react"
import { usePatients } from "@/lib/hooks/use-patients"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"

const statusConfig = {
  safe: { label: "SAFE AT HOME", className: "bg-[var(--accent-primary-muted)] text-[var(--status-safe)]" },
  monitoring: { label: "MONITORING", className: "bg-blue-500/15 text-blue-400" },
  warning: { label: "WARNING", className: "bg-orange-500/15 text-[var(--status-warning)]" },
  emergency: { label: "EMERGENCY", className: "bg-red-600/20 text-[var(--status-emergency)]" },
}

export default function PatientsPage() {
  const { patients, isLoading } = usePatients()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <AppShell title="Patients">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <Input
              placeholder="Search patients..."
              className="h-10 border-[var(--border-default)] bg-[var(--bg-tertiary)] pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-[var(--accent-primary)]">
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>

        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent mx-auto" />
              <p className="mt-4 text-[var(--text-secondary)]">Loading patients...</p>
            </div>
          </div>
        )}

        {/* Patient Cards */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredPatients.map((patient) => {
              const statusInfo = statusConfig[patient.status as keyof typeof statusConfig] || statusConfig.safe
              return (
                <Link key={patient.id} href={`/patients/${patient.id}`}>
                  <Card className="cursor-pointer border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all hover:border-[var(--accent-primary)]">
                    <CardContent className="flex items-center gap-6 p-6">
                      <Avatar
                        className={cn(
                          "h-16 w-16 border-[3px]",
                          patient.status === "safe"
                            ? "border-[var(--status-safe)]"
                            : patient.status === "warning"
                              ? "border-[var(--status-warning)]"
                              : patient.status === "emergency"
                                ? "border-[var(--status-urgent)]"
                                : "border-blue-400",
                        )}
                      >
                        <AvatarImage src={patient.photo_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{patient.name}</h3>
                          <Badge className={cn("uppercase", statusInfo.className)}>{statusInfo.label}</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {patient.location || "Unknown location"}
                          </span>
                          <span className="flex items-center gap-1">Battery: {patient.battery}%</span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                          Last seen: {new Date(patient.last_seen).toLocaleString()}
                        </p>
                      </div>

                      <ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {!isLoading && filteredPatients.length === 0 && (
          <div className="flex h-64 items-center justify-center">
            <p className="text-[var(--text-secondary)]">
              {searchQuery ? "No patients found matching your search" : "No patients yet"}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
