import useSWR from 'swr'
import { apiClient } from '@/lib/api-client'
import type { Patient } from '@/lib/types'

export function usePatients() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/patients',
    () => apiClient.getPatients(),
    {
      refreshInterval: 1000, // Fast refresh for real-time map movement
      revalidateOnFocus: true,
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
      refreshInterval: 3000,
      revalidateOnFocus: true,
    }
  )

  return {
    patient: data as Patient | undefined,
    isLoading,
    isError: error,
    mutate,
  }
}
