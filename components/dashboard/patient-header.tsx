import type { Patient } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Battery, Signal, MapPin, History, Video } from "lucide-react"
import { cn } from "@/lib/utils"

interface PatientHeaderProps {
  patient: Patient
}

const statusConfig = {
  safe: { label: "LIVE: SAFE", className: "bg-[var(--accent-primary-muted)] text-[var(--status-safe)]" },
  advisory: { label: "ADVISORY", className: "bg-amber-500/15 text-[var(--status-advisory)]" },
  warning: { label: "WARNING", className: "bg-orange-500/15 text-[var(--status-warning)]" },
  urgent: { label: "URGENT", className: "bg-red-500/15 text-[var(--status-urgent)]" },
  emergency: { label: "EMERGENCY", className: "bg-red-600/20 text-[var(--status-emergency)]" },
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const statusInfo = statusConfig[patient?.status ?? "safe"];
  const device = patient?.device ?? { batteryLevel: 0, signalStrength: "" };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar
            className={cn(
              "h-16 w-16 border-[3px]",
              patient?.status === "safe"
                ? "border-[var(--status-safe)] animate-pulse-safe"
                : patient?.status === "emergency"
                  ? "border-[var(--status-emergency)] animate-pulse-emergency"
                  : "border-[var(--status-warning)] animate-pulse-warning",
            )}
          >
            <AvatarImage
              src={
                patient?.photo && patient.photo !== "string"
                  ? patient.photo
                  : "/placeholder.svg"
              }
            />
            <AvatarFallback>
              {patient?.firstName?.[0] || ""}
              {patient?.lastName?.[0] || ""}
            </AvatarFallback>
          </Avatar>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
              {patient?.firstName || ""} {patient?.lastName || ""}
            </h2>
            <Badge className={cn("uppercase tracking-wide", statusInfo.className)}>
              <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
              {statusInfo.label}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <MapPin className="h-4 w-4" />
            <span>Home • Master Bedroom</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Device Status */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Battery
              className={cn(
                "h-4 w-4",
                device.batteryLevel > 50
                  ? "text-[var(--status-safe)]"
                  : device.batteryLevel > 20
                    ? "text-[var(--status-warning)]"
                    : "text-[var(--status-urgent)]",
              )}
            />
            <span className="text-[var(--text-secondary)]">{device.batteryLevel}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Signal className="h-4 w-4 text-[var(--status-safe)]" />
            <span className="text-[var(--text-secondary)]">Strong</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-[var(--border-default)] bg-transparent">
            <History className="mr-2 h-4 w-4" />
            Full History
          </Button>
          <Button variant="outline" size="sm" className="border-[var(--border-default)] bg-transparent">
            <Video className="mr-2 h-4 w-4" />
            Live Feed
          </Button>
        </div>
      </div>
    </div>
  )
}
