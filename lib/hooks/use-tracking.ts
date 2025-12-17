"use client"

import useSWR from "swr"
import { apiClient } from "../api-client"
import { useEffect, useState } from "react"

export function usePatientLocations(patientId: string | null, limit = 100) {
  const { data, error, isLoading, mutate } = useSWR(
    patientId ? `/api/tracking/locations/${patientId}` : null,
    () => (patientId ? apiClient.getPatientLocations(patientId, limit) : null),
    {
      refreshInterval: 5000,
    },
  )

  return {
    locations: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useZones(patientId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    ["/api/tracking/zones", patientId],
    () => apiClient.getZones(patientId),
    {
      refreshInterval: 10000,
    },
  )

  return {
    zones: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// WebSocket hook for real-time location updates
export function useRealtimeTracking(onLocationUpdate: (data: any) => void) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const ws = apiClient.connectWebSocket((data) => {
      if (data.type === "location_update") {
        onLocationUpdate(data)
      }
    })

    setIsConnected(true)

    return () => {
      ws.close()
      setIsConnected(false)
    }
  }, [onLocationUpdate])

  return { isConnected }
}
