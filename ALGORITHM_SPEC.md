# SafeWander Algorithm Specification

## System Overview
**Continuous monitoring → Risk scoring → FSM state transitions → Automated alerts**

Every location update triggers: Risk calculation → Anomaly check → State evaluation → Alert generation

---

## 8 Core Modules

| Module | Purpose | Key Output |
|--------|---------|------------|
| `config.py` | Configurable weights & thresholds | All tunable parameters |
| `geo_utils.py` | Geospatial calculations | Distance, zone detection, GPS smoothing |
| `risk_engine.py` | Multi-factor risk scoring | 0-100 risk score |
| `state_machine.py` | Alert escalation logic | FSM state transitions |
| `baseline.py` | Normal behavior tracking | Rolling averages (speed, duration) |
| `anomaly.py` | Deviation detection | Anomaly flags (statistical) |
| `emergency.py` | Emergency triggers & protocols | Emergency mode, search radius |
| `monitoring_loop.py` | Background processing | Runs every 5 seconds |

---

## Risk Scoring Engine

**Formula**: `Risk = Σ(Active_Factors × Weights)` capped at 100

### Risk Factors & Weights

| Factor | Weight | Condition |
|--------|--------|-----------|
| Outside safe zone | +30 | Not in any safe zone |
| Near danger zone | +40 | <50m from danger |
| In buffer zone | +10 | Inside buffer area |
| In restricted zone | +25 | Inside restricted area |
| Night hours | +15 | 8pm-6am |
| Duration outside | +20 | >10 minutes |
| No caregiver response | +25 | >10 min no ack |
| Weak GPS | +10 | Signal quality low |
| Anomaly detected | +10 | Behavior deviation |

**Modifiers**:
- Usual walk time: ×0.7 (reduce risk)
- Night exit: ×1.3 (increase risk)

---

## Finite State Machine (FSM)

### 5 States
1. **SAFE** → Normal, in safe zone
2. **ADVISORY** → Minor risk, monitoring
3. **WARNING** → Wandering detected
4. **URGENT** → High risk, immediate action
5. **EMERGENCY** → Critical, search activated

### Transition Thresholds

| Transition | Condition | Hold Time |
|------------|-----------|-----------|
| SAFE → ADVISORY | Risk ≥ 20 | Immediate |
| ADVISORY → WARNING | Risk ≥ 40 | 5 minutes |
| WARNING → URGENT | Risk ≥ 60 OR near danger | Immediate if danger |
| URGENT → EMERGENCY | Risk ≥ 80 | 10 minutes |

**De-escalation**: Manual by caregiver OR automatic if risk drops significantly

---

## Zone System (4 Types)

| Type | Color | Radius | Risk | Auto-Gen | User Control |
|------|-------|--------|------|----------|--------------|
| **Safe** | 🟢 Green | 100m | +0 | No | Full |
| **Buffer** | 🔵 Blue | 150m | +10 | Yes | None |
| **Danger** | 🔴 Red | 50m | +40 | No | Full |
| **Restricted** | 🟠 Orange | 75m | +25 | No | Full |

**Buffer Zone**: Auto-created at safe_radius + 50m for early detection

**Priority**: Danger > Restricted > Buffer > Safe

---

## Behavioral Baseline

**Tracked Metrics** (7-14 day rolling average):
- Average walking speed: ~0.8 m/s
- Average trip duration: ~15 minutes (900s)
- Common walking hours: `[7, 8, 9, 17, 18, 19]`

**Update**: Exponential moving average (α=0.1), excludes emergency events

**Storage**: `baselines` table, per-patient

---

## Anomaly Detection

### Methods (Statistical, No ML)

| Type | Threshold | Indicates |
|------|-----------|-----------|
| Duration anomaly | >avg + 2×std | Unusually long trip |
| Speed anomaly | abs(current - avg) > 0.5 m/s | Agitation or confusion |
| Direction changes | >5 significant turns | Disorientation |
| Circling pattern | 2+ returns to start | Classic confusion sign |

**Output**: Boolean flag + wandering score (0-100)

---

## Emergency Protocols

### Triggers (Any one activates emergency)
- FSM reaches EMERGENCY state
- Panic button pressed
- GPS loss near danger zone
- No location >30 minutes

### Search Radius Formula
```
Radius = avg_speed × time_missing × mobility_factor × terrain_factor
Range: 100m - 5000m
```

**Mobility Factors**: High (1.2×), Medium (1.0×), Low (0.5×), Wheelchair (0.3×)

---

## System Loop

**Cycle**: Every 5 seconds

**Per Location Update**:
1. Calculate zone status
2. Compute risk score
3. Check anomalies
4. Evaluate FSM transition
5. Create alerts if state changed
6. Update patient record (risk, state, timestamps)
7. WebSocket broadcast

---

## Key Configuration

### GPS Noise Handling
- Consecutive samples required: **3**
- Moving average window: **5 samples**

### Time Thresholds
- Time outside threshold: **10 minutes**
- No response threshold: **10 minutes**
- Advisory hold time: **5 minutes**
- Urgent hold time: **10 minutes**

### Night Hours
- Start: **8pm (20:00)**
- End: **6am (06:00)**

---

## Design Principles

✅ **No ML** - Simple statistical rules only  
✅ **Inspectable** - Every decision traceable  
✅ **Configurable** - All weights adjustable  
✅ **Real-time** - 5-second processing cycle  
✅ **Manual Override** - Caregiver always in control  

---

## Example Flow

**Patient exits safe zone:**

| Time | Event | Risk | State | Alert |
|------|-------|------|-------|-------|
| 0:00 | At home | 0 | SAFE | - |
| 0:05 | Enter buffer | 10 | ADVISORY | Low |
| 0:10 | Exit safe zone | 40 | ADVISORY | - |
| 5:10 | Still outside (5 min) | 50 | WARNING | Medium |
| 10:10 | Near danger zone | 90 | URGENT | High |
| 20:10 | Still missing (10 min) | 100 | EMERGENCY | Critical |

---

## Data Architecture

```
GPS → Location API → Risk Engine → FSM → Alerts → UI
         ↓              ↓          ↓       ↓
      Database      Geo Utils  Baseline WebSocket
                       ↓          ↓
                   Zone Sys   Anomaly
```

**Storage**: SQLite database  
**Real-time**: WebSocket updates  
**Cycle**: 5-second background loop
