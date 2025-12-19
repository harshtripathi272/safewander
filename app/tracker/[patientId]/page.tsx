"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Loader2, CheckCircle, XCircle, Wifi, WifiOff } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function TrackerPage() {
    const params = useParams()
    const patientId = params.patientId as string

    const [isTracking, setIsTracking] = useState(false)
    const [lastSent, setLastSent] = useState<Date | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null)
    const [sendCount, setSendCount] = useState(0)
    const [patientName, setPatientName] = useState<string>("Patient")

    const watchIdRef = useRef<number | null>(null)
    const lastSentRef = useRef<number>(0)

    // Fetch patient info on mount
    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const patient = await apiClient.getPatient(patientId)
                if (patient) {
                    setPatientName(`${patient.firstName} ${patient.lastName}`)
                }
            } catch (err) {
                console.error("[Tracker] Failed to fetch patient:", err)
            }
        }
        fetchPatient()
    }, [patientId])

    const sendLocation = async (lat: number, lng: number, accuracy: number) => {
        // Throttle: send at most every 5 seconds
        const now = Date.now()
        if (now - lastSentRef.current < 5000) return
        lastSentRef.current = now

        try {
            await apiClient.createLocation({
                patient_id: patientId,
                latitude: lat,
                longitude: lng,
                accuracy: accuracy,
            })
            setLastSent(new Date())
            setSendCount(prev => prev + 1)
            setError(null)
        } catch (err) {
            console.error("[Tracker] Failed to send location:", err)
            setError("Failed to send location")
        }
    }

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by this browser")
            return
        }

        setIsTracking(true)
        setError(null)

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords
                setCurrentPosition({ lat: latitude, lng: longitude })
                sendLocation(latitude, longitude, accuracy)
            },
            (err) => {
                console.error("[Tracker] Geolocation error:", err)
                setError(err.message || "Failed to get location")
                setIsTracking(false)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000,
            }
        )
    }

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        setIsTracking(false)
    }

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
            }
        }
    }, [])

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col p-4">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Navigation className="h-8 w-8 text-[var(--accent-primary)]" />
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">SafeWander Tracker</h1>
                </div>
                <p className="text-[var(--text-secondary)]">Tracking for: <strong>{patientName}</strong></p>
            </div>

            {/* Status Card */}
            <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)] mb-6">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                        <span>Tracking Status</span>
                        <Badge className={isTracking
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }>
                            {isTracking ? (
                                <><Wifi className="h-3 w-3 mr-1" /> Active</>
                            ) : (
                                <><WifiOff className="h-3 w-3 mr-1" /> Inactive</>
                            )}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Current Position */}
                    {currentPosition && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                            <MapPin className="h-5 w-5 text-[var(--accent-primary)]" />
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Current Position</p>
                                <p className="font-mono text-sm text-[var(--text-primary)]">
                                    {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Last Sent */}
                    {lastSent && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Last Update Sent</p>
                                <p className="text-sm text-[var(--text-primary)]">
                                    {lastSent.toLocaleTimeString()} ({sendCount} updates sent)
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                            <XCircle className="h-5 w-5 text-red-400" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Button */}
            <Button
                onClick={isTracking ? stopTracking : startTracking}
                className={`w-full h-16 text-lg ${isTracking
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90"
                    }`}
            >
                {isTracking ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Stop Tracking
                    </>
                ) : (
                    <>
                        <Navigation className="mr-2 h-5 w-5" />
                        Start Tracking
                    </>
                )}
            </Button>

            {/* Info */}
            <p className="text-xs text-center text-[var(--text-tertiary)] mt-4">
                Keep this page open to continue sending location updates.
                <br />
                Updates are sent every 5 seconds.
            </p>
        </div>
    )
}
