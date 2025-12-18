// Demo Simulation - Implements ALGORITHM_SPEC.md Example Flow
// FSM: SAFE → ADVISORY → WARNING → URGENT → EMERGENCY
// Risk Scoring with exact weights from spec

import { apiClient } from './api-client'

// San Francisco coordinates (matching demoZones in data.ts)
const HOME_LAT = 37.7749
const HOME_LNG = -122.4194

// Zone positions from data.ts
const DANGER_ZONE_LAT = 37.777
const DANGER_ZONE_LNG = -122.417

// Movement step (~10m per step)
const STEP_SIZE = 0.0001

export class DemoSimulator {
  private isRunning = false

  /**
   * ALGORITHM_SPEC.md Example Flow:
   * 
   * | Time  | Event              | Risk | State     | Alert    |
   * |-------|--------------------| -----|-----------|----------|
   * | 0:00  | At home            | 0    | SAFE      | -        |
   * | 0:05  | Enter buffer       | 10   | ADVISORY  | Low      |
   * | 0:10  | Exit safe zone     | 40   | ADVISORY  | -        |
   * | 5:10  | Still outside      | 50   | WARNING   | Medium   |
   * | 10:10 | Near danger zone   | 90   | URGENT    | High     |
   * | 20:10 | Still missing      | 100  | EMERGENCY | Critical |
   */
  async runFullDemoScenario(patientId: string) {
    console.log('🎬 ══════════════════════════════════════════')
    console.log('   SAFEWANDER ALGORITHM DEMO')
    console.log('   Following ALGORITHM_SPEC.md Example Flow')
    console.log('══════════════════════════════════════════════')
    console.log('')

    let lat = HOME_LAT
    let lng = HOME_LNG

    try {
      // ═══════════════════════════════════════════════════════════
      // TIME 0:00 - At home (SAFE, Risk = 0)
      // ═══════════════════════════════════════════════════════════
      console.log('⏱️  0:00 | 🏠 AT HOME')
      console.log('         Risk: 0 | State: SAFE | Alert: None')
      console.log('         Patient inside safe zone, all normal')
      
      await apiClient.createLocation({
        patient_id: patientId,
        latitude: HOME_LAT,
        longitude: HOME_LNG,
        accuracy: 5,
        speed: 0
      })
      await this.sleep(3000)

      // ═══════════════════════════════════════════════════════════
      // TIME 0:05 - Enter buffer zone (ADVISORY, Risk = 10)
      // ═══════════════════════════════════════════════════════════
      console.log('')
      console.log('⏱️  0:05 | 🔵 ENTER BUFFER ZONE')
      console.log('         Risk: 10 (+10 buffer) | State: ADVISORY | Alert: Low')
      console.log('         Patient approaching safe zone boundary')
      
      // Move toward edge of safe zone (5 steps)
      for (let i = 0; i < 5; i++) {
        lat += STEP_SIZE * 0.3
        lng += STEP_SIZE * 0.2
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 8,
          speed: 0.7
        })
        console.log(`         📍 Moving... (${lat.toFixed(5)}, ${lng.toFixed(5)})`)
        await this.sleep(800)
      }
      await this.sleep(2000)

      // ═══════════════════════════════════════════════════════════
      // TIME 0:10 - Exit safe zone (Risk = 40)
      // ═══════════════════════════════════════════════════════════
      console.log('')
      console.log('⏱️  0:10 | ⚠️  EXIT SAFE ZONE')
      console.log('         Risk: 40 (+30 outside safe) | State: ADVISORY | Alert: -')
      console.log('         Patient has left the safe zone perimeter')
      
      // Continue moving outside (8 steps)
      for (let i = 0; i < 8; i++) {
        lat += STEP_SIZE * 0.5
        lng += STEP_SIZE * 0.3
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          speed: 0.8
        })
        console.log(`         📍 Moving away... (${lat.toFixed(5)}, ${lng.toFixed(5)})`)
        await this.sleep(600)
      }
      await this.sleep(2000)

      // ═══════════════════════════════════════════════════════════
      // TIME 5:10 - Still outside 5 min (WARNING, Risk = 50)
      // ═══════════════════════════════════════════════════════════
      console.log('')
      console.log('⏱️  5:10 | 🟡 STILL OUTSIDE (5 min)')
      console.log('         Risk: 50 (+30 outside, +20 duration) | State: WARNING | Alert: Medium')
      console.log('         Wandering behavior detected, escalating...')
      
      // Simulate erratic movement (wandering pattern)
      for (let i = 0; i < 6; i++) {
        // Add some random direction changes to simulate confusion
        const angle = (i * 60) * Math.PI / 180
        lat += STEP_SIZE * 0.4 * Math.cos(angle)
        lng += STEP_SIZE * 0.4 * Math.sin(angle)
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 12,
          speed: 0.6 + Math.random() * 0.3
        })
        console.log(`         📍 Wandering... (${lat.toFixed(5)}, ${lng.toFixed(5)})`)
        await this.sleep(700)
      }
      await this.sleep(2000)

      // ═══════════════════════════════════════════════════════════
      // TIME 10:10 - Near danger zone (URGENT, Risk = 90)
      // ═══════════════════════════════════════════════════════════
      console.log('')
      console.log('⏱️ 10:10 | 🔴 APPROACHING DANGER ZONE')
      console.log('         Risk: 90 (+30 outside, +40 danger, +20 duration) | State: URGENT | Alert: High')
      console.log('         Patient heading toward Main Road (danger zone)!')
      
      // Move toward danger zone
      for (let i = 0; i < 10; i++) {
        lat += (DANGER_ZONE_LAT - lat) * 0.12
        lng += (DANGER_ZONE_LNG - lng) * 0.12
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 15,
          speed: 1.0  // Faster movement
        })
        console.log(`         🚨 Approaching danger... (${lat.toFixed(5)}, ${lng.toFixed(5)})`)
        await this.sleep(500)
      }
      await this.sleep(2000)

      // ═══════════════════════════════════════════════════════════
      // TIME 20:10 - Still missing 10+ min (EMERGENCY, Risk = 100)
      // ═══════════════════════════════════════════════════════════
      console.log('')
      console.log('⏱️ 20:10 | 🆘 EMERGENCY - PATIENT MISSING')
      console.log('         Risk: 100 (CAPPED) | State: EMERGENCY | Alert: Critical')
      console.log('         Search protocol activated!')
      
      // Patient at danger zone, slowing down (confusion)
      for (let i = 0; i < 5; i++) {
        lat += STEP_SIZE * 0.1 * (Math.random() - 0.5)
        lng += STEP_SIZE * 0.1 * (Math.random() - 0.5)
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 20,
          speed: 0.3  // Slowing down
        })
        console.log(`         🆘 Patient confused... (${lat.toFixed(5)}, ${lng.toFixed(5)})`)
        await this.sleep(800)
      }

      // Trigger emergency
      console.log('')
      console.log('📡 TRIGGERING EMERGENCY PROTOCOL...')
      await this.triggerEmergency(patientId)

      console.log('')
      console.log('═══════════════════════════════════════════════')
      console.log('🎬 DEMO COMPLETE!')
      console.log('═══════════════════════════════════════════════')
      console.log('')
      console.log('📊 FSM Progression: SAFE → ADVISORY → WARNING → URGENT → EMERGENCY')
      console.log('📋 Risk Factors Used:')
      console.log('   • Outside safe zone: +30')
      console.log('   • Near danger zone: +40') 
      console.log('   • Duration outside >10min: +20')
      console.log('   • Buffer zone: +10')
      console.log('')
      console.log('💡 Next Steps:')
      console.log('   • Check Alerts page for escalation history')
      console.log('   • Check Map for patient position')
      console.log('   • Click "Return Home" to bring patient back')
      console.log('   • Click "Reset" to clear all alerts')

    } catch (error) {
      console.error('❌ Demo failed:', error)
      throw error
    }
  }

  /**
   * Simulate wandering incident (shorter demo)
   */
  async simulateWanderingIncident(patientId: string) {
    console.log('🚶 WANDERING SIMULATION')
    console.log('Patient will exit safe zone and wander...')
    console.log('')

    let lat = HOME_LAT
    let lng = HOME_LNG

    try {
      // Start at home
      await apiClient.createLocation({
        patient_id: patientId,
        latitude: lat,
        longitude: lng,
        accuracy: 5,
        speed: 0
      })
      await this.sleep(1000)

      // Move outside safe zone (15 steps)
      for (let i = 0; i < 15; i++) {
        lat += STEP_SIZE * 0.6
        lng -= STEP_SIZE * 0.4
        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 8 + i * 0.3,
          speed: 0.7 + Math.random() * 0.2
        })
        
        if (i === 4) console.log('  📍 Entering buffer zone...')
        if (i === 8) console.log('  ⚠️  Left safe zone!')
        if (i === 12) console.log('  🚨 Wandering detected!')
        
        await this.sleep(600)
      }

      console.log('')
      console.log('✅ Wandering simulation complete')
      console.log('📊 Check alerts for FSM state changes')
    } catch (error) {
      console.error('❌ Wandering simulation failed:', error)
      throw error
    }
  }

  /**
   * Battery drain alert
   */
  async simulateBatteryDrain(patientId: string) {
    console.log('🔋 Creating battery low alert...')
    try {
      await apiClient.createAlert({
        patient_id: patientId,
        type: 'battery',
        severity: 'medium',
        title: 'Device Battery Low',
        description: 'Tracker battery at 15% - charge recommended',
      })
      console.log('✅ Battery alert created')
    } catch (error) {
      console.error('❌ Failed:', error)
      throw error
    }
  }

  /**
   * Vitals alert
   */
  async simulateVitalsAlert(patientId: string) {
    console.log('💓 Creating elevated heart rate alert...')
    try {
      await apiClient.createAlert({
        patient_id: patientId,
        type: 'vitals',
        severity: 'high',
        title: 'Elevated Heart Rate',
        description: 'Heart rate: 105 bpm (threshold: 90 bpm)',
      })
      console.log('✅ Vitals alert created')
    } catch (error) {
      console.error('❌ Failed:', error)
      throw error
    }
  }

  /**
   * Trigger emergency with search radius
   */
  async triggerEmergency(patientId: string) {
    try {
      const emergencies = await apiClient.getEmergencies(true).catch(() => [])
      const hasActive = emergencies.some((e: any) => e.patient_id === patientId)

      if (hasActive) {
        console.log('⚠️  Emergency already active')
        return
      }

      await apiClient.createEmergency({
        patient_id: patientId,
        last_known_location: { lat: DANGER_ZONE_LAT, lng: DANGER_ZONE_LNG },
        trigger_type: 'fsm_escalation',
        notes: 'FSM reached EMERGENCY state - patient near danger zone'
      })
      
      console.log('✅ Emergency activated')
      console.log('🔍 Search radius calculated by backend')
    } catch (error) {
      console.error('❌ Emergency failed:', error)
      throw error
    }
  }

  /**
   * Return patient home with visible movement
   */
  async returnHome(patientId: string) {
    console.log('🏠 RETURNING PATIENT HOME')
    console.log('Risk will decrease as patient enters safe zone...')
    console.log('')

    let lat = DANGER_ZONE_LAT
    let lng = DANGER_ZONE_LNG

    try {
      for (let i = 0; i < 20; i++) {
        lat += (HOME_LAT - lat) * 0.12
        lng += (HOME_LNG - lng) * 0.12

        await apiClient.createLocation({
          patient_id: patientId,
          latitude: lat,
          longitude: lng,
          accuracy: 8,
          speed: 0.8
        })

        if (i === 5) console.log('  📍 Moving away from danger...')
        if (i === 10) console.log('  📍 Approaching safe zone...')
        if (i === 15) console.log('  📍 Entering safe zone!')
        
        await this.sleep(500)
      }

      // Final position at home
      await apiClient.createLocation({
        patient_id: patientId,
        latitude: HOME_LAT,
        longitude: HOME_LNG,
        accuracy: 5,
        speed: 0
      })

      console.log('')
      console.log('✅ Patient safely home')
      console.log('📊 FSM should de-escalate: EMERGENCY → URGENT → WARNING → ADVISORY → SAFE')
    } catch (error) {
      console.error('❌ Return home failed:', error)
      throw error
    }
  }

  /**
   * Reset demo - resolve alerts and return home
   */
  async resetDemo(patientId: string) {
    console.log('🔄 RESETTING DEMO STATE')
    console.log('')

    try {
      // Resolve alerts
      const alerts = await apiClient.getAlerts(patientId).catch(() => [])
      let count = 0
      for (const alert of alerts) {
        if (alert.status !== 'resolved') {
          await apiClient.resolveAlert(alert.id).catch(() => {})
          count++
        }
      }
      console.log(`  ✅ Resolved ${count} alerts`)

      // Resolve emergencies
      const emergencies = await apiClient.getEmergencies(true).catch(() => [])
      for (const e of emergencies) {
        if (e.patient_id === patientId && e.status === 'active') {
          await apiClient.resolveEmergency(e.id, 'false_alarm').catch(() => {})
        }
      }
      console.log('  ✅ Resolved emergencies')

      // Reset position
      await apiClient.createLocation({
        patient_id: patientId,
        latitude: HOME_LAT,
        longitude: HOME_LNG,
        accuracy: 5,
        speed: 0
      })
      console.log('  ✅ Position reset to home')

      console.log('')
      console.log('🎉 Demo reset complete - patient in SAFE state')
    } catch (error) {
      console.error('❌ Reset failed:', error)
      throw error
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton
export const demoSimulator = new DemoSimulator()

// Console helper
export const demo = {
  full: (id = '1') => demoSimulator.runFullDemoScenario(id),
  wandering: (id = '1') => demoSimulator.simulateWanderingIncident(id),
  battery: (id = '1') => demoSimulator.simulateBatteryDrain(id),
  vitals: (id = '1') => demoSimulator.simulateVitalsAlert(id),
  emergency: (id = '1') => demoSimulator.triggerEmergency(id),
  returnHome: (id = '1') => demoSimulator.returnHome(id),
  reset: (id = '1') => demoSimulator.resetDemo(id),
}

// Browser console access
if (typeof window !== 'undefined') {
  (window as any).demo = demo
  console.log('🎬 SafeWander Demo loaded!')
  console.log('📋 Commands: demo.full() | demo.wandering() | demo.reset() | demo.returnHome()')
}
