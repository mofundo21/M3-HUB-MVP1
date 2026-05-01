# M3 Hub

## What This Is

M3 Hub is a browser-based 3D multiplayer world that serves as a personal website and creative platform. Users enter as avatars in a dark, cinematic, cyberpunk-aesthetic environment and navigate zones (Gallery, Store, Music Lounge, Lore rooms) with real-time multiplayer sync via Colyseus WebSocket. MVP1 is live on Vercel (frontend) and Railway (backend).

## Core Value

Players can enter the 3D world on any device — desktop or mobile — and see each other move in real time.

## Requirements

### Validated

- ✓ Frontend deployed on Vercel — MVP1
- ✓ Backend deployed on Railway (Node.js + Colyseus) — MVP1
- ✓ Real-time multiplayer sync via WebSocket — MVP1
- ✓ JWT authentication (guest + registered login) — MVP1
- ✓ Player spawning and avatar rendering (local + remote) — MVP1
- ✓ Desktop movement (WASD) — MVP1
- ✓ Cinematic 5-scene scroll-driven login journey (Three.js) — MVP1
- ✓ Ship crash landing with shockwave/particles/screen shake — MVP1
- ✓ Neon login form (cyan/magenta, slides up post-crash) — MVP1
- ✓ HUD overlay (username, zone, status) — MVP1

### Active

- [ ] Virtual joystick for mobile touch movement
- [ ] Device detection hook (mobile/tablet/desktop)
- [ ] Mobile-responsive UI (breakpoints: 375px, 414px, 768px, 1024px)
- [ ] Touch-friendly button sizing (44px+ minimum)
- [ ] Mobile-friendly form inputs
- [ ] Portrait and landscape orientation support
- [ ] Performance optimization for mobile (reduced geometry, particles)
- [ ] Player.jsx dual-input (WASD + joystick combined)

### Out of Scope

- Database integration (PostgreSQL) — deferred, currently using JSON file store
- Gallery zone full implementation — next milestone
- Store zone full implementation — next milestone
- Music Lounge — not started, next milestone
- Native mobile app — browser-first, no app store target

## Context

- **Stack:** React 18 + Three.js r128 (frontend), Node.js 18 + Express + Colyseus (backend), Vite build tool
- **Auth flow:** Guest/login → POST /api/auth/* → JWT → localStorage → Colyseus room join with token verification in HubRoom.onAuth()
- **Multiplayer sync:** WASD input → Player.jsx → room.send('move', {x,y,z,rotY}) → HubRoom.onMessage → broadcast → OtherPlayers.jsx
- **Login scene:** CinematicLoginScene.jsx renders full-screen Three.js canvas; scroll progress (0-100) drives all animation; crash at 87%, form at 93%
- **Key files:** App.jsx, Player.jsx, Hub3D.jsx, CinematicLoginScene.jsx, JourneyScene.jsx, HUD.jsx, styles/index.css
- **Colyseus WebSocket** real-time sync is the core multiplayer mechanism
- Mobile is completely unimplemented — no joystick, no responsive CSS, no touch handling

## Constraints

- **Tech stack**: Three.js r128, React 18, Colyseus — no major version changes mid-milestone
- **Performance**: Mobile devices may be low-end; geometry and particle counts must adapt
- **Touch**: Minimum 44px touch targets per mobile UX guidelines
- **Deployment**: Vercel (frontend auto-deploy on push), Railway (backend)
- **No native app**: Browser-only — no Capacitor/React Native

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Canvas-based joystick (not DOM) | Better performance for touch events on mobile | — Pending |
| useDeviceDetection hook for mobile check | Clean separation — components query hook, not window.width inline | — Pending |
| Separate mobile.css file | Keeps base styles clean; easier to audit mobile-specific overrides | — Pending |
| Conditional particle/geometry reduction | Avoid blanket quality reduction; adapt to device capability | — Pending |

---
*Last updated: 2026-05-01 after initialization*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
