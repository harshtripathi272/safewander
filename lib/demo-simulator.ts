// Demo Simulation Helper - FSM-Integrated Version
// Relies on backend FSM for automatic alert escalation based on risk scoring.
// Location updates now trigger backend risk calculation automatically.

import { apiClient } from './api-client'

// Default positions
const HOME_LAT = 40.7580
const HOME_LNG = -73.9855
const DANGER_ZONE_LAT = 40.7620  // Danger zone to the north
const DANGER_ZONE_LNG = -73.9900

// Realistic walking speed: ~0.8-1.2 m/s = ~0.00001 degrees per second
const STEP_SIZE_LAT = 0.0003  // ~30m per step
const STEP_SIZE_LNG = 0.0004

export class DemoSimulator {
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  /**
   * Simulate a patient wandering scenario with VISIBLE map movement.
   * The backend FSM will automatically escalate alerts based on risk scoring.
   * No manual alert creation needed - purely location-based demonstration.
   */
  async simulateWanderingIncident(patientId: string, onLocationUpdate?: (lat: number, lng: number) => void) {
    console.log('🎬 Starting FSM-integrated wandering simulation...')
    console.log('📍 Backend will automatically calculate risk and escalate alerts')

    let lat = HOME_LAT
    let lng = HOME_LNG

    try {
      // Step 1: Patient at home (safe zone) - establish baseline
      console.log('  🏠 Step 1: Patient at home, establishing safe position...')
      await apiClient.createLocation({
        patient_id: patientId,
        latitude: lat,
        longitude: lng,
        accuracy: 10,
        speed: 0
      })
      await this.sleep(1500)

      // Step 2: Patient starts moving toward boundary (5 steps)
      console.log('  📍 Step 2: Patient approaching safe zone boundary...')
      for (let i = 0; i < 5; i++) {
        await this.sleep(1000)
        lat += STEP_SIZE_LAT
        lng -= STEP_SIZE_LNG
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          speed: 0.8  // Walking speed
        })
        onLocationUpdate?.(lat, lng)
        console.log(`    Moving... (${lat.toFixed(4)}, ${lng.toFixed(4)}) - Backend calculating risk...`)
      }

      // Step 3: Patient exits safe zone, enters buffer zone
      console.log('  ⚠️ Step 3: Patient exited safe zone, entering buffer...')
      for (let i = 0; i < 5; i++) {
        await this.sleep(1000)
        lat += STEP_SIZE_LAT
        lng -= STEP_SIZE_LNG
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          speed: 0.9
        })
        onLocationUpdate?.(lat, lng)
        console.log(`    Moving further... (${lat.toFixed(4)}, ${lng.toFixed(4)}) - FSM should escalate...`)
      }

      // Step 4: Patient moving toward danger zone
      console.log('  🚨 Step 4: Patient approaching danger zone...')
      for (let i = 0; i < 5; i++) {
        await this.sleep(800)
        lat += STEP_SIZE_LAT * 1.2
        lng -= STEP_SIZE_LNG * 1.2
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          speed: 1.1  // Faster movement (possibly agitated)
        })
        onLocationUpdate?.(lat, lng)
        console.log(`    Moving rapidly... (${lat.toFixed(4)}, ${lng.toFixed(4)}) - High risk expected`)
      }

      console.log('✅ Wandering simulation complete!')
      console.log('💡 Check alerts page to see FSM-generated escalation')
    } catch (error) {
      console.error('❌ Wandering simulation failed:', error)
      throw error
    }
  }

  /**
   * Create a danger zone for demo purposes
   */
  async createDangerZone(patientId: string) {
    console.log('🔴 Creating danger zone...')
    try {
      await apiClient.createZone({
        patient_id: patientId,
        name: 'Busy Road',
        type: 'danger',
        coordinates: [{ lat: DANGER_ZONE_LAT, lng: DANGER_ZONE_LNG }],
        radius: 50
      })
      console.log('✅ Danger zone created at road crossing')
    } catch (error) {
      console.log('⚠️ Danger zone may already exist:', error)
    }
  }

  /**
   * Create safe zone around home
   */
  async createSafeZone(patientId: string) {
    console.log('🟢 Creating safe zone around home...')
    try {
      await apiClient.createZone({
        patient_id: patientId,
        name: 'Home',
        type: 'safe',
        coordinates: [{ lat: HOME_LAT, lng: HOME_LNG }],
        radius: 100
      })
      console.log('✅ Safe zone created (buffer zone auto-generated)')
    } catch (error) {
      console.log('⚠️ Safe zone may already exist:', error)
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
        description: 'Heart rate: 105 bpm (above threshold)',
      })
      console.log('✅ Vitals alert created')
    } catch (error) {
      console.error('❌ Vitals simulation failed:', error)
      throw error
    }
  }

  /**
   * Trigger emergency (will use backend search radius estimation)
   */
  async triggerEmergency(patientId: string) {
    console.log('🚨 Triggering emergency with auto-calculated search radius...')
    try {
      const existingEmergencies = await apiClient.getEmergencies(true)
      const hasActiveEmergency = existingEmergencies.some(
        (e: any) => e.patient_id === patientId && e.status === 'active'
      )

      if (hasActiveEmergency) {
        console.log('⚠️ Emergency already active')
      } else {
        // Don't specify search_radius - let backend calculate it
        await apiClient.createEmergency({
          patient_id: patientId,
          last_known_location: { lat: 40.7610, lng: -73.9895 },
          search_radius: 0  // Backend will estimate based on baseline
        })
        console.log('✅ Emergency triggered with auto-estimated search radius')
      }
    } catch (error) {
      console.error('❌ Emergency trigger failed:', error)
    }
  }

  /**
   * Run complete demo scenario with FSM escalation
   */
  async runFullDemoScenario(patientId: string) {
    console.log('🎬 Starting FULL FSM DEMO SCENARIO...')
    console.log('📺 Watch the map and alerts - FSM will auto-escalate!')
    console.log('⏱️ This demo takes about 30 seconds')

    // Setup zones first
    console.log('\n1️⃣ Setting up zones...')
    await this.createSafeZone(patientId)
    await this.createDangerZone(patientId)
    await this.sleep(1000)

    // Set initial position
    console.log('\n2️⃣ Placing patient at home...')
    await apiClient.createLocation({
      patient_id: patientId,
      latitude: HOME_LAT,
      longitude: HOME_LNG,
      accuracy: 10,
      speed: 0
    })
    await this.sleep(2000)

    // Battery warning
    console.log('\n3️⃣ Creating battery alert...')
    await this.simulateBatteryDrain(patientId)
    await this.sleep(1500)

    // Wandering with FSM escalation
    console.log('\n4️⃣ Starting wandering simulation - WATCH FSM ESCALATE!')
    await this.simulateWanderingIncident(patientId)

    // Emergency
    console.log('\n5️⃣ Escalating to emergency...')
    await this.triggerEmergency(patientId)
    await this.sleep(2000)

    console.log('\n🎉 FULL DEMO SCENARIO COMPLETE!')
    console.log('💡 The FSM should have escalated: safe → advisory → warning → urgent')
    console.log('🔧 Resolve alerts in UI to reset patient state')
  }

  /**
   * Return patient to home - visual movement back to safe zone
   */
  async returnHome(patientId: string) {
    console.log('🏠 Returning patient to home...')

    let lat = 40.7630
    let lng = -73.9930

    try {
      for (let i = 0; i < 10; i++) {
        lat -= (lat - HOME_LAT) * 0.15
        lng -= (lng - HOME_LNG) * 0.15

        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          speed: 0.8
        })

        console.log(`  🚶 Returning... (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
        await this.sleep(800)
      }

      // Final position at home
      await apiClient.createLocation({
        patient_id: patientId,
        latitude: HOME_LAT,
        longitude: HOME_LNG,
        accuracy: 5,
        speed: 0
      })

      console.log('✅ Patient returned home - FSM should de-escalate to SAFE')
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
      // Resolve alerts
      const alerts = await apiClient.getAlerts(patientId)
      for (const alert of alerts) {
        if (!alert.resolvedAt) {
          await apiClient.resolveAlert(alert.id)
        }
      }

      // Resolve emergencies
      const emergencies = await apiClient.getEmergencies(true)
      const patientEmergencies = emergencies.filter((e: any) => e.patient_id === patientId)
      for (const emergency of patientEmergencies) {
        if (emergency.status === 'active') {
          await apiClient.resolveEmergency(emergency.id, 'resolved')
        }
      }

      // Reset patient position to home
      await apiClient.createLocation({
        patient_id: patientId,
        latitude: HOME_LAT,
        longitude: HOME_LNG,
        accuracy: 5,
        speed: 0
      })

      console.log('✅ Demo state reset - patient back to SAFE state')
    } catch (error) {
      console.error('❌ Reset failed:', error)
    }
  }

  /**
   * Start continuous location updates
   */
  startLocationSimulation(patientId: string, onUpdate?: (location: any) => void) {
    if (this.isRunning) return

    this.isRunning = true
    let lat = HOME_LAT
    let lng = HOME_LNG

    this.intervalId = setInterval(async () => {
      lat += (Math.random() - 0.5) * 0.0001
      lng += (Math.random() - 0.5) * 0.0001

      const location = { lat, lng, timestamp: new Date().toISOString() }

      try {
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          speed: 0.2
        })
        if (onUpdate) onUpdate(location)
      } catch (error) {
        console.error('Location update failed:', error)
      }
    }, 3000)

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
  createZones: (patientId = 'P001') => {
    demoSimulator.createSafeZone(patientId)
    demoSimulator.createDangerZone(patientId)
  }
}

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).demo = demo
  console.log('🎬 FSM Demo controls loaded!')
  console.log('💡 Try: demo.full() - FSM will auto-escalate alerts based on location')
  console.log('💡 Try: demo.createZones() - Setup safe and danger zones first')
}
