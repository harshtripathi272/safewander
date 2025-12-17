"use client"

import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { Zone } from "@/lib/types"
import { useEffect, useState } from "react"

export function useLocations(patientId: string | undefined, limit = 100) {
  const { data, error, isLoading, mutate } = useSWR(
    patientId ? `/api/tracking/locations/${patientId}?limit=${limit}` : null,
    patientId ? () => apiClient.getPatientLocations(patientId, limit) : null,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  )

  return {
    locations: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useZones(patientId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    patientId ? `/api/tracking/zones?patient_id=${patientId}` : null,
    patientId ? () => apiClient.getZones(patientId) : null,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  )

  return {
    zones: (data || []) as Zone[],
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
