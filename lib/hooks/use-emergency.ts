import useSWR from 'swr'
import { apiClient } from '@/lib/api-client'

export function useEmergencies(activeOnly = true) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/emergency?active_only=${activeOnly}`,
    () => apiClient.getEmergencies(activeOnly),
    {
      refreshInterval: 2000, // Refresh every 2 seconds for emergencies
      revalidateOnFocus: true,
    }
  )

  return {
    emergencies: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useEmergency(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/emergency/${id}` : null,
    () => id ? apiClient.getEmergency(id) : null,
    {
      refreshInterval: 2000,
      revalidateOnFocus: true,
    }
  )

  return {
    emergency: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createEmergency(data: any) {
  return apiClient.createEmergency(data)
}

export async function resolveEmergency(id: string, resolutionType = 'resolved') {
  return apiClient.resolveEmergency(id, resolutionType)
}
