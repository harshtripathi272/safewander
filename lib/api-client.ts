// API Client for SafeWander Backend
import type { Patient, Zone, Alert, ActivityEvent } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || `API Error: ${response.status}`)
    }

    return response.json()
  }

  // Patient APIs
  async getPatients(): Promise<Patient[]> {
    return this.request<Patient[]>("/api/patients")
  }

  async getPatient(id: string): Promise<Patient> {
    return this.request<Patient>(`/api/patients/${id}`)
  }

  async createPatient(data: any): Promise<Patient> {
    return this.request<Patient>("/api/patients", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updatePatient(id: string, data: any): Promise<Patient> {
    return this.request<Patient>(`/api/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deletePatient(id: string): Promise<void> {
    return this.request<void>(`/api/patients/${id}`, {
      method: "DELETE",
    })
  }

  // Location/Tracking APIs
  async getPatientLocations(patientId: string, limit = 100): Promise<any[]> {
    return this.request<any[]>(`/api/tracking/locations/${patientId}?limit=${limit}`)
  }

  async createLocation(data: any): Promise<any> {
    return this.request<any>("/api/tracking/locations", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getZones(patientId?: string): Promise<Zone[]> {
    const query = patientId ? `?patient_id=${patientId}` : ""
    return this.request<Zone[]>(`/api/tracking/zones${query}`)
  }

  async createZone(data: any): Promise<Zone> {
    return this.request<Zone>("/api/tracking/zones", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteZone(id: string): Promise<void> {
    return this.request<void>(`/api/tracking/zones/${id}`, {
      method: "DELETE",
    })
  }

  // Alert APIs
  async getAlerts(patientId?: string, unacknowledgedOnly = false): Promise<Alert[]> {
    const params = new URLSearchParams()
    if (patientId) params.append("patient_id", patientId)
    if (unacknowledgedOnly) params.append("unacknowledged_only", "true")

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Alert[]>(`/api/alerts${query}`)
  }

  async getAlert(id: string): Promise<Alert> {
    return this.request<Alert>(`/api/alerts/${id}`)
  }

  async createAlert(data: any): Promise<Alert> {
    return this.request<Alert>("/api/alerts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async acknowledgeAlert(id: string, acknowledgedBy: string): Promise<Alert> {
    return this.request<Alert>(`/api/alerts/${id}/acknowledge`, {
      method: "PUT",
      body: JSON.stringify({ acknowledged_by: acknowledgedBy }),
    })
  }

  async resolveAlert(id: string): Promise<Alert> {
    return this.request<Alert>(`/api/alerts/${id}/resolve`, {
      method: "PUT",
    })
  }

  async getActivities(patientId: string, limit = 50): Promise<ActivityEvent[]> {
    return this.request<ActivityEvent[]>(`/api/alerts/activities/${patientId}?limit=${limit}`)
  }

  async createActivity(data: any): Promise<ActivityEvent> {
    return this.request<ActivityEvent>("/api/alerts/activities", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Emergency APIs
  async getEmergencies(activeOnly = true): Promise<any[]> {
    const query = activeOnly ? "?active_only=true" : ""
    return this.request<any[]>(`/api/emergency${query}`)
  }

  async getEmergency(id: string): Promise<any> {
    return this.request<any>(`/api/emergency/${id}`)
  }

  async createEmergency(data: any): Promise<any> {
    return this.request<any>("/api/emergency", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async resolveEmergency(id: string, resolutionType = "resolved"): Promise<any> {
    return this.request<any>(`/api/emergency/${id}/resolve`, {
      method: "PUT",
      body: JSON.stringify({ resolution_type: resolutionType }),
    })
  }

  async updateSearchRadius(id: string, radius: number): Promise<any> {
    return this.request<any>(`/api/emergency/${id}/update-search-radius`, {
      method: "PUT",
      body: JSON.stringify({ radius }),
    })
  }

  // Report APIs
  async getReports(): Promise<any[]> {
    return this.request<any[]>("/api/reports")
  }

  async getReport(id: string): Promise<any> {
    return this.request<any>(`/api/reports/${id}`)
  }

  async createReport(data: any): Promise<any> {
    return this.request<any>("/api/reports", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteReport(id: string): Promise<void> {
    return this.request<void>(`/api/reports/${id}`, {
      method: "DELETE",
    })
  }

  // Settings APIs
  async getSettings(category?: string): Promise<any[]> {
    const query = category ? `?category=${category}` : ""
    return this.request<any[]>(`/api/settings${query}`)
  }

  async getSetting(category: string, key: string): Promise<any> {
    return this.request<any>(`/api/settings/${category}/${key}`)
  }

  async createOrUpdateSetting(data: any): Promise<any> {
    return this.request<any>("/api/settings", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteSetting(category: string, key: string): Promise<void> {
    return this.request<void>(`/api/settings/${category}/${key}`, {
      method: "DELETE",
    })
  }

  // Auth APIs
  async login(username: string, password: string): Promise<any> {
    return this.request<any>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  }

  async logout(): Promise<void> {
    return this.request<void>("/api/auth/logout", {
      method: "POST",
    })
  }

  // WebSocket connection
  connectWebSocket(onMessage: (data: any) => void): WebSocket {
    const wsUrl = this.baseUrl.replace("http", "ws")
    const ws = new WebSocket(`${wsUrl}/api/tracking/ws`)

    ws.onopen = () => {
      console.log("[v0] WebSocket connected")
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error("[v0] WebSocket message parse error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("[v0] WebSocket error:", error)
    }

    ws.onclose = () => {
      console.log("[v0] WebSocket disconnected")
    }

    return ws
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
