"use client"

import { useEffect, useRef } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, Minus, Crosshair, MapPin, History, Phone, Pencil } from "lucide-react"
import { demoPatient, demoZones } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function MapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Dark map background with more detail
    ctx.fillStyle = "#0f1419"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.05)"
    ctx.lineWidth = 1
    for (let x = 0; x < rect.width; x += 30) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }
    for (let y = 0; y < rect.height; y += 30) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Draw roads
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)"
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.moveTo(0, rect.height * 0.35)
    ctx.lineTo(rect.width, rect.height * 0.35)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rect.width * 0.25, 0)
    ctx.lineTo(rect.width * 0.25, rect.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rect.width * 0.6, 0)
    ctx.lineTo(rect.width * 0.6, rect.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, rect.height * 0.7)
    ctx.lineTo(rect.width, rect.height * 0.7)
    ctx.stroke()

    // Center of map
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Draw zones (larger for full map view)
    demoZones.forEach((zone) => {
      const zoneColors: Record<string, { fill: string; stroke: string }> = {
        safe: { fill: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" },
        trusted: { fill: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" },
        routine: { fill: "rgba(139, 92, 246, 0.15)", stroke: "#8b5cf6" },
        danger: { fill: "rgba(239, 68, 68, 0.15)", stroke: "#ef4444" },
      }

      const colors = zoneColors[zone.type]
      const zoneX = centerX + (zone.center.lng - demoPatient.currentPosition.lng) * 8000
      const zoneY = centerY - (zone.center.lat - demoPatient.currentPosition.lat) * 8000
      const radius = zone.radius * 2

      ctx.beginPath()
      ctx.arc(zoneX, zoneY, radius, 0, Math.PI * 2)
      ctx.fillStyle = colors.fill
      ctx.fill()
      ctx.strokeStyle = colors.stroke
      ctx.lineWidth = 2
      if (zone.type === "danger") {
        ctx.setLineDash([8, 8])
      } else {
        ctx.setLineDash([])
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Zone label
      ctx.fillStyle = colors.stroke
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(zone.name, zoneX, zoneY + radius + 20)
    })

    // Draw patient marker
    ctx.beginPath()
    ctx.arc(centerX, centerY, 35, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(16, 185, 129, 0.3)"
    ctx.fill()

    ctx.beginPath()
    ctx.arc(centerX, centerY, 25, 0, Math.PI * 2)
    ctx.fillStyle = "#10b981"
    ctx.fill()

    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.arc(centerX, centerY - 6, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(centerX - 5, centerY + 3, 10, 12)
  }, [])

  return (
    <AppShell title="Live Map">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <Input
              placeholder="Search patient or zone..."
              className="h-10 border-[var(--border-default)] bg-[var(--bg-tertiary)] pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="bg-[var(--accent-primary-muted)] text-[var(--accent-primary)]">
              All Zones
            </Button>
            <Button
              variant="outline"
              className="border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent"
            >
              <span className="mr-2 h-2 w-2 rounded-full bg-[var(--status-safe)]" />
              Safe
            </Button>
            <Button
              variant="outline"
              className="border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent"
            >
              <span className="mr-2 h-2 w-2 rounded-full bg-purple-500" />
              Routine
            </Button>
            <Button
              variant="outline"
              className="border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent"
            >
              <span className="mr-2 h-2 w-2 rounded-full bg-[var(--status-urgent)]" />
              Danger
            </Button>
          </div>
        </div>

        {/* Full Map */}
        <div className="relative h-[calc(100vh-220px)] overflow-hidden rounded-xl border border-[var(--border-subtle)]">
          <canvas ref={canvasRef} className="h-full w-full" />

          {/* Map Controls */}
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="h-9 w-9 bg-[var(--bg-secondary)]">
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-9 w-9 bg-[var(--bg-secondary)]">
              <Minus className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-9 w-9 bg-[var(--bg-secondary)]">
              <Crosshair className="h-4 w-4" />
            </Button>
          </div>

          {/* Live Tracking Card */}
          <Card className="absolute bottom-6 left-6 w-80 border-[var(--border-default)] bg-[var(--bg-secondary)]/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs font-medium uppercase tracking-wide text-red-400">Live Tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-[var(--status-safe)]">
                  <AvatarImage src={demoPatient.photo || "/placeholder.svg"} />
                  <AvatarFallback>ER</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {demoPatient.firstName} {demoPatient.lastName}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">Last update: Just now</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin className="h-4 w-4" />
                <span>Elm Street, Safe Zone</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-[var(--border-default)] bg-transparent">
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
                <Button size="sm" className="flex-1 bg-[var(--accent-primary)]">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Geofences Card */}
          <Card className="absolute bottom-6 right-6 w-72 border-[var(--border-default)] bg-[var(--bg-secondary)]/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-primary)]">Active Geofences</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoZones.map((zone) => (
                <div
                  key={zone.id}
                  className={cn(
                    "rounded-lg border-l-4 bg-[var(--bg-tertiary)] p-3",
                    zone.type === "safe" && "border-l-[var(--status-safe)]",
                    zone.type === "routine" && "border-l-purple-500",
                    zone.type === "danger" && "border-l-[var(--status-urgent)]",
                  )}
                >
                  <p className="text-sm font-medium text-[var(--text-primary)]">{zone.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} Zone • {zone.radius}m radius
                  </p>
                </div>
              ))}
              <Button variant="outline" className="mt-2 w-full border-[var(--border-default)] bg-transparent">
                <Pencil className="mr-2 h-4 w-4" />
                Edit All Zones
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
