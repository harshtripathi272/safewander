// Demo Simulation Helper
// Use this to trigger realistic scenarios during your demo video

import { apiClient } from './api-client'

export class DemoSimulator {
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  /**
   * Simulate a patient wandering scenario with VISIBLE map movement
   * The patient marker will move on the map in real-time
   */
  async simulateWanderingIncident(patientId: string, onLocationUpdate?: (lat: number, lng: number) => void) {
    console.log('🎬 Starting wandering incident simulation with MAP MOVEMENT...')

    // Starting position (center of safe zone)
    let lat = 40.7580
    let lng = -73.9855

    try {
      // Step 1: Patient starts moving toward boundary
      console.log('  📍 Step 1: Patient approaching boundary...')

      // Create initial location and alert
      await apiClient.createLocation({
        patient_id: patientId,
        latitude: lat,
        longitude: lng,
        accuracy: 10,
      })

      await apiClient.createAlert({
        patient_id: patientId,
        type: 'geofence',
        level: 'low',
        message: 'Patient approaching safe zone boundary',
        description: 'Movement detected toward exit. Monitoring closely.',
        location: { lat, lng }
      })

      // Animate movement toward boundary (5 steps over 5 seconds)
      for (let i = 0; i < 5; i++) {
        await this.sleep(1000)
        lat += 0.0002
        lng -= 0.0003
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
        })
        onLocationUpdate?.(lat, lng)
        console.log(`    Moving... (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
      }

      // Step 2: Patient crosses boundary - left safe zone
      console.log('  ⚠️  Step 2: Patient left safe zone...')

      await apiClient.createAlert({
        patient_id: patientId,
        type: 'geofence',
        level: 'medium',
        message: 'Patient left safe zone',
        description: 'Detected outside home perimeter. Front door opened.',
        location: { lat, lng }
      })

      // Continue moving (5 more steps)
      for (let i = 0; i < 5; i++) {
        await this.sleep(1000)
        lat += 0.0003
        lng -= 0.0004
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
        })
        onLocationUpdate?.(lat, lng)
        console.log(`    Moving further... (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
      }

      // Step 3: High alert - moving away from home
      console.log('  🚨 Step 3: Patient moving away from home...')

      await apiClient.createAlert({
        patient_id: patientId,
        type: 'geofence',
        level: 'high',
        message: '⚠️ Patient moving away from home',
        description: 'Distance increasing. Last seen heading toward Main Street.',
        location: { lat, lng }
      })

      // Final rapid movement (5 more steps)
      for (let i = 0; i < 5; i++) {
        await this.sleep(800)
        lat += 0.0004
        lng -= 0.0005
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
        })
        onLocationUpdate?.(lat, lng)
        console.log(`    Moving rapidly... (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
      }

      console.log('✅ Wandering simulation complete - Patient has moved significantly on map!')
    } catch (error) {
      console.error('❌ Wandering simulation failed:', error)
      throw error
    }
  }

  /**
   * Simulate battery drain scenario
   */
  async simulateBatteryDrain(patientId: string) {
    console.log('🔋 Simulating battery drain...')

    try {
      await apiClient.createAlert({
        patient_id: patientId,
        type: 'battery',
        level: 'medium',
        message: 'Device battery low - 15%',
        description: 'Tracker battery running low. Charge recommended.',
      })

      console.log('✅ Battery alert created')
    } catch (error) {
      console.error('❌ Battery simulation failed:', error)
      throw error
    }
  }

  /**
   * Simulate vital signs alert
   */
  async simulateVitalsAlert(patientId: string) {
    console.log('💓 Simulating vital signs alert...')

    try {
      await apiClient.createAlert({
        patient_id: patientId,
        type: 'vitals',
        level: 'high',
        message: 'Elevated heart rate detected',
        description: 'Heart rate: 105 bpm (above normal threshold of 90 bpm)',
      })

      console.log('✅ Vitals alert created')
    } catch (error) {
      console.error('❌ Vitals simulation failed:', error)
      throw error
    }
  }

  /**
   * Create an emergency situation
   */
  async triggerEmergency(patientId: string) {
    console.log('🚨 Triggering emergency...')

    try {
      // Check if emergency already exists
      const existingEmergencies = await apiClient.getEmergencies(true)
      const hasActiveEmergency = existingEmergencies.some(
        (e: any) => e.patient_id === patientId && e.status === 'active'
      )

      if (hasActiveEmergency) {
        console.log('⚠️  Emergency already active for this patient - skipping emergency creation')
      } else {
        await apiClient.createEmergency({
          patient_id: patientId,
          last_known_location: { lat: 40.7590, lng: -73.9880 },
          search_radius: 500,
        })
      }

      await apiClient.createAlert({
        patient_id: patientId,
        type: 'geofence',
        level: 'critical',
        message: '🚨 EMERGENCY: Patient missing',
        description: 'Patient has not been located for 30 minutes. Search initiated.',
        location: { lat: 40.7590, lng: -73.9880 }
      })

      console.log('✅ Emergency triggered')
    } catch (error) {
      console.error('❌ Emergency trigger failed:', error)
      // Don't throw - allow demo to continue even if emergency creation fails
    }
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
   * Run complete demo scenario with VISIBLE map movement
   */
  async runFullDemoScenario(patientId: string) {
    console.log('🎬 Starting FULL DEMO SCENARIO...')
    console.log('📺 Watch the map - the patient marker will MOVE in real-time!')
    console.log('⏱️  This demo takes about 30 seconds')

    // Start with patient at home
    console.log('\n1️⃣ Initial state: Setting patient position at home...')
    await apiClient.createLocation({
      patient_id: patientId,
      latitude: 40.7580,
      longitude: -73.9855,
      accuracy: 10,
    })
    await this.sleep(2000)

    // Battery warning
    console.log('\n2️⃣ Creating battery alert...')
    await this.simulateBatteryDrain(patientId)
    await this.sleep(2000)

    // Start wandering with visual movement
    console.log('\n3️⃣ Starting wandering simulation - WATCH THE MAP!')
    await this.simulateWanderingIncident(patientId)

    // No extra sleep needed - wandering already took ~15 seconds with movement

    // Emergency
    console.log('\n4️⃣ Escalating to emergency...')
    await this.triggerEmergency(patientId)
    await this.sleep(2000)

    console.log('\n🎉 FULL DEMO SCENARIO COMPLETE!')
    console.log('💡 The patient has moved on the map from safe zone to outside')
    console.log('🔧 Now demonstrate resolving the alerts in the UI')
  }

  /**
   * Return patient to home - visual movement back to safe zone
   */
  async returnHome(patientId: string) {
    console.log('🏠 Returning patient to home...')

    // Get current position (estimate - start from far position)
    let lat = 40.7610
    let lng = -73.9905

    // Home position
    const homeLat = 40.7580
    const homeLng = -73.9855

    try {
      // Animate return journey (10 steps)
      for (let i = 0; i < 10; i++) {
        lat -= (lat - homeLat) * 0.15
        lng -= (lng - homeLng) * 0.15

        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
        })

        console.log(`  🚶 Returning... (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
        await this.sleep(800)
      }

      // Final position - exactly at home
      await apiClient.createLocation({
        patient_id: patientId,
        latitude: homeLat,
        longitude: homeLng,
        accuracy: 5,
      })

      console.log('✅ Patient returned home safely!')
    } catch (error) {
      console.error('❌ Return home failed:', error)
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Reset demo state - resolve all alerts and emergencies
   */
  async resetDemo(patientId: string) {
    console.log('🔄 Resetting demo state...')

    try {
      // Get all alerts for patient
      const alerts = await apiClient.getAlerts(patientId)

      // Resolve all unresolved alerts
      for (const alert of alerts) {
        if (!alert.resolvedAt) {
          await apiClient.resolveAlert(alert.id)
        }
      }

      // Get all emergencies for patient
      const emergencies = await apiClient.getEmergencies(true)
      const patientEmergencies = emergencies.filter((e: any) => e.patient_id === patientId)

      // Resolve all active emergencies
      for (const emergency of patientEmergencies) {
        if (emergency.status === 'active') {
          await apiClient.resolveEmergency(emergency.id, 'resolved')
        }
      }

      console.log('✅ Demo state reset complete')
    } catch (error) {
      console.error('❌ Reset failed:', error)
    }
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
  reset: (patientId = 'P001') => demoSimulator.resetDemo(patientId),
  returnHome: (patientId = 'P001') => demoSimulator.returnHome(patientId),
}

// Make it available in browser console for easy demo control
if (typeof window !== 'undefined') {
  (window as any).demo = demo
  console.log('🎬 Demo controls loaded! Try: demo.full() for full demo with MAP MOVEMENT')
  console.log('💡 Tip: Use demo.reset() to clear alerts, demo.returnHome() to bring patient back')
}
