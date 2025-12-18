import useSWR from 'swr'
import { apiClient } from '@/lib/api-client'
import type { Patient } from '@/lib/types'

export function usePatients() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/patients',
    () => apiClient.getPatients(),
    {
      refreshInterval: 500, // Faster refresh (500ms) for real-time position updates
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 100, // Allow rapid refetches
    }
  )

  return {
    patients: (data || []) as Patient[],
    isLoading,
    isError: error,
    mutate,
  }
}

export function usePatient(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/patients/${id}` : null,
    id ? () => apiClient.getPatient(id) : null,
    {
      refreshInterval: 500, // Faster refresh for real-time updates
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 100,
    }
  )

  return {
    patient: data as Patient | undefined,
    isLoading,
    isError: error,
    mutate,
  }
}
