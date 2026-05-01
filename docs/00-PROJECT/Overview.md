# M3 Hub Overview

## What Is M3 Hub?

Browser-based 3D multiplayer world serving as a personal website and creative platform.

Users:
- Enter a **3D portal world**
- Spawn as **customizable avatars**
- See **other players in real-time**
- Explore **interactive zones** (Gallery, Store, Music, Lore)
- Interact with a **living digital myth world**

## Status Dashboard

| Phase | Status | Progress | Notes |
|-------|--------|----------|-------|
| Phase 1: Foundation | ✅ Complete | 100% | Live on Vercel + Railway |
| Phase 2: Mobile | 🟡 In Progress | 40% | Joystick, responsive, chat |
| Phase 3: Hub UI | 🔵 Planning | 0% | Next week |
| Phase 4: Database | 🟣 Blocked | 0% | After phase 3 |
| Phase 5: Polish | 🟠 Future | 0% | Final phase |

## Key Features ✅

### Completed
- Real-time multiplayer (Colyseus WebSocket)
- 3D world rendering (Three.js + React Three Fiber)
- Cinematic login journey (5-scene scroll experience)
- Avatar customization & sync
- Mobile joystick controls
- Responsive design (375px to 1440px)
- Toggleable chat system
- Player cards (profiles)
- JWT authentication

### In Development
- MCP integration (Playwright, Firecrawl, Impeccable, Glif, Graphify)
- Graph database (social networks, zones, inventory, lore)
- Login form visibility fix
- Mobile auth choice screen
- Logout functionality

### TODO
- Zone system (Gallery, Store, Music, Lore)
- Database persistence (PostgreSQL)
- Friend system
- Inventory & trading
- Store & marketplace
- Music lounge

## Technical Stack

**Frontend:** React 18 + Three.js + Vite
**3D Graphics:** React Three Fiber + Three.js r128
**Real-time:** Colyseus (WebSocket multiplayer)
**Backend:** Node.js + Express
**Auth:** JWT tokens
**Deployment:** Vercel (frontend) + Railway (backend)
**Tools:** 6 MCPs integrated (Playwright, Firecrawl, Impeccable, MCP Base, Glif, Graphify)

## File Structure

```
M3-HUB-MVP1/
├── client/              (React frontend - Vercel)
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   └── vite.config.js
│
├── server/              (Node.js backend - Railway)
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── rooms/
│   │   ├── config/
│   │   └── database/
│   └── package.json
│
└── docs/                (This Obsidian vault)
    ├── 00-PROJECT/
    ├── 01-ARCHITECTURE/
    ├── 02-FEATURES/
    ├── 03-TECHNICAL/
    ├── 04-GUIDES/
    ├── 05-REFERENCE/
    ├── 06-DECISIONS/
    ├── 07-PROGRESS/
    └── 08-MEDIA/
```
