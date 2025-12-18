"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Crosshair, Layers } from "lucide-react"
import type { Patient, Zone } from "@/lib/types"

interface LiveMapProps {
  patient: Patient
  zones: Zone[]
  className?: string
}

export function LiveMap({ patient, zones, className }: LiveMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Auto-refresh every 1 second for smooth live location updates during simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 1000) // Faster refresh for visible movement

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Dark map background
    ctx.fillStyle = "#0f1419"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.05)"
    ctx.lineWidth = 1
    for (let x = 0; x < rect.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }
    for (let y = 0; y < rect.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Draw some "roads" for visual effect
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)"
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(0, rect.height * 0.4)
    ctx.lineTo(rect.width, rect.height * 0.4)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rect.width * 0.3, 0)
    ctx.lineTo(rect.width * 0.3, rect.height)
    ctx.stroke()

    // Center of map (represents "home" position at 40.7580, -73.9855)
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Reference coordinates for home position
    const homeLat = 40.7580
    const homeLng = -73.9855
    const scaleFactor = 15000 // Pixels per degree - adjust for zoom

    // Draw zones
    zones.forEach((zone) => {
      // Skip if zone doesn't have proper center coordinates
      if (!zone.center) return

      const zoneColors: Record<string, { fill: string; stroke: string }> = {
        safe: { fill: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" },
        trusted: { fill: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" },
        routine: { fill: "rgba(139, 92, 246, 0.15)", stroke: "#8b5cf6" },
        danger: { fill: "rgba(239, 68, 68, 0.15)", stroke: "#ef4444" },
      }

      const colors = zoneColors[zone.type] || zoneColors.safe
      const zoneX = centerX + ((zone.center?.lng ?? homeLng) - homeLng) * scaleFactor
      const zoneY = centerY - ((zone.center?.lat ?? homeLat) - homeLat) * scaleFactor
      const radius = (zone.radius ?? 50) * 1.5

      ctx.beginPath()
      ctx.arc(zoneX, zoneY, radius, 0, Math.PI * 2)
      ctx.fillStyle = colors.fill
      ctx.fill()
      ctx.strokeStyle = colors.stroke
      ctx.lineWidth = 2
      if (zone.type === "danger") {
        ctx.setLineDash([5, 5])
      } else {
        ctx.setLineDash([])
      }
      ctx.stroke()
      ctx.setLineDash([])
    })

    // Calculate patient position relative to home
    const patientLat = patient?.currentPosition?.lat ?? homeLat
    const patientLng = patient?.currentPosition?.lng ?? homeLng

    // Convert GPS coordinates to canvas position
    const patientX = centerX + (patientLng - homeLng) * scaleFactor
    const patientY = centerY - (patientLat - homeLat) * scaleFactor

    // Log position for debugging
    console.log(`[Map] Patient position: (${patientLat.toFixed(4)}, ${patientLng.toFixed(4)}) -> Canvas: (${patientX.toFixed(0)}, ${patientY.toFixed(0)})`)

    // Outer pulse ring
    ctx.beginPath()
    ctx.arc(patientX, patientY, 28, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(16, 185, 129, 0.3)"
    ctx.fill()

    // Inner circle
    ctx.beginPath()
    ctx.arc(patientX, patientY, 20, 0, Math.PI * 2)
    ctx.fillStyle = "#10b981"
    ctx.fill()

    // Patient icon (simplified person)
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.arc(patientX, patientY - 5, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(patientX - 4, patientY + 2, 8, 10)

    // Draw home marker at center (reference point)
    ctx.beginPath()
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(59, 130, 246, 0.6)"
    ctx.fill()
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.stroke()

    // Home icon (simple house shape)
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - 6)
    ctx.lineTo(centerX - 6, centerY)
    ctx.lineTo(centerX + 6, centerY)
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(centerX - 4, centerY, 8, 6)

  }, [patient, zones, refreshKey])

  return (
    <Card className={`border-[var(--border-subtle)] bg-[var(--bg-secondary)] ${className}`}>
      <CardContent className="relative h-full min-h-[400px] overflow-hidden rounded-lg p-0">
        <canvas ref={canvasRef} className="h-full w-full" style={{ display: "block" }} />

        {/* Zone Info Overlay */}
        {patient?.currentPosition && zones.length > 0 && (
          <div className="absolute left-4 top-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]/90 p-4 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Current Zone</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
              {zones[0]?.name || "Unknown Zone"}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {zones[0]?.radius ? `${zones[0].radius}m radius` : "N/A"} • {zones[0]?.type ? zones[0].type.charAt(0).toUpperCase() + zones[0].type.slice(1) : "Unknown"} Zone
            </p>
            <Badge className={`mt-2 ${zones[0]?.type === 'safe'
              ? 'bg-[var(--accent-primary-muted)] text-[var(--status-safe)]'
              : zones[0]?.type === 'danger'
                ? 'bg-red-500/15 text-[var(--status-urgent)]'
                : 'bg-blue-500/15 text-blue-500'
              }`}>
              Inside Zone
            </Badge>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]/90 p-3 backdrop-blur-sm">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[var(--status-safe)]" />
              <span className="text-[var(--text-secondary)]">Safe Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="text-[var(--text-secondary)]">Routine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-dashed border-[var(--status-urgent)]" />
              <span className="text-[var(--text-secondary)]">Danger</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
