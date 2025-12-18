"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Play,
    AlertTriangle,
    Battery,
    Heart,
    MapPin,
    RotateCcw,
    Loader2,
    CheckCircle2,
    XCircle,
    Home
} from "lucide-react"
import { demoSimulator } from "@/lib/demo-simulator"

interface SimulationPanelProps {
    patientId: string
}

export function SimulationPanel({ patientId }: SimulationPanelProps) {
    const [isRunning, setIsRunning] = useState(false)
    const [currentScenario, setCurrentScenario] = useState<string | null>(null)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState<string>('')

    const runScenario = async (
        name: string,
        fn: () => Promise<void>
    ) => {
        setIsRunning(true)
        setCurrentScenario(name)
        setStatus('idle')
        setMessage('')

        try {
            await fn()
            setStatus('success')
            setMessage(`${name} completed successfully!`)
        } catch (error) {
            setStatus('error')
            setMessage(`${name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsRunning(false)
            setTimeout(() => {
                setCurrentScenario(null)
                setStatus('idle')
                setMessage('')
            }, 3000)
        }
    }

    return (
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg text-[var(--text-primary)]">
                            Demo Scenarios
                        </CardTitle>
                        <CardDescription className="text-[var(--text-secondary)]">
                            Simulate different alert scenarios for testing
                        </CardDescription>
                    </div>
                    <Badge
                        variant="outline"
                        className={
                            status === 'success'
                                ? 'border-[var(--status-safe)] text-[var(--status-safe)]'
                                : status === 'error'
                                    ? 'border-[var(--status-urgent)] text-[var(--status-urgent)]'
                                    : 'border-[var(--border-default)] text-[var(--text-secondary)]'
                        }
                    >
                        {status === 'success' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {status === 'error' && <XCircle className="mr-1 h-3 w-3" />}
                        {status === 'idle' ? 'Ready' : status === 'success' ? 'Success' : 'Error'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status Message */}
                {message && (
                    <div className={`rounded-lg p-3 text-sm ${status === 'success'
                        ? 'bg-[var(--accent-primary-muted)] text-[var(--status-safe)]'
                        : 'bg-red-500/10 text-[var(--status-urgent)]'
                        }`}>
                        {message}
                    </div>
                )}

                {/* Scenario Buttons */}
                <div className="grid gap-2">
                    <Button
                        onClick={() => runScenario(
                            'Full Demo',
                            () => demoSimulator.runFullDemoScenario(patientId)
                        )}
                        disabled={isRunning}
                        className="w-full justify-start bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90"
                    >
                        {isRunning && currentScenario === 'Full Demo' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="mr-2 h-4 w-4" />
                        )}
                        Run Full Demo Scenario
                        <Badge variant="secondary" className="ml-auto">~30s</Badge>
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={() => runScenario(
                                'Wandering',
                                () => demoSimulator.simulateWanderingIncident(patientId)
                            )}
                            disabled={isRunning}
                            variant="outline"
                            className="justify-start border-[var(--border-default)] bg-transparent"
                        >
                            {isRunning && currentScenario === 'Wandering' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <MapPin className="mr-2 h-4 w-4" />
                            )}
                            Wandering
                        </Button>

                        <Button
                            onClick={() => runScenario(
                                'Battery Alert',
                                () => demoSimulator.simulateBatteryDrain(patientId)
                            )}
                            disabled={isRunning}
                            variant="outline"
                            className="justify-start border-[var(--border-default)] bg-transparent"
                        >
                            {isRunning && currentScenario === 'Battery Alert' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Battery className="mr-2 h-4 w-4" />
                            )}
                            Battery
                        </Button>

                        <Button
                            onClick={() => runScenario(
                                'Vitals Alert',
                                () => demoSimulator.simulateVitalsAlert(patientId)
                            )}
                            disabled={isRunning}
                            variant="outline"
                            className="justify-start border-[var(--border-default)] bg-transparent"
                        >
                            {isRunning && currentScenario === 'Vitals Alert' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Heart className="mr-2 h-4 w-4" />
                            )}
                            Vitals
                        </Button>

                        <Button
                            onClick={() => runScenario(
                                'Emergency',
                                () => demoSimulator.triggerEmergency(patientId)
                            )}
                            disabled={isRunning}
                            variant="outline"
                            className="justify-start border-[var(--border-default)] bg-transparent"
                        >
                            {isRunning && currentScenario === 'Emergency' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <AlertTriangle className="mr-2 h-4 w-4" />
                            )}
                            Emergency
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={() => runScenario(
                                'Reset',
                                () => demoSimulator.resetDemo(patientId)
                            )}
                            disabled={isRunning}
                            variant="outline"
                            className="justify-start border-[var(--status-urgent)] text-[var(--status-urgent)] hover:bg-red-500/10"
                        >
                            {isRunning && currentScenario === 'Reset' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RotateCcw className="mr-2 h-4 w-4" />
                            )}
                            Reset
                        </Button>
                        <Button
                            onClick={() => runScenario(
                                'Return Home',
                                () => demoSimulator.returnHome(patientId)
                            )}
                            disabled={isRunning}
                            variant="outline"
                            className="justify-start border-[var(--status-safe)] text-[var(--status-safe)] hover:bg-green-500/10"
                        >
                            {isRunning && currentScenario === 'Return Home' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Home className="mr-2 h-4 w-4" />
                            )}
                            Return Home
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-3">
                    <p className="text-xs text-[var(--text-secondary)]">
                        <strong className="text-[var(--text-primary)]">🎬 Demo:</strong> Click "Run Full Demo" to see the patient move on the map in real-time!
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
