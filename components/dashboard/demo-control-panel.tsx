"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Play, 
  Square, 
  AlertTriangle, 
  Battery, 
  Heart, 
  Siren,
  Sparkles,
  MapPin,
  CheckCircle2,
  Zap
} from "lucide-react"
import { demo } from "@/lib/demo-simulator"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DemoControlPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const router = useRouter()

  // Get first available patient on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/patients/')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setSelectedPatient(data[0].id)
          console.log('🎯 Demo will use patient:', data[0].id, data[0].name || data[0].firstName)
        }
      })
      .catch(err => console.error('Failed to fetch patients:', err))
  }, [])

  const handleFullDemo = async () => {
    if (!selectedPatient) {
      toast.error("❌ No patient selected!", { description: "Wait for patients to load" })
      return
    }

    setIsRunning(true)
    
    toast.info("🎬 DEMO STARTING!", {
      description: `Creating alerts for patient... Watch the dashboard!`,
      duration: 3000,
    })

    try {
      await demo.full(selectedPatient)
      
      toast.success("✅ Demo Complete!", {
        description: "Go to Alerts page to see and resolve them!",
        duration: 5000,
        action: {
          label: "Go to Alerts",
          onClick: () => router.push('/alerts')
        }
      })
      
      // Refresh the page to show updated data
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Demo error:', error)
      toast.error("❌ Demo Failed!", {
        description: "Make sure backend is running on port 8000",
        duration: 5000,
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleWandering = async () => {
    if (!selectedPatient) return
    toast.loading("🚶 Creating wandering alerts...", { id: 'wandering' })
    try {
      await demo.wandering(selectedPatient)
      toast.success("✅ Wandering alerts created!", {
        id: 'wandering',
        description: "Check the Alerts page!",
        action: {
          label: "View Alerts",
          onClick: () => router.push('/alerts')
        }
      })
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      toast.error("Failed - check backend connection", { id: 'wandering' })
      console.error(error)
    }
  }

  const handleBattery = async () => {
    if (!selectedPatient) return
    toast.loading("🔋 Creating battery alert...", { id: 'battery' })
    try {
      await demo.battery(selectedPatient)
      toast.success("✅ Battery alert created!", {
        id: 'battery',
        description: "Check the Alerts page!",
        action: {
          label: "View Alerts",
          onClick: () => router.push('/alerts')
        }
      })
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      toast.error("Failed - check backend connection", { id: 'battery' })
      console.error(error)
    }
  }

  const handleVitals = async () => {
    if (!selectedPatient) return
    toast.loading("💓 Creating vitals alert...", { id: 'vitals' })
    try {
      await demo.vitals(selectedPatient)
      toast.success("✅ Vitals alert created!", {
        id: 'vitals',
        description: "Check the Alerts page!",
        action: {
          label: "View Alerts",
          onClick: () => router.push('/alerts')
        }
      })
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      toast.error("Failed - check backend connection", { id: 'vitals' })
      console.error(error)
    }
  }

  const handleEmergency = async () => {
    if (!selectedPatient) return
    toast.loading("🚨 Triggering emergency...", { id: 'emergency' })
    try {
      await demo.emergency(selectedPatient)
      toast.error("🚨 EMERGENCY TRIGGERED!", {
        id: 'emergency',
        description: "Check Emergency page!",
        duration: 10000,
        action: {
          label: "Go to Emergency",
          onClick: () => router.push('/emergency')
        }
      })
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      toast.error("Failed - check backend connection", { id: 'emergency' })
      console.error(error)
    }
  }

  const handleTracking = () => {
    if (!selectedPatient) return
    if (isTracking) {
      demo.stopTracking()
      setIsTracking(false)
      toast.info("⏹️ Location tracking stopped")
    } else {
      demo.startTracking(selectedPatient)
      setIsTracking(true)
      toast.success("🎬 Live location simulation started", {
        description: "Location updates every 3 seconds. Map will update on next refresh."
      })
    }
  }

  return (
    <Card className="border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
            <CardTitle className="text-[var(--text-primary)]">🎬 Demo Control Panel</CardTitle>
          </div>
          <Badge className="bg-purple-500 text-white animate-pulse">
            <Zap className="mr-1 h-3 w-3" />
            LIVE
          </Badge>
        </div>
        <CardDescription className="text-[var(--text-secondary)]">
          Click buttons to simulate scenarios • Alerts appear on the Alerts page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Full Demo Button */}
        <div className="space-y-2">
          <Button
            onClick={handleFullDemo}
            disabled={isRunning}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 h-14 text-lg font-bold"
            size="lg"
          >
            {isRunning ? (
              <>
                <Square className="mr-2 h-5 w-5 animate-pulse" />
                Running Demo... (20s)
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                🎬 RUN FULL DEMO SCENARIO
              </>
            )}
          </Button>
          <p className="text-center text-xs text-[var(--text-tertiary)] bg-purple-500/10 rounded p-2">
            ⚡ Creates 5+ alerts automatically • Takes 20 seconds
          </p>
        </div>

        <Separator className="my-4" />

        {/* Individual Controls */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Or trigger individual scenarios:</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleWandering}
              variant="outline"
              className="border-2 border-orange-500/50 bg-orange-500/20 hover:bg-orange-500/30 h-12"
            >
              <AlertTriangle className="mr-2 h-4 w-4 text-orange-400" />
              Wandering
            </Button>

            <Button
              onClick={handleBattery}
              variant="outline"
              className="border-2 border-yellow-500/50 bg-yellow-500/20 hover:bg-yellow-500/30 h-12"
            >
              <Battery className="mr-2 h-4 w-4 text-yellow-400" />
              Low Battery
            </Button>

            <Button
              onClick={handleVitals}
              variant="outline"
              className="border-2 border-pink-500/50 bg-pink-500/20 hover:bg-pink-500/30 h-12"
            >
              <Heart className="mr-2 h-4 w-4 text-pink-400" />
              Vitals Alert
            </Button>

            <Button
              onClick={handleEmergency}
              variant="outline"
              className="border-2 border-red-500/50 bg-red-500/20 hover:bg-red-500/30 h-12"
            >
              <Siren className="mr-2 h-4 w-4 text-red-400" />
              Emergency
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Location Tracking */}
        <Button
          onClick={handleTracking}
          variant={isTracking ? "destructive" : "outline"}
          className="w-full h-12"
        >
          {isTracking ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              ⏹️ Stop Location Simulation
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              📍 Start Location Simulation
            </>
          )}
        </Button>

        <Separator className="my-4" />

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => router.push('/alerts')}
            variant="secondary"
            size="sm"
          >
            View Alerts →
          </Button>
          <Button
            onClick={() => router.push('/emergency')}
            variant="secondary"
            size="sm"
          >
            Emergency →
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between rounded-lg bg-[var(--bg-tertiary)] p-3 border border-green-500/30">
          <span className="text-sm text-[var(--text-secondary)]">Backend Status</span>
          <Badge className="bg-green-500/20 text-green-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-blue-500/10 border-2 border-blue-500/30 p-3">
          <p className="text-xs font-bold text-blue-400 mb-2">📋 How to Use:</p>
          <ol className="text-xs text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
            <li>Click any button above</li>
            <li>Wait for confirmation toast</li>
            <li>Click "View Alerts" to see results</li>
            <li>Resolve alerts in the Alerts page</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
