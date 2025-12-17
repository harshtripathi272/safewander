"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { demoPatient } from "@/lib/data"
import { Shield, X, Clock, Battery, MapPin, Phone, Share2, Bell, User, Shirt, Heart, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function EmergencyPage() {
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

    // Dark map background
    ctx.fillStyle = "#0f1419"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Grid
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

    // Roads
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)"
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(0, rect.height * 0.4)
    ctx.lineTo(rect.width, rect.height * 0.4)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rect.width * 0.4, 0)
    ctx.lineTo(rect.width * 0.4, rect.height)
    ctx.stroke()

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Search radius circles
    // Extended range (outer)
    ctx.beginPath()
    ctx.arc(centerX, centerY, 150, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(220, 38, 38, 0.3)"
    ctx.setLineDash([10, 10])
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.setLineDash([])

    // Medium probability
    ctx.beginPath()
    ctx.arc(centerX, centerY, 100, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(220, 38, 38, 0.1)"
    ctx.fill()
    ctx.strokeStyle = "rgba(220, 38, 38, 0.4)"
    ctx.lineWidth = 2
    ctx.stroke()

    // High probability (inner)
    ctx.beginPath()
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(220, 38, 38, 0.2)"
    ctx.fill()
    ctx.strokeStyle = "#dc2626"
    ctx.lineWidth = 2
    ctx.stroke()

    // Home marker
    ctx.beginPath()
    ctx.arc(centerX - 80, centerY + 60, 12, 0, Math.PI * 2)
    ctx.fillStyle = "#10b981"
    ctx.fill()

    // Last known location marker (pulsing)
    ctx.beginPath()
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(220, 38, 38, 0.5)"
    ctx.fill()
    ctx.beginPath()
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2)
    ctx.fillStyle = "#dc2626"
    ctx.fill()
    ctx.fillStyle = "white"
    ctx.font = "bold 12px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("!", centerX, centerY)
  }, [])

  const handleCall911 = () => {
    toast.error("🚨 Emergency Services: Simulated call to 911", {
      description: "In production, this would initiate a real emergency call"
    })
    // In production: window.location.href = 'tel:911'
  }

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/track/${demoPatient.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Emergency: ${demoPatient.firstName} ${demoPatient.lastName}`,
          text: 'Track missing person location in real-time',
          url: shareUrl
        })
        toast.success("Live tracking link shared successfully")
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(shareUrl)
          toast.success("Live tracking link copied to clipboard")
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Live tracking link copied to clipboard")
    }
  }

  const handleNotifyNetwork = () => {
    toast.success("Alert sent to emergency contact network", {
      description: "3 contacts notified: Jane Doe, Dr. Emily Chen, Robert Rigby"
    })
    // In production: Call API to send notifications
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Emergency Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-red-900/50 bg-gradient-to-r from-red-950/50 to-[var(--bg-secondary)] px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-lg font-semibold text-[var(--text-primary)]">SafeWander</span>
        </div>

        <Badge className="animate-pulse bg-red-600 px-4 py-1.5 text-sm text-white">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-white" />
          EMERGENCY ACTIVE
        </Badge>

        <Link href="/">
          <Button variant="outline" className="border-[var(--border-default)] bg-transparent">
            <X className="mr-2 h-4 w-4" />
            Exit Mode
          </Button>
        </Link>
      </header>

      <div className="flex">
        {/* Left Panel - Missing Person Info */}
        <div className="w-[400px] shrink-0 border-r border-red-900/30 bg-[var(--bg-secondary)] p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs font-medium uppercase tracking-wide text-red-400">Missing Person</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Incident #9921</p>
            </div>

            {/* Photo */}
            <div className="flex justify-center">
              <Avatar className="h-36 w-36 border-4 border-red-500">
                <AvatarImage src={demoPatient.photo || "/placeholder.svg"} />
                <AvatarFallback className="text-3xl">ER</AvatarFallback>
              </Avatar>
            </div>

            {/* Name & Status */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {demoPatient.firstName} {demoPatient.lastName}
              </h1>
              <p className="mt-1 text-[var(--status-urgent)]">Left Geo-Fence 14m ago</p>
              <p className="text-sm text-[var(--text-tertiary)]">Last seen 10:42 PM</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-[var(--bg-tertiary)] p-3 text-center">
                <Clock className="mx-auto h-5 w-5 text-[var(--status-warning)]" />
                <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">14m</p>
                <p className="text-xs text-[var(--text-tertiary)]">Elapsed</p>
              </div>
              <div className="rounded-lg bg-[var(--bg-tertiary)] p-3 text-center">
                <Battery className="mx-auto h-5 w-5 text-[var(--status-safe)]" />
                <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">82%</p>
                <p className="text-xs text-[var(--text-tertiary)]">Tracker</p>
              </div>
              <div className="rounded-lg bg-[var(--bg-tertiary)] p-3 text-center">
                <MapPin className="mx-auto h-5 w-5 text-[var(--accent-secondary)]" />
                <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">Home</p>
                <p className="text-xs text-[var(--text-tertiary)]">Last Zone</p>
              </div>
            </div>

            {/* Physical Description */}
            <div className="space-y-3 rounded-lg bg-[var(--bg-tertiary)] p-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-[var(--text-tertiary)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  {demoPatient.height} / {demoPatient.weight}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Shirt className="h-4 w-4 text-[var(--text-tertiary)]" />
                <span className="text-sm text-[var(--text-secondary)]">Blue Cardigan, Gray Pants</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-[var(--text-tertiary)]" />
                <span className="text-sm text-[var(--text-secondary)]">Dementia, Limited verbal communication</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-[var(--text-tertiary)]" />
                <span className="text-sm text-[var(--text-secondary)]">{demoPatient.distinguishingFeatures}</span>
              </div>
            </div>

            {/* Activity Log */}
            <div>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                Activity Log
              </h3>
              <div className="space-y-2">
                {[
                  { text: "Geo-fence Exit Alert", time: "10:42 PM", color: "text-red-400" },
                  { text: "Motion Detected - Front Door", time: "10:41 PM", color: "text-orange-400" },
                  { text: "Heart Rate Spike (95 bpm)", time: "10:40 PM", color: "text-amber-400" },
                  { text: "Left Living Room", time: "10:38 PM", color: "text-blue-400" },
                ].map((event, i) => (
                  <div key={i} className="flex items-center justify-between rounded bg-[var(--bg-tertiary)] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${event.color.replace("text-", "bg-")}`} />
                      <span className="text-sm text-[var(--text-secondary)]">{event.text}</span>
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)]">{event.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Map & Actions */}
        <div className="flex flex-1 flex-col">
          {/* Map */}
          <div className="relative flex-1">
            <canvas ref={canvasRef} className="h-full w-full" />

            {/* Search Zone Info */}
            <Card className="absolute bottom-6 left-6 border-[var(--border-default)] bg-[var(--bg-secondary)]/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-400" />
                  <span className="font-medium text-[var(--text-primary)]">Oakwood Residential District</span>
                </div>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Radius: 0.5 miles • High Accuracy</p>
              </CardContent>
            </Card>

            {/* Last Signal Marker Info */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-16">
              <Badge className="bg-red-600 text-white">Last Signal: 2m ago</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6">
            <div className="flex gap-4">
              <Button 
                onClick={handleCall911}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 py-6 text-lg font-semibold text-white hover:from-red-700 hover:to-red-800"
              >
                <Phone className="mr-3 h-6 w-6" />
                CALL 911
                <span className="ml-2 text-sm opacity-70">Emergency Services</span>
              </Button>
              <Button 
                onClick={handleShareLink}
                variant="outline" 
                className="flex-1 border-[var(--border-default)] py-6 text-lg bg-transparent"
              >
                <Share2 className="mr-3 h-6 w-6" />
                Share Live Link
              </Button>
              <Button 
                onClick={handleNotifyNetwork}
                variant="outline" 
                className="flex-1 border-[var(--border-default)] py-6 text-lg bg-transparent"
              >
                <Bell className="mr-3 h-6 w-6" />
                Notify Network
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
