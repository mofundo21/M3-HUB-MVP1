# M3 Hub — Requirements

## v1 Requirements (Mobile Optimization Milestone)

### Device Detection

- [ ] **DEV-01**: App detects device type (mobile/tablet/desktop) via `useDeviceDetection` hook
- [ ] **DEV-02**: Hook returns `isMobile`, `isTablet`, `isDesktop` booleans and updates on orientation change
- [ ] **DEV-03**: Components consume `isMobile` prop or hook result to conditionally render mobile vs desktop UI

### Virtual Joystick

- [ ] **JOY-01**: `VirtualJoystick.jsx` component renders canvas-based joystick in bottom-left corner on mobile
- [ ] **JOY-02**: Joystick handles touch start, move, and end events
- [ ] **JOY-03**: Joystick returns normalized direction vector (x, y in range -1 to 1)
- [ ] **JOY-04**: Joystick has visual feedback (outer ring, inner knob, moves with thumb)
- [ ] **JOY-05**: Joystick is hidden on desktop

### Player Movement

- [ ] **MOV-01**: `Player.jsx` uses WASD on desktop and joystick on mobile (not either/or — combined input)
- [ ] **MOV-02**: Joystick direction vector maps to player movement direction sent to Colyseus
- [ ] **MOV-03**: Movement feels responsive on mobile (no perceptible lag between touch and avatar motion)

### Responsive UI

- [ ] **UI-01**: `mobile.css` created with breakpoints at 375px, 414px, 768px, 1024px
- [ ] **UI-02**: All interactive elements (buttons, links) have minimum 44px touch target size
- [ ] **UI-03**: Form inputs in login panel are mobile-friendly (no zoom on focus, proper font size ≥16px)
- [ ] **UI-04**: HUD elements (username, zone, status) are legible and non-overlapping on 375px screens
- [ ] **UI-05**: `index.css` updated with mobile viewport meta and base responsive rules
- [ ] **UI-06**: Portrait and landscape orientations both render correctly without layout breaks

### Performance

- [ ] **PERF-01**: On mobile, Three.js geometry uses reduced segment counts (e.g. 32 vs 64 for spheres)
- [ ] **PERF-02**: Particle count is reduced on mobile (100 particles vs 250 on desktop)
- [ ] **PERF-03**: No perceptible frame rate degradation on mid-range mobile during normal hub exploration

## v2 Requirements (Deferred)

- **MOV-04**: Dedicated "sprint" button on mobile (double-tap joystick or separate button) — low priority
- **UI-07**: Haptic feedback on joystick touch events — nice to have
- **PERF-04**: WebGL context detection and fallback for very low-end devices
- **UI-08**: Custom scrollbar styling for mobile browsers

## Out of Scope

- Native mobile app (iOS/Android) — browser-only, no Capacitor target
- GamePad API support — keyboard + joystick sufficient for v1
- Offline mode / PWA — not required for multiplayer world
- Screen reader accessibility — deferred post-launch

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| DEV-01–03 | Phase 1: Device Foundation | — |
| JOY-01–05 | Phase 2: Virtual Joystick | — |
| MOV-01–03 | Phase 3: Mobile Controls Integration | — |
| UI-01–06 | Phase 4: Responsive UI | — |
| PERF-01–03 | Phase 5: Mobile Performance | — |
