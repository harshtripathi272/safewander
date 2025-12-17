import useSWR from "swr"
import { apiClient } from "../api-client"

export function usePatients() {
  const { data, error, isLoading, mutate } = useSWR("/api/patients", () => apiClient.getPatients(), {
    refreshInterval: 5000, // Refresh every 5 seconds
  })

  return {
    patients: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function usePatient(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/patients/${id}` : null,
    () => (id ? apiClient.getPatient(id) : null),
    {
      refreshInterval: 3000,
    },
  )

  return {
    patient: data,
    isLoading,
    isError: error,
    mutate,
  }
}
