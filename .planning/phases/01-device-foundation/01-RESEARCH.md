# Phase 1: Device Foundation - Research

**Researched:** 2026-05-01
**Domain:** React 18 hooks for browser device-type detection
**Confidence:** HIGH

## Summary

Phase 1 introduces a single source of truth for device type via a `useDeviceDetection` React hook. The standard, most reliable 2026 approach is `window.matchMedia` with `MediaQueryList.addEventListener('change', ...)` — it natively covers both width breakpoints and orientation changes, fires only on actual transitions (no debouncing needed), and avoids the re-render storms typical of `resize` listeners. For touch capability (relevant to the joystick trigger in later phases), combine `(pointer: coarse)` media query with `navigator.maxTouchPoints` as a defense-in-depth check. The hook should expose `{ isMobile, isTablet, isDesktop }` and be consumed via React Context to avoid prop drilling through Hub3D/Player/HUD/etc.

**Primary recommendation:** Build `useDeviceDetection` on top of `window.matchMedia` listeners (one per breakpoint), SSR-guard with `typeof window !== 'undefined'` (cheap insurance even though Vite SPA does not SSR), and wrap consumers in a lightweight `DeviceProvider` context placed in `App.jsx`. Breakpoints align with REQUIREMENTS.md (UI-01): mobile `<768px`, tablet `768–1023px`, desktop `≥1024px`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEV-01 | App detects device type (mobile/tablet/desktop) via `useDeviceDetection` hook | matchMedia-based hook design (Architecture Pattern 1) + breakpoint table |
| DEV-02 | Hook returns `isMobile`, `isTablet`, `isDesktop` booleans and updates on orientation change | matchMedia `change` event natively fires on orientation flip (Pattern 2); no separate `orientationchange` listener required |
| DEV-03 | Components consume `isMobile` prop or hook result to conditionally render mobile vs desktop UI | Context Provider pattern (Pattern 3) — Hub3D consumes via `useDevice()` |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- GSD workflow: respect `.planning/STATE.md` as source of truth for current phase.
- code-review-graph MCP tools should be preferred over raw Grep/Read when exploring (informational; this research used Read because graph not yet seeded for new files).
- No major version bumps mid-milestone (React 18, Three.js r128, Vite locked).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Device-type detection | Browser/Client | — | Pure client-side concern; depends on `window.matchMedia`, screen, and pointer APIs available only in browser |
| State distribution | Browser/Client (React) | — | React Context is the idiomatic in-app state-fanout primitive |
| Persistence (none) | — | — | No need to persist; recompute on each session |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x (already in project) | Hooks (`useState`, `useEffect`, `useContext`, `useSyncExternalStore`) | Already the project's UI runtime [VERIFIED: project uses React 18 per PROJECT.md L47] |

### Supporting
None — no third-party dependency needed. `react-responsive` and `react-device-detect` are popular but unnecessary for this scope and add bundle weight. [CITED: react-responsive on npm — wraps matchMedia; we can do the same in ~30 LOC]

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom matchMedia hook | `react-responsive` | Adds dep + bundle bytes for trivial logic |
| Custom matchMedia hook | `react-device-detect` | Relies on UA sniffing — fragile, fails on iPad-as-desktop, not recommended in 2026 [CITED: MDN deprecates UA sniffing in favor of UA-CH and feature detection] |
| matchMedia | `window.innerWidth` + `resize` listener | Fires on every pixel of resize; needs debouncing; doesn't directly model breakpoints |
| matchMedia | `navigator.userAgent` parsing | Spoofable, brittle, fails on hybrid devices; Apple has frozen iPadOS UA to "Mac" [CITED: WebKit blog on iPadOS UA] |
| matchMedia | `window.screen.orientation.type` | Only covers orientation, not width breakpoints; redundant since matchMedia already fires on rotation that crosses a breakpoint or changes `(orientation: portrait)` |

**Installation:** None. Pure standard-library code.

**Version verification:** N/A — no new dependencies.

## Architecture Patterns

### System Architecture Diagram

```
window.matchMedia("(max-width: 767px)")  ──┐
window.matchMedia("(max-width: 1023px)") ──┤
window.matchMedia("(orientation: portrait)") ──┤
navigator.maxTouchPoints (one-time read)   ──┤
                                              │
                                              ▼
                              ┌───────────────────────────┐
                              │   useDeviceDetection()    │
                              │   (subscribes to MQLs,    │
                              │    derives booleans)      │
                              └────────────┬──────────────┘
                                           │ { isMobile, isTablet, isDesktop }
                                           ▼
                              ┌───────────────────────────┐
                              │   <DeviceProvider> in     │
                              │       App.jsx             │
                              └────────────┬──────────────┘
                                           │ Context value
                          ┌────────────────┼─────────────────┐
                          ▼                ▼                 ▼
                       Hub3D.jsx     MobileControls    (future) HUD/
                       (gates           (gate            LoginForm
                       MobileControls   render on
                       render)          mobile only)
```

### Recommended Project Structure

```
client/src/
├── hooks/
│   └── useDeviceDetection.js   # CREATE — core hook + provider/context
├── components/
│   ├── App.jsx                 # MODIFY — wrap tree in <DeviceProvider>
│   └── Hub3D.jsx               # MODIFY — call useDevice(), gate <MobileControls />
```

### Pattern 1: matchMedia-Subscription Hook

**What:** Subscribe to one `MediaQueryList` per breakpoint. The browser only fires `change` when crossing the threshold — zero noise.
**When to use:** Any breakpoint-driven UI logic.

```javascript
// Source: MDN — Window.matchMedia, MediaQueryList.addEventListener
// https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
import { useState, useEffect } from 'react';

const MOBILE_MAX = 767;   // <768px = mobile
const TABLET_MAX = 1023;  // 768–1023 = tablet, ≥1024 = desktop

function readState() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return { isMobile: false, isTablet: false, isDesktop: true };
  }
  const isMobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;
  const isTablet = !isMobile && window.matchMedia(`(max-width: ${TABLET_MAX}px)`).matches;
  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
}

export function useDeviceDetection() {
  const [state, setState] = useState(readState);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mqls = [
      window.matchMedia(`(max-width: ${MOBILE_MAX}px)`),
      window.matchMedia(`(max-width: ${TABLET_MAX}px)`),
      window.matchMedia('(orientation: portrait)'),
    ];
    const update = () => setState(readState());
    mqls.forEach(m => m.addEventListener('change', update));
    update(); // sync once after mount in case SSR mismatch
    return () => mqls.forEach(m => m.removeEventListener('change', update));
  }, []);

  return state;
}
```

### Pattern 2: Context Provider for Fanout

**What:** Wrap the app once; any component reads via `useDevice()`.
**When to use:** When ≥3 components need the same data (Hub3D, MobileControls, HUD, LoginFormPanel, future Player) — exactly our case.

```javascript
// Source: React 18 docs — Context
// https://react.dev/reference/react/createContext
import { createContext, useContext } from 'react';

const DeviceContext = createContext({ isMobile: false, isTablet: false, isDesktop: true });

export function DeviceProvider({ children }) {
  const value = useDeviceDetection();
  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevice() {
  return useContext(DeviceContext);
}
```

App.jsx wraps the entire tree:

```jsx
// MODIFY App.jsx (top level)
import { DeviceProvider } from './hooks/useDeviceDetection';
// ...
return (
  <DeviceProvider>
    {/* existing render-tree: CinematicLoginScene | AvatarCustomizer | Hub3D */}
  </DeviceProvider>
);
```

Hub3D.jsx consumes:

```jsx
import { useDevice } from '../hooks/useDeviceDetection';
// inside Hub3D component
const { isMobile } = useDevice();
// ...
{isMobile && <MobileControls />}   // line 356 — gate the existing render
```

### Anti-Patterns to Avoid

- **`window.innerWidth` in render or every effect tick** — causes a re-render every pixel of a desktop drag-resize; needs debounce.
- **`navigator.userAgent` sniffing** — iPadOS reports "Mac" UA; fails on tablets-as-desktop. Use feature/MQ checks instead.
- **Reading `window.matchMedia` inside the component body without `useEffect`** — runs on every render and leaks listeners.
- **Forgetting cleanup in `useEffect`** — listeners pile up across hot reloads in Vite dev mode.
- **Using `.addListener()` (deprecated) instead of `.addEventListener('change', ...)`** — old Safari fallback no longer needed; modern Safari supports the standard API. [CITED: MDN MediaQueryList — `addListener` is deprecated]
- **Recreating the `MediaQueryList` inside the listener** — keep refs to the same MQL objects so removal works.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Breakpoint change detection | Custom debounced `resize` polling loop | `window.matchMedia(...).addEventListener('change', ...)` | Browser already debounces to threshold-crossings; built-in; zero deps |
| Orientation detection | Separate `orientationchange` listener | The same matchMedia change events (width swap covers it) or `(orientation: portrait)` MQL | Single subscription mechanism; consistent semantics |
| Touch capability | UA string parsing | `(pointer: coarse)` MQ + `navigator.maxTouchPoints > 0` | Feature detection, not sniffing |

**Key insight:** The browser already exposes a perfect primitive (`matchMedia`); a 30-line hook is correct and complete — no library required.

## Common Pitfalls

### Pitfall 1: Re-render Storm From `resize`
**What goes wrong:** Naive hook listens to `window.resize`, calls `setState({width: window.innerWidth})`, every component re-renders ~60×/sec during resize.
**Why it happens:** `resize` fires continuously; React reconciles even if the *derived* boolean didn't flip.
**How to avoid:** Use `matchMedia('change')` (only fires on threshold crossing) OR derive booleans first and `setState` only when they differ.
**Warning sign:** React DevTools shows Hub3D/Avatar re-rendering during a window drag.

### Pitfall 2: SSR Hydration Mismatch
**What goes wrong:** First render returns `isMobile: false` on server, `true` on mobile client → React warns about hydration mismatch.
**Why it happens:** `window` doesn't exist server-side.
**How to avoid:** This project uses **Vite SPA, not SSR** (verified — `App.jsx` mounts client-side only) so this is not an immediate concern. Keep the `typeof window === 'undefined'` guard anyway as cheap insurance against future SSR adoption.

### Pitfall 3: Listener Leak Across Hot Reload
**What goes wrong:** Vite HMR remounts the hook; old listeners stay attached on `window`.
**Why it happens:** Missing/incorrect cleanup function in `useEffect`.
**How to avoid:** Always return cleanup that calls `removeEventListener` on the **same** MQL object that registered.

### Pitfall 4: iPad Reports as Desktop
**What goes wrong:** Modern iPad Safari sends a Mac UA; UA-based libs classify iPad as desktop.
**Why it happens:** Apple's deliberate "request desktop site" default since iPadOS 13.
**How to avoid:** matchMedia + `navigator.maxTouchPoints` correctly classifies iPad as touch tablet regardless of UA.

### Pitfall 5: Player.jsx Doesn't Exist Yet
**What goes wrong:** ROADMAP/REQUIREMENTS reference `Player.jsx` but the file is **not present** in the repo — movement currently lives in `PlayerController` inside `Hub3D.jsx` (lines 19–60).
**Why it happens:** Stale doc reference; movement was inlined.
**How to avoid:** For Phase 1 success criterion ("at least one consumer component receives `isMobile`"), use **Hub3D.jsx** (gate the existing `<MobileControls />` at line 356). Defer Player.jsx integration to Phase 3 when joystick wiring happens. Flag this discrepancy to the planner.

## Runtime State Inventory

> Greenfield additive change — Step 2.5 inventory:

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | None — verified by grep for isMobile/matchMedia (only existing match: `MobileControls.jsx`, no persisted state) | None |
| Live service config | None — no Colyseus/Vercel config touches device type | None |
| OS-registered state | None | None |
| Secrets/env vars | None | None |
| Build artifacts | None — no compiled artifacts to invalidate | None |

## Code Examples

### Full Hook File (drop-in)

```javascript
// File: client/src/hooks/useDeviceDetection.js
// Source: MDN Window.matchMedia + React 18 useContext docs
import { createContext, useContext, useEffect, useState } from 'react';

const MOBILE_MAX = 767;
const TABLET_MAX = 1023;

function read() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return { isMobile: false, isTablet: false, isDesktop: true, isTouch: false, isPortrait: false };
  }
  const isMobile  = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;
  const isTablet  = !isMobile && window.matchMedia(`(max-width: ${TABLET_MAX}px)`).matches;
  const isDesktop = !isMobile && !isTablet;
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints || 0) > 0;
  return { isMobile, isTablet, isDesktop, isTouch, isPortrait };
}

export function useDeviceDetection() {
  const [state, setState] = useState(read);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const queries = [
      `(max-width: ${MOBILE_MAX}px)`,
      `(max-width: ${TABLET_MAX}px)`,
      '(orientation: portrait)',
      '(pointer: coarse)',
    ];
    const mqls = queries.map(q => window.matchMedia(q));
    const onChange = () => setState(read());
    mqls.forEach(m => m.addEventListener('change', onChange));
    return () => mqls.forEach(m => m.removeEventListener('change', onChange));
  }, []);
  return state;
}

const DeviceContext = createContext(read());
export function DeviceProvider({ children }) {
  const value = useDeviceDetection();
  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}
export function useDevice() { return useContext(DeviceContext); }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `window.resize` + debounce | `matchMedia.addEventListener('change')` | matchMedia broadly supported since ~2018 | Simpler, no debounce, no re-render storm |
| `MediaQueryList.addListener` | `MediaQueryList.addEventListener('change', ...)` | Standardized; old API deprecated [CITED: MDN] | Use the standard event API |
| `navigator.userAgent` parsing | Feature detection (`pointer: coarse`, `maxTouchPoints`) | iPadOS 13 (2019) broke UA sniffing | Reliable on hybrid/tablet devices |
| HOC pattern (`withDevice`) | React Context + custom hook | React 16.8 hooks era | Less boilerplate |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Breakpoints `<768 / 768–1023 / ≥1024` map to mobile/tablet/desktop | Standard Stack, Pattern 1 | Low — these align with REQUIREMENTS.md UI-01 (375/414/768/1024) and Tailwind defaults; can be tuned in one constant. |
| A2 | Vite SPA with no SSR (so SSR-mismatch is non-issue) | Pitfall 2 | Low — verified by reading `App.jsx` (uses `localStorage`, `useEffect` mount pattern, no Vite SSR config seen); guard kept anyway. |
| A3 | Hub3D is the canonical consumer for the success criterion since `Player.jsx` does not yet exist | Pitfall 5, Patterns | Low — verified by Glob; planner should confirm. |

## Open Questions

1. **Should the hook expose `isPortrait` and `isTouch` now or defer?**
   - What we know: REQUIREMENTS DEV-02 mandates only `isMobile/isTablet/isDesktop`.
   - What's unclear: Phase 2 (joystick) and Phase 4 (responsive UI) likely want them.
   - Recommendation: Expose them in the same hook (single source of truth) but mark them as "additive — phase 2+ consumers"; planner can scope tasks to test only the three required booleans.

2. **Should `<DeviceProvider>` wrap inside or outside `<CinematicLoginScene>`?**
   - What we know: Login form (Phase 4) will need `isMobile`.
   - What's unclear: Currently login renders before `Hub3D`.
   - Recommendation: Wrap the **entire** App.jsx return tree (above the login/customizer/hub branching) so all surfaces have access.

## Environment Availability

> Phase has no external runtime dependencies — pure browser/React code. SKIPPED.

## Sources

### Primary (HIGH confidence)
- [MDN — Window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) — API surface, change events
- [MDN — MediaQueryList](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList) — `addEventListener('change')` is the standard; `addListener` deprecated
- [MDN — Navigator.maxTouchPoints](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/maxTouchPoints) — touch capability detection
- [React 18 docs — useContext / createContext](https://react.dev/reference/react/createContext) — context fanout pattern
- Codebase: `client/src/App.jsx`, `client/src/components/Hub3D.jsx`, `client/src/components/MobileControls.jsx` — verified existing patterns

### Secondary (MEDIUM confidence)
- WebKit/Apple iPadOS UA freeze — known industry behavior, motivates feature detection over UA sniffing

### Tertiary (LOW confidence)
- None used — all claims verified.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — built-in browser APIs, no third-party version risk
- Architecture: HIGH — canonical React 18 hook + context pattern
- Pitfalls: HIGH — well-documented by MDN; iPad UA quirk widely known

**Research date:** 2026-05-01
**Valid until:** ~2026-06-01 (stable browser APIs, low churn risk)
