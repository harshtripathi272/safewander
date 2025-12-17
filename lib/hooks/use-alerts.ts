import useSWR from "swr"
import { apiClient } from "../api-client"

export function useAlerts(patientId?: string, unacknowledgedOnly = false) {
  const { data, error, isLoading, mutate } = useSWR(
    ["/api/alerts", patientId, unacknowledgedOnly],
    () => apiClient.getAlerts(patientId, unacknowledgedOnly),
    {
      refreshInterval: 2000, // Refresh every 2 seconds for real-time updates
    },
  )

  return {
    alerts: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useActivities(patientId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/alerts/activities/${patientId}`,
    () => apiClient.getActivities(patientId),
    {
      refreshInterval: 3000,
    },
  )

  return {
    activities: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}
