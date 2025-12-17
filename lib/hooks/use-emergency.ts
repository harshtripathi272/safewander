import useSWR from "swr"
import { apiClient } from "../api-client"

export function useEmergencies(activeOnly = true) {
  const { data, error, isLoading, mutate } = useSWR(
    ["/api/emergency", activeOnly],
    () => apiClient.getEmergencies(activeOnly),
    {
      refreshInterval: 2000,
    },
  )

  return {
    emergencies: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useEmergency(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/emergency/${id}` : null,
    () => (id ? apiClient.getEmergency(id) : null),
    {
      refreshInterval: 1000, // Fast refresh for emergency situations
    },
  )

  return {
    emergency: data,
    isLoading,
    isError: error,
    mutate,
  }
}
