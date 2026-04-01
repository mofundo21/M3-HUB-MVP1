# M3 Hub MVP

Browser-based 3D multiplayer hub. Walk around, see other players, enter zones.

## Quick Start

### 1. Start the backend
```bash
cd server
npm install
npm start
# → http://localhost:3001
```

### 2. Start the frontend
```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

### 3. Test multiplayer
- Open `http://localhost:5173` in two browser windows
- Register different users in each
- Walk around with WASD — see each other move in real-time
- Click Store zone (green, right) or Gallery zone (yellow, left)

## PKG Format
`FirstInitial + LastInitial + 4-digit number`
- Yeriel Rodriguez → `YR0001`
- John Doe → `JD0001`
- Jane Davis → `JD0002`

## Controls
- **W/A/S/D** or Arrow keys — move
- **Click zones** — open panels
- **Logout** button — top right

## Zones
| Zone | Color | Position |
|------|-------|----------|
| PORTAL | Magenta | Center (0,0) |
| STORE | Green | Right (+15,0) |
| GALLERY | Yellow | Left (-15,0) |

## Stack
- Frontend: React + React Three Fiber + Three.js
- Backend: Node.js + Express + Colyseus
- Auth: JWT + localStorage
- DB: SQLite (file: `server/m3hub.db`)
