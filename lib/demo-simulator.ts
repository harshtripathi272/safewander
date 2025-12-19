// Demo Simulation - Realistic 1-Hour Scenario in 45 Seconds
// Implements ALGORITHM_SPEC.md with realistic movement patterns
// Simulates: Morning routine → Garden walk → Wandering incident → Emergency

import { apiClient } from './api-client'

// San Francisco coordinates (Eleanor's home in the Marina District)
const HOME = { lat: 37.7749, lng: -122.4194, name: "Home - Living Room" }

// Realistic locations around the home
const LOCATIONS = {
  // Safe Zone Locations (within 50m of home)
  kitchen: { lat: 37.7749, lng: -122.4193, name: "Kitchen" },
  bedroom: { lat: 37.7748, lng: -122.4194, name: "Bedroom" },
  backyard: { lat: 37.7747, lng: -122.4190, name: "Backyard Garden" },
  frontPorch: { lat: 37.7750, lng: -122.4194, name: "Front Porch" },

  // Buffer Zone Locations (50-100m from home)
  sidewalk: { lat: 37.7752, lng: -122.4192, name: "Sidewalk" },
  neighborYard: { lat: 37.7751, lng: -122.4189, name: "Neighbor's Yard" },
  mailbox: { lat: 37.7753, lng: -122.4194, name: "Community Mailbox" },

  // Outside Safe Zone (100-200m from home)
  parkEntrance: { lat: 37.7758, lng: -122.4185, name: "Oakwood Park Entrance" },
  parkBench: { lat: 37.7760, lng: -122.4180, name: "Park Bench" },
  playground: { lat: 37.7762, lng: -122.4178, name: "Playground Area" },

  // Danger Zone Approaches (near Main Road)
  crosswalk: { lat: 37.7765, lng: -122.4175, name: "Crosswalk" },
  busStop: { lat: 37.7768, lng: -122.4172, name: "Bus Stop" },
  mainRoad: { lat: 37.7770, lng: -122.4170, name: "Main Road - DANGER" },
}

// Time compression: 1 hour = 45 seconds (80x speed)
// Each "minute" in simulation = 0.75 seconds real time
const TIME_SCALE = 750 // milliseconds per simulated minute

export class DemoSimulator {
  private isRunning = false
  private currentTime = new Date()
  private eventLog: string[] = []

  private log(simTime: string, event: string) {
    const msg = `[${simTime}] ${event}`
    this.eventLog.push(msg)
    console.log(msg)
  }

  private formatTime(minutesFromStart: number): string {
    const hours = Math.floor(minutesFromStart / 60)
    const mins = minutesFromStart % 60
    return `${String(9 + hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }

  /**
   * MAIN DEMO: Realistic 1-Hour Morning Scenario
   * 
   * Timeline (simulated):
   * 09:00 - Wake up, in bedroom (SAFE)
   * 09:05 - Move to kitchen for breakfast (SAFE)
   * 09:15 - Go to backyard garden (SAFE)
   * 09:25 - Walk to front porch, see something interesting (SAFE)
   * 09:30 - Start walking toward mailbox (BUFFER → ADVISORY)
   * 09:35 - Continue past safe zone boundary (OUTSIDE → Risk increases)
   * 09:40 - 5 minutes outside, WARNING state triggered
   * 09:45 - Wandering toward park, confused (WARNING)
   * 09:50 - Approaching crosswalk near road (URGENT)
   * 09:55 - Near Main Road danger zone (URGENT → EMERGENCY)
   * 10:00 - Emergency protocols activated
   * 
   * Real time: ~45 seconds
   */
  async runFullDemoScenario(patientId: string) {
    if (this.isRunning) {
      console.log('⚠️ Demo already running')
      return
    }
    this.isRunning = true
    this.eventLog = []

    console.log('')
    console.log('╔══════════════════════════════════════════════════════════════╗')
    console.log('║          SAFEWANDER REALISTIC DEMO SIMULATION                ║')
    console.log('║          1-Hour Scenario Compressed to 45 Seconds            ║')
    console.log('╠══════════════════════════════════════════════════════════════╣')
    console.log('║  Patient: Eleanor Rigby, 78                                  ║')
    console.log('║  Condition: Alzheimer\'s Disease (Moderate)                   ║')
    console.log('║  Scenario: Morning routine leads to wandering incident       ║')
    console.log('╚══════════════════════════════════════════════════════════════╝')
    console.log('')

    try {
      // ════════════════════════════════════════════════════════════════
      // PHASE 1: Morning Routine (09:00 - 09:25) - SAFE STATE
      // ════════════════════════════════════════════════════════════════

      this.log('09:00', '🛏️  Eleanor wakes up in bedroom')
      this.log('09:00', '   Status: SAFE | Risk: 0 | Location: Bedroom')
      await this.movePatient(patientId, LOCATIONS.bedroom, 0)
      await this.sleep(TIME_SCALE * 5)

      this.log('09:05', '🍳 Moving to kitchen for breakfast')
      this.log('09:05', '   Status: SAFE | Risk: 0 | Activity: Normal morning routine')
      await this.smoothMove(patientId, LOCATIONS.bedroom, LOCATIONS.kitchen, 3)
      await this.sleep(TIME_SCALE * 10)

      this.log('09:15', '🌸 Going to backyard garden (favorite morning activity)')
      this.log('09:15', '   Status: SAFE | Risk: 0 | Mood: Content')
      await this.smoothMove(patientId, LOCATIONS.kitchen, LOCATIONS.backyard, 4)
      await this.sleep(TIME_SCALE * 10)

      this.log('09:25', '🚪 Walking to front porch, looking outside')
      this.log('09:25', '   Status: SAFE | Risk: 0 | Note: Showing interest in outside')
      await this.smoothMove(patientId, LOCATIONS.backyard, LOCATIONS.frontPorch, 3)
      await this.sleep(TIME_SCALE * 5)

      // ════════════════════════════════════════════════════════════════
      // PHASE 2: Leaving Safe Zone (09:30 - 09:40) - ADVISORY STATE
      // ════════════════════════════════════════════════════════════════

      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      this.log('09:30', '📬 Eleanor sees neighbor and walks toward mailbox')
      this.log('09:30', '   ⚠️  ENTERING BUFFER ZONE')
      this.log('09:30', '   Status: ADVISORY | Risk: 10 | Alert: Low priority generated')
      await this.smoothMove(patientId, LOCATIONS.frontPorch, LOCATIONS.mailbox, 4)
      await this.sleep(TIME_SCALE * 5)

      this.log('09:35', '🚶 Continuing past safe zone boundary')
      this.log('09:35', '   ⚠️  OUTSIDE SAFE ZONE')
      this.log('09:35', '   Status: ADVISORY | Risk: 40 | Factor: +30 (outside safe zone)')
      await this.smoothMove(patientId, LOCATIONS.mailbox, LOCATIONS.sidewalk, 3)
      await this.sleep(TIME_SCALE * 5)

      // ════════════════════════════════════════════════════════════════
      // PHASE 3: Wandering Detected (09:40 - 09:50) - WARNING STATE
      // ════════════════════════════════════════════════════════════════

      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      this.log('09:40', '⏱️  5 MINUTES OUTSIDE SAFE ZONE')
      this.log('09:40', '   🟡 STATE ESCALATION: ADVISORY → WARNING')
      this.log('09:40', '   Status: WARNING | Risk: 50 | Factors: +30 outside, +20 duration')
      this.log('09:40', '   📱 Medium priority alert sent to caregiver Jane')
      await this.movePatient(patientId, LOCATIONS.sidewalk, 0.6)
      await this.sleep(TIME_SCALE * 5)

      this.log('09:45', '🌳 Eleanor walking toward Oakwood Park')
      this.log('09:45', '   Pattern: Possible confusion - looking for "childhood park"')
      this.log('09:45', '   Status: WARNING | Risk: 55 | Wandering behavior detected')
      await this.smoothMove(patientId, LOCATIONS.sidewalk, LOCATIONS.parkEntrance, 5)
      await this.sleep(TIME_SCALE * 3)

      this.log('09:48', '🪑 Stops at park bench, appears disoriented')
      this.log('09:48', '   Behavior: Direction changes detected (confusion indicator)')
      this.log('09:48', '   Status: WARNING | Risk: 58 | Anomaly: +10 (behavior deviation)')
      await this.wanderPattern(patientId, LOCATIONS.parkBench, 4)
      await this.sleep(TIME_SCALE * 2)

      // ════════════════════════════════════════════════════════════════
      // PHASE 4: Approaching Danger (09:50 - 09:55) - URGENT STATE
      // ════════════════════════════════════════════════════════════════

      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      this.log('09:50', '🚨 Eleanor walking toward Main Road!')
      this.log('09:50', '   🔴 STATE ESCALATION: WARNING → URGENT')
      this.log('09:50', '   Status: URGENT | Risk: 75 | APPROACHING DANGER ZONE')
      this.log('09:50', '   📱 High priority alert! Calling caregiver immediately')
      await this.smoothMove(patientId, LOCATIONS.parkBench, LOCATIONS.crosswalk, 4)
      await this.sleep(TIME_SCALE * 3)

      this.log('09:53', '🚏 At bus stop near Main Road')
      this.log('09:53', '   Distance to danger zone: ~30 meters')
      this.log('09:53', '   Status: URGENT | Risk: 85 | Factor: +40 (near danger zone)')
      this.log('09:53', '   ⚠️  NO CAREGIVER RESPONSE - additional +25 risk')
      await this.smoothMove(patientId, LOCATIONS.crosswalk, LOCATIONS.busStop, 3)
      await this.sleep(TIME_SCALE * 2)

      // ════════════════════════════════════════════════════════════════
      // PHASE 5: Emergency (09:55 - 10:00) - EMERGENCY STATE
      // ════════════════════════════════════════════════════════════════

      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      this.log('09:55', '🆘 PATIENT AT MAIN ROAD - DANGER ZONE!')
      this.log('09:55', '   🔴 STATE ESCALATION: URGENT → EMERGENCY')
      this.log('09:55', '   Status: EMERGENCY | Risk: 100 (MAXIMUM)')
      this.log('09:55', '   Risk breakdown:')
      this.log('09:55', '     • Outside safe zone: +30')
      this.log('09:55', '     • In danger zone: +40')
      this.log('09:55', '     • Duration (>10 min): +20')
      this.log('09:55', '     • No caregiver response: +25')
      await this.smoothMove(patientId, LOCATIONS.busStop, LOCATIONS.mainRoad, 3)
      await this.sleep(TIME_SCALE * 2)

      this.log('09:57', '📡 EMERGENCY PROTOCOLS ACTIVATED')
      this.log('09:57', '   • Search radius calculated: 450m')
      this.log('09:57', '   • Emergency contacts notified')
      this.log('09:57', '   • Last known location broadcast')

      // Trigger emergency
      await this.triggerEmergency(patientId)
      await this.sleep(TIME_SCALE * 3)

      this.log('10:00', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      this.log('10:00', '🎬 DEMO SCENARIO COMPLETE')
      this.log('10:00', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      console.log('')
      console.log('╔══════════════════════════════════════════════════════════════╗')
      console.log('║                    SIMULATION SUMMARY                        ║')
      console.log('╠══════════════════════════════════════════════════════════════╣')
      console.log('║  Timeline: 09:00 → 10:00 (1 hour simulated)                 ║')
      console.log('║  Duration: ~45 seconds real time                            ║')
      console.log('║                                                              ║')
      console.log('║  State Transitions:                                          ║')
      console.log('║    SAFE → ADVISORY → WARNING → URGENT → EMERGENCY           ║')
      console.log('║                                                              ║')
      console.log('║  Risk Progression:                                           ║')
      console.log('║    0 → 10 → 40 → 50 → 75 → 85 → 100                         ║')
      console.log('║                                                              ║')
      console.log('║  Alerts Generated:                                           ║')
      console.log('║    • Low (09:30) - Entered buffer zone                       ║')
      console.log('║    • Medium (09:40) - 5 min outside, WARNING                 ║')
      console.log('║    • High (09:50) - Approaching danger, URGENT               ║')
      console.log('║    • Critical (09:55) - In danger zone, EMERGENCY            ║')
      console.log('║                                                              ║')
      console.log('╠══════════════════════════════════════════════════════════════╣')
      console.log('║  Next: Click "Return Home" to simulate safe recovery        ║')
      console.log('║        Click "Reset" to clear alerts and restart            ║')
      console.log('╚══════════════════════════════════════════════════════════════╝')

    } catch (error) {
      console.error('❌ Demo failed:', error)
      throw error
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Move patient with location data
   */
  private async movePatient(
    patientId: string,
    location: { lat: number; lng: number; name?: string },
    speed: number = 0
  ) {
    await apiClient.createLocation({
      patient_id: patientId,
      latitude: location.lat,
      longitude: location.lng,
      accuracy: 5 + Math.random() * 5,
      speed: speed
    })
  }

  /**
   * Smooth movement between two points
   */
  private async smoothMove(
    patientId: string,
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
    steps: number
  ) {
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps
      // Add slight randomness for realistic GPS
      const jitter = () => (Math.random() - 0.5) * 0.00005

      const lat = from.lat + (to.lat - from.lat) * progress + jitter()
      const lng = from.lng + (to.lng - from.lng) * progress + jitter()

      await apiClient.createLocation({
        patient_id: patientId,
        latitude: lat,
        longitude: lng,
        accuracy: 5 + Math.random() * 8,
        speed: 0.6 + Math.random() * 0.4 // 0.6-1.0 m/s walking
      })

      await this.sleep(150) // Brief pause between steps
    }
  }

  /**
   * Simulate wandering/confused movement pattern
   */
  private async wanderPattern(
    patientId: string,
    center: { lat: number; lng: number },
    iterations: number
  ) {
    for (let i = 0; i < iterations; i++) {
      // Random direction changes indicating confusion
      const angle = (i * 90 + Math.random() * 45) * Math.PI / 180
      const distance = 0.0001 + Math.random() * 0.0001

      const lat = center.lat + Math.cos(angle) * distance
      const lng = center.lng + Math.sin(angle) * distance

      await apiClient.createLocation({
        patient_id: patientId,
        latitude: lat,
        longitude: lng,
        accuracy: 8 + Math.random() * 10,
        speed: 0.3 + Math.random() * 0.4 // Slower, hesitant
      })

      await this.sleep(200)
    }
  }

  /**
   * Trigger emergency
   */
  public async triggerEmergency(patientId: string) {
    try {
      const emergencies = await apiClient.getEmergencies(true).catch(() => [])
      const hasActive = emergencies.some((e: any) => e.patient_id === patientId)

      if (!hasActive) {
        await apiClient.createEmergency({
          patient_id: patientId,
          last_known_location: LOCATIONS.mainRoad,
          trigger_type: 'fsm_escalation',
          notes: 'Patient entered danger zone (Main Road) - FSM reached EMERGENCY state'
        })
      }
    } catch (error) {
      console.log('Emergency trigger note:', error)
    }
  }

  /**
   * Simulate wandering only (shorter demo)
   */
  async simulateWanderingIncident(patientId: string) {
    console.log('🚶 QUICK WANDERING DEMO (15 seconds)')
    console.log('')

    await this.movePatient(patientId, HOME, 0)
    console.log('[Start] Patient at home - SAFE')
    await this.sleep(1000)

    await this.smoothMove(patientId, HOME, LOCATIONS.mailbox, 4)
    console.log('[+5s] Moving to mailbox - ADVISORY (buffer zone)')
    await this.sleep(2000)

    await this.smoothMove(patientId, LOCATIONS.mailbox, LOCATIONS.parkEntrance, 5)
    console.log('[+10s] At park entrance - WARNING (outside safe zone)')
    await this.sleep(2000)

    await this.wanderPattern(patientId, LOCATIONS.parkBench, 6)
    console.log('[+15s] Wandering pattern detected - Risk increasing')
    await this.sleep(2000)

    await this.smoothMove(patientId, LOCATIONS.parkBench, LOCATIONS.crosswalk, 4)
    console.log('[+20s] Approaching road - URGENT')

    console.log('')
    console.log('✅ Wandering demo complete')
  }

  /**
   * Return patient home safely
   */
  async returnHome(patientId: string) {
    console.log('')
    console.log('🏠 RETURNING PATIENT HOME')
    console.log('   Simulating caregiver finding patient and walking them back')
    console.log('')

    const dangerLoc = LOCATIONS.mainRoad

    // Step 1: Caregiver arrives
    this.log('10:05', '👋 Caregiver Jane arrives at Main Road')
    await this.sleep(1000)

    // Step 2: Walk back together
    this.log('10:08', '🚶 Walking back together (supported)')
    await this.smoothMove(patientId, dangerLoc, LOCATIONS.parkEntrance, 5)
    await this.sleep(500)

    this.log('10:12', '   Passing through park...')
    await this.smoothMove(patientId, LOCATIONS.parkEntrance, LOCATIONS.sidewalk, 4)
    await this.sleep(500)

    this.log('10:15', '   Entering safe zone...')
    await this.smoothMove(patientId, LOCATIONS.sidewalk, LOCATIONS.frontPorch, 4)
    await this.sleep(500)

    // Step 3: Home
    this.log('10:18', '🏠 Patient safely home')
    await this.smoothMove(patientId, LOCATIONS.frontPorch, HOME, 3)

    console.log('')
    console.log('✅ Patient returned safely')
    console.log('📊 FSM should de-escalate: EMERGENCY → URGENT → WARNING → ADVISORY → SAFE')
    console.log('🔔 Resolve alerts in UI to complete recovery')
  }

  /**
   * Battery alert
   */
  async simulateBatteryDrain(patientId: string) {
    console.log('🔋 Simulating low battery alert...')
    await apiClient.createAlert({
      patient_id: patientId,
      type: 'battery',
      severity: 'medium',
      title: 'Device Battery Low',
      description: 'SafeWander Pro Band battery at 15% - please charge soon',
    })
    console.log('✅ Battery alert created')
  }

  /**
   * Vitals alert
   */
  async simulateVitalsAlert(patientId: string) {
    console.log('💓 Simulating elevated heart rate...')
    await apiClient.createAlert({
      patient_id: patientId,
      type: 'vitals',
      severity: 'high',
      title: 'Elevated Heart Rate Detected',
      description: 'Heart rate: 102 bpm (normal range: 60-90 bpm). May indicate anxiety or physical exertion.',
    })
    console.log('✅ Vitals alert created')
  }

  /**
   * Reset demo
   */
  async resetDemo(patientId: string) {
    console.log('🔄 RESETTING DEMO')
    console.log('')

    try {
      // Reset patient FSM state to safe FIRST
      await apiClient.resetPatientStatus(patientId).catch((e) => {
        console.log('  ⚠️ Could not reset patient status via API, trying direct update')
      })
      console.log('  ✅ Patient FSM state reset to SAFE')

      // Resolve alerts
      const alerts = await apiClient.getAlerts(patientId).catch(() => [])
      for (const alert of alerts) {
        if (alert.status !== 'resolved') {
          await apiClient.resolveAlert(alert.id).catch(() => { })
        }
      }
      console.log('  ✅ Alerts resolved')

      // Resolve emergencies
      const emergencies = await apiClient.getEmergencies(true).catch(() => [])
      for (const e of emergencies) {
        if (e.patient_id === patientId) {
          await apiClient.resolveEmergency(e.id, 'patient_found').catch(() => { })
        }
      }
      console.log('  ✅ Emergencies resolved')

      // Reset to home
      await this.movePatient(patientId, HOME, 0)
      console.log('  ✅ Patient position reset to home')

      console.log('')
      console.log('🎉 Demo reset complete - ready for new simulation')
      console.log('   Patient status: SAFE')
      console.log('   Location: Home (37.7749, -122.4194)')
    } catch (error) {
      console.error('Reset error:', error)
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton
export const demoSimulator = new DemoSimulator()

// Console helpers
export const demo = {
  /** Run full 1-hour scenario in 45 seconds */
  full: (id = '1') => demoSimulator.runFullDemoScenario(id),
  /** Quick wandering demo (15 seconds) */
  wandering: (id = '1') => demoSimulator.simulateWanderingIncident(id),
  /** Return patient home safely */
  returnHome: (id = '1') => demoSimulator.returnHome(id),
  /** Reset all alerts and position */
  reset: (id = '1') => demoSimulator.resetDemo(id),
  /** Trigger battery alert */
  battery: (id = '1') => demoSimulator.simulateBatteryDrain(id),
  /** Trigger vitals alert */
  vitals: (id = '1') => demoSimulator.simulateVitalsAlert(id),
}

// Browser console access
if (typeof window !== 'undefined') {
  (window as any).demo = demo
  console.log('')
  console.log('🎬 SafeWander Demo Simulator Ready')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Commands:')
  console.log('  demo.full()      → Full 1-hour scenario (45 sec)')
  console.log('  demo.wandering() → Quick wandering demo (15 sec)')
  console.log('  demo.returnHome() → Bring patient back safely')
  console.log('  demo.reset()     → Clear alerts, reset position')
  console.log('  demo.battery()   → Create battery alert')
  console.log('  demo.vitals()    → Create vitals alert')
  console.log('')
}
