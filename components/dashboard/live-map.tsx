"use client"

import { useEffect, useRef } from "react"
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

    // Center of map
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Draw zones
    zones.forEach((zone) => {
      const zoneColors: Record<string, { fill: string; stroke: string }> = {
        safe: { fill: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" },
        trusted: { fill: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" },
        routine: { fill: "rgba(139, 92, 246, 0.15)", stroke: "#8b5cf6" },
        danger: { fill: "rgba(239, 68, 68, 0.15)", stroke: "#ef4444" },
      }

      const colors = zoneColors[zone.type]
      const zoneX = centerX + (zone.center.lng - patient.currentPosition.lng) * 5000
      const zoneY = centerY - (zone.center.lat - patient.currentPosition.lat) * 5000
      const radius = zone.radius * 1.5

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

    // Draw patient marker
    const patientX = centerX
    const patientY = centerY

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
  }, [patient, zones])

  return (
    <Card className={`border-[var(--border-subtle)] bg-[var(--bg-secondary)] ${className}`}>
      <CardContent className="relative h-full min-h-[400px] overflow-hidden rounded-lg p-0">
        <canvas ref={canvasRef} className="h-full w-full" style={{ display: "block" }} />

        {/* Zone Info Overlay */}
        <div className="absolute left-4 top-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]/90 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Current Zone</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Home Perimeter</p>
          <p className="text-sm text-[var(--text-secondary)]">50m radius • Safe Zone</p>
          <Badge className="mt-2 bg-[var(--accent-primary-muted)] text-[var(--status-safe)]">Inside Zone</Badge>
        </div>

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
