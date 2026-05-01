# M3 Hub — Roadmap

**Milestone:** Mobile Optimization  
**Goal:** Full mobile playability — joystick, responsive UI, performance on mid-range devices  
**Phases:** 5 | **Requirements:** 16 v1 | Coverage: 100% ✓

---

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Device Foundation | Detect device type, expose to all components | DEV-01, DEV-02, DEV-03 | Hook returns correct type; components receive isMobile |
| 2 | Virtual Joystick | Canvas joystick renders and emits direction vectors | JOY-01, JOY-02, JOY-03, JOY-04, JOY-05 | Joystick visible+functional on mobile, hidden on desktop |
| 3 | Mobile Controls Integration | Player moves via joystick on mobile, WASD on desktop | MOV-01, MOV-02, MOV-03 | Avatar moves responsively from touch input in live world |
| 4 | Responsive UI | All UI legible and touch-friendly on 375px+ screens | UI-01, UI-02, UI-03, UI-04, UI-05, UI-06 | No layout breaks; all targets ≥44px; no input zoom |
| 5 | Mobile Performance | Smooth framerate on mid-range mobile | PERF-01, PERF-02, PERF-03 | Stable fps during hub exploration on mobile |

---

## Phase Details

### Phase 1: Device Foundation

**Goal:** Create a single source of truth for device type that all components can consume without prop drilling or inline `window.innerWidth` checks.

**Requirements:** DEV-01, DEV-02, DEV-03

**Files to create/modify:**
- `client/src/hooks/useDeviceDetection.js` — **CREATE**
- `client/src/App.jsx` — pass `isMobile` down or expose via context

**Success criteria:**
1. `useDeviceDetection()` returns `{ isMobile, isTablet, isDesktop }` with correct values on first render
2. Hook updates values when device orientation changes (portrait ↔ landscape)
3. At least one consumer component (e.g. Hub3D.jsx) correctly receives and uses `isMobile`

**UI hint**: no

---

### Phase 2: Virtual Joystick

**Goal:** Deliver a canvas-based virtual joystick component that handles multi-touch and outputs a normalized direction vector.

**Requirements:** JOY-01, JOY-02, JOY-03, JOY-04, JOY-05

**Files to create/modify:**
- `client/src/components/VirtualJoystick.jsx` — **CREATE**
- `client/src/hooks/useTouchInput.js` — **CREATE** (touch event helper)

**Success criteria:**
1. Joystick renders in bottom-left corner on mobile screens
2. Dragging thumb within outer ring moves inner knob visually
3. Touch release returns knob to center and emits `{x: 0, y: 0}`
4. Direction vector is normalized (magnitude ≤ 1 at all positions)
5. Component is not rendered on desktop (isMobile false → null)

**UI hint**: yes

---

### Phase 3: Mobile Controls Integration

**Goal:** Wire joystick output into Player.jsx so touch and keyboard both drive the avatar — no input conflicts.

**Requirements:** MOV-01, MOV-02, MOV-03

**Files to create/modify:**
- `client/src/components/Player.jsx` — **MODIFY** (add joystick input path)
- `client/src/components/Hub3D.jsx` — **MODIFY** (render VirtualJoystick, pass direction to Player)

**Success criteria:**
1. On desktop: WASD moves avatar as before (no regression)
2. On mobile: joystick direction moves avatar in correct world-space direction
3. Movement data sent to Colyseus room is identical format (`{x, y, z, rotY}`) regardless of input source
4. Other players see mobile player movement in real time

**UI hint**: no

---

### Phase 4: Responsive UI

**Goal:** Make all UI surfaces legible and touch-friendly on phones from 375px wide, both portrait and landscape.

**Requirements:** UI-01, UI-02, UI-03, UI-04, UI-05, UI-06

**Files to create/modify:**
- `client/src/styles/mobile.css` — **CREATE**
- `client/src/styles/index.css` — **MODIFY** (import mobile.css, add viewport rules)
- `client/src/components/UI/HUD.jsx` — **MODIFY** (responsive layout)
- `client/src/components/LoginFormPanel.jsx` — **MODIFY** (mobile form fixes)

**Success criteria:**
1. Login form renders correctly at 375px width — no overflow or cropping
2. All buttons and interactive elements have ≥44px touch target
3. Form inputs do not trigger browser zoom on focus (font-size ≥ 16px)
4. HUD username/zone/status visible and non-overlapping at 375px
5. Layout holds in both portrait and landscape on a simulated mobile device

**UI hint**: yes

---

### Phase 5: Mobile Performance

**Goal:** Ensure mid-range mobile devices maintain playable framerate during hub exploration by adapting rendering complexity to device capability.

**Requirements:** PERF-01, PERF-02, PERF-03

**Files to create/modify:**
- `client/src/components/scenes/HubScene.js` — **MODIFY** (conditional geometry segments)
- `client/src/components/scenes/JourneyScene.jsx` — **MODIFY** (conditional particle count)
- `client/src/components/Hub3D.jsx` — **MODIFY** (pass isMobile to scenes)

**Success criteria:**
1. On mobile, sphere/planet geometry uses ≤32 segments instead of 64
2. Particle count is ≤100 on mobile vs 250 on desktop
3. No visible frame stuttering during normal movement in hub world on mobile browser
4. Desktop rendering unchanged (no quality regression)

**UI hint**: no

---

## Dependency Order

```
Phase 1 (Device Detection)
    ↓
Phase 2 (Joystick) ──┐
    ↓                │
Phase 3 (Controls) ←─┘
    ↓
Phase 4 (Responsive UI)   ← can run parallel with Phase 3
    ↓
Phase 5 (Performance)
```

Phases 3 and 4 can be parallelized after Phase 2 completes.
