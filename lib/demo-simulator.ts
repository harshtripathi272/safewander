// Demo Simulation Helper
// Use this to trigger realistic scenarios during your demo video

import { apiClient } from './api-client'

export class DemoSimulator {
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  /**
   * Simulate a patient wandering scenario
   * This will:
   * 1. Create a zone exit alert
   * 2. Escalate to urgent
   * 3. Trigger emergency after delay
   */
  async simulateWanderingIncident(patientId: string) {
    console.log('🎬 Starting wandering incident simulation...')

    // Step 1: Advisory alert (patient approaching boundary)
    await apiClient.createAlert({
      patient_id: patientId,
      type: 'geofence',
      level: 'low',
      message: 'Patient approaching safe zone boundary',
      description: 'Movement detected toward exit. Monitoring closely.',
      location: { lat: 40.7580, lng: -73.9855 }
    })

    // Wait 5 seconds
    await this.sleep(5000)

    // Step 2: Warning alert (patient left safe zone)
    await apiClient.createAlert({
      patient_id: patientId,
      type: 'geofence',
      level: 'medium',
      message: 'Patient left safe zone',
      description: 'Detected outside home perimeter. Front door opened.',
      location: { lat: 40.7582, lng: -73.9860 }
    })

    // Wait 5 seconds
    await this.sleep(5000)

    // Step 3: High alert (moving away from home)
    await apiClient.createAlert({
      patient_id: patientId,
      type: 'geofence',
      level: 'high',
      message: '⚠️ Patient moving away from home',
      description: 'Distance increasing. Last seen heading toward Main Street.',
      location: { lat: 40.7585, lng: -73.9870 }
    })

    console.log('✅ Wandering simulation complete')
  }

  /**
   * Simulate battery drain scenario
   */
  async simulateBatteryDrain(patientId: string) {
    console.log('🔋 Simulating battery drain...')

    await apiClient.createAlert({
      patient_id: patientId,
      type: 'battery',
      level: 'medium',
      message: 'Device battery low - 15%',
      description: 'Tracker battery running low. Charge recommended.',
    })

    console.log('✅ Battery alert created')
  }

  /**
   * Simulate vital signs alert
   */
  async simulateVitalsAlert(patientId: string) {
    console.log('💓 Simulating vital signs alert...')

    await apiClient.createAlert({
      patient_id: patientId,
      type: 'vitals',
      level: 'high',
      message: 'Elevated heart rate detected',
      description: 'Heart rate: 105 bpm (above normal threshold of 90 bpm)',
    })

    console.log('✅ Vitals alert created')
  }

  /**
   * Create an emergency situation
   */
  async triggerEmergency(patientId: string) {
    console.log('🚨 Triggering emergency...')

    await apiClient.createEmergency({
      patient_id: patientId,
      last_known_location: { lat: 40.7590, lng: -73.9880 },
      search_radius: 500,
    })

    await apiClient.createAlert({
      patient_id: patientId,
      type: 'geofence',
      level: 'critical',
      message: '🚨 EMERGENCY: Patient missing',
      description: 'Patient has not been located for 30 minutes. Search initiated.',
      location: { lat: 40.7590, lng: -73.9880 }
    })

    console.log('✅ Emergency triggered')
  }

  /**
   * Simulate "happy path" - patient found safe
   */
  async simulatePatientFound(alertId: string) {
    console.log('✅ Simulating patient found...')

    await apiClient.resolveAlert(alertId)
    
    console.log('✅ Patient marked as found')
  }

  /**
   * Start continuous location updates (for live demo)
   */
  startLocationSimulation(patientId: string, onUpdate?: (location: any) => void) {
    if (this.isRunning) return

    this.isRunning = true
    let lat = 40.7580
    let lng = -73.9855

    this.intervalId = setInterval(async () => {
      // Simulate random small movements
      lat += (Math.random() - 0.5) * 0.0001
      lng += (Math.random() - 0.5) * 0.0001

      const location = { lat, lng, timestamp: new Date().toISOString() }

      try {
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
        })

        if (onUpdate) onUpdate(location)
      } catch (error) {
        console.error('Location update failed:', error)
      }
    }, 3000) // Update every 3 seconds

    console.log('🎬 Location simulation started')
  }

  /**
   * Stop location simulation
   */
  stopLocationSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('⏹️ Location simulation stopped')
  }

  /**
   * Run complete demo scenario
   */
  async runFullDemoScenario(patientId: string) {
    console.log('🎬 Starting FULL DEMO SCENARIO...')
    console.log('This will take about 20 seconds')

    // Start with everything normal
    console.log('1️⃣ Initial state: Patient safe at home')
    await this.sleep(3000)

    // Battery warning
    console.log('2️⃣ Battery getting low...')
    await this.simulateBatteryDrain(patientId)
    await this.sleep(5000)

    // Start wandering
    console.log('3️⃣ Patient wandering incident detected...')
    await this.simulateWanderingIncident(patientId)
    await this.sleep(10000)

    // Emergency
    console.log('4️⃣ Escalating to emergency...')
    await this.triggerEmergency(patientId)
    await this.sleep(3000)

    console.log('✅ FULL DEMO SCENARIO COMPLETE!')
    console.log('Now demonstrate resolving the alerts in the UI')
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const demoSimulator = new DemoSimulator()

// Quick access functions for console
export const demo = {
  wandering: (patientId = 'P001') => demoSimulator.simulateWanderingIncident(patientId),
  battery: (patientId = 'P001') => demoSimulator.simulateBatteryDrain(patientId),
  vitals: (patientId = 'P001') => demoSimulator.simulateVitalsAlert(patientId),
  emergency: (patientId = 'P001') => demoSimulator.triggerEmergency(patientId),
  full: (patientId = 'P001') => demoSimulator.runFullDemoScenario(patientId),
  startTracking: (patientId = 'P001') => demoSimulator.startLocationSimulation(patientId),
  stopTracking: () => demoSimulator.stopLocationSimulation(),
}

// Make it available in browser console for easy demo control
if (typeof window !== 'undefined') {
  (window as any).demo = demo
  console.log('🎬 Demo controls loaded! Try: demo.full() or demo.wandering()')
}
