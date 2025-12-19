"use client"

import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { Zone } from "@/lib/types"
import { useEffect, useState, useCallback } from "react"

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
    patientId ? () => apiClient.getZones(patientId).catch(() => []) : null,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      fallbackData: [],
    }
  )

  const createZone = useCallback(async (zoneData: Partial<Zone>) => {
    try {
      // Transform frontend format to backend format
      const backendData = {
        patient_id: zoneData.patientId || patientId,
        name: zoneData.name,
        type: zoneData.type || 'safe',
        coordinates: zoneData.center ? [{ lat: zoneData.center.lat, lng: zoneData.center.lng }] : [],
        radius: zoneData.radius || 100,
        active: zoneData.isActive !== false,
      }
      const result = await apiClient.createZone(backendData)
      mutate() // Refresh the zones list
      return result
    } catch (error) {
      console.error('Failed to create zone:', error)
      throw error
    }
  }, [patientId, mutate])

  const updateZone = useCallback(async (zoneId: string, zoneData: Partial<Zone>) => {
    try {
      // Transform frontend format to backend format
      const backendData = {
        patient_id: zoneData.patientId || patientId,
        name: zoneData.name,
        type: zoneData.type || 'safe',
        coordinates: zoneData.center ? [{ lat: zoneData.center.lat, lng: zoneData.center.lng }] : [],
        radius: zoneData.radius || 100,
        active: zoneData.isActive !== false,
      }
      const result = await apiClient.updateZone(zoneId, backendData)
      mutate() // Refresh the zones list
      return result
    } catch (error) {
      console.error('Failed to update zone:', error)
      throw error
    }
  }, [patientId, mutate])

  const deleteZone = useCallback(async (zoneId: string) => {
    try {
      await apiClient.deleteZone(zoneId)
      mutate() // Refresh the zones list
    } catch (error) {
      console.error('Failed to delete zone:', error)
      throw error
    }
  }, [mutate])

  return {
    zones: (data || []) as Zone[],
    isLoading,
    isError: error,
    mutate,
    createZone,
    updateZone,
    deleteZone,
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
