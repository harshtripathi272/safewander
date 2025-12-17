// API Client for SafeWander Backend

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
  async getPatients() {
    return this.request("/api/patients")
  }

  async getPatient(id: string) {
    return this.request(`/api/patients/${id}`)
  }

  async createPatient(data: any) {
    return this.request("/api/patients", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updatePatient(id: string, data: any) {
    return this.request(`/api/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deletePatient(id: string) {
    return this.request(`/api/patients/${id}`, {
      method: "DELETE",
    })
  }

  // Location/Tracking APIs
  async getPatientLocations(patientId: string, limit = 100) {
    return this.request(`/api/tracking/locations/${patientId}?limit=${limit}`)
  }

  async createLocation(data: any) {
    return this.request("/api/tracking/locations", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getZones(patientId?: string) {
    const query = patientId ? `?patient_id=${patientId}` : ""
    return this.request(`/api/tracking/zones${query}`)
  }

  async createZone(data: any) {
    return this.request("/api/tracking/zones", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteZone(id: string) {
    return this.request(`/api/tracking/zones/${id}`, {
      method: "DELETE",
    })
  }

  // Alert APIs
  async getAlerts(patientId?: string, unacknowledgedOnly = false) {
    const params = new URLSearchParams()
    if (patientId) params.append("patient_id", patientId)
    if (unacknowledgedOnly) params.append("unacknowledged_only", "true")

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request(`/api/alerts${query}`)
  }

  async getAlert(id: string) {
    return this.request(`/api/alerts/${id}`)
  }

  async createAlert(data: any) {
    return this.request("/api/alerts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async acknowledgeAlert(id: string, acknowledgedBy: string) {
    return this.request(`/api/alerts/${id}/acknowledge`, {
      method: "PUT",
      body: JSON.stringify({ acknowledged_by: acknowledgedBy }),
    })
  }

  async resolveAlert(id: string) {
    return this.request(`/api/alerts/${id}/resolve`, {
      method: "PUT",
    })
  }

  async getActivities(patientId: string, limit = 50) {
    return this.request(`/api/alerts/activities/${patientId}?limit=${limit}`)
  }

  async createActivity(data: any) {
    return this.request("/api/alerts/activities", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Emergency APIs
  async getEmergencies(activeOnly = true) {
    const query = activeOnly ? "?active_only=true" : ""
    return this.request(`/api/emergency${query}`)
  }

  async getEmergency(id: string) {
    return this.request(`/api/emergency/${id}`)
  }

  async createEmergency(data: any) {
    return this.request("/api/emergency", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async resolveEmergency(id: string, resolutionType = "resolved") {
    return this.request(`/api/emergency/${id}/resolve`, {
      method: "PUT",
      body: JSON.stringify({ resolution_type: resolutionType }),
    })
  }

  async updateSearchRadius(id: string, radius: number) {
    return this.request(`/api/emergency/${id}/update-search-radius`, {
      method: "PUT",
      body: JSON.stringify({ radius }),
    })
  }

  // Report APIs
  async getReports() {
    return this.request("/api/reports")
  }

  async getReport(id: string) {
    return this.request(`/api/reports/${id}`)
  }

  async createReport(data: any) {
    return this.request("/api/reports", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteReport(id: string) {
    return this.request(`/api/reports/${id}`, {
      method: "DELETE",
    })
  }

  // Settings APIs
  async getSettings(category?: string) {
    const query = category ? `?category=${category}` : ""
    return this.request(`/api/settings${query}`)
  }

  async getSetting(category: string, key: string) {
    return this.request(`/api/settings/${category}/${key}`)
  }

  async createOrUpdateSetting(data: any) {
    return this.request("/api/settings", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteSetting(category: string, key: string) {
    return this.request(`/api/settings/${category}/${key}`, {
      method: "DELETE",
    })
  }

  // Auth APIs
  async login(username: string, password: string) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  }

  async logout() {
    return this.request("/api/auth/logout", {
      method: "POST",
    })
  }

  // WebSocket connection
  connectWebSocket(onMessage: (data: any) => void) {
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
