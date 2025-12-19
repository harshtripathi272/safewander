import useSWR from 'swr'
import { apiClient } from '@/lib/api-client'
import type { Alert, ActivityEvent } from '@/lib/types'

export function useAlerts(patientId?: string, unacknowledgedOnly = false) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/alerts?patient_id=${patientId || ''}&unacknowledged=${unacknowledgedOnly}`,
    () => apiClient.getAlerts(patientId, unacknowledgedOnly),
    {
      refreshInterval: 2000, // Faster refresh for real-time alerts
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    }
  )

  return {
    alerts: (data || []) as Alert[],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useActivities(patientId: string | undefined, limit = 50) {
  const { data, error, isLoading, mutate } = useSWR(
    patientId ? `/api/alerts/activities/${patientId}?limit=${limit}` : null,
    patientId ? () => apiClient.getActivities(patientId, limit) : null,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  )

  return {
    activities: (data || []) as ActivityEvent[],
    isLoading,
    isError: error,
    mutate,
  }
}

export async function acknowledgeAlert(alertId: string, acknowledgedBy: string) {
  return apiClient.acknowledgeAlert(alertId, acknowledgedBy)
}

export async function resolveAlert(alertId: string) {
  return apiClient.resolveAlert(alertId)
}
