# Deployment Notes — v1.0.0-websocket-stable

## Stack
- **Frontend:** Netlify (auto-deploys from `main` branch, builds from `client/`)
- **Backend:** Railway (auto-deploys from `main` branch, runs `server/src/index.js`)

## Environment Variables

### Netlify (set in dashboard — Site configuration → Environment variables)
| Variable | Value |
|---|---|
| `VITE_COLYSEUS_URL` | `wss://m3-hub-mvp1-production.up.railway.app` |

### Railway (set in dashboard — Variables)
| Variable | Value |
|---|---|
| `PORT` | `3001` (or Railway default) |
| `JWT_SECRET` | your secret key |

## WebSocket Config (server/src/index.js)
- `pingInterval`: 15000ms
- `pingTimeout`: 30000ms
- `graceTimeout`: 120000ms
- `seatReservationTime`: 15s (set in HubRoom)

## Tagged Stable State
`v1.0.0-websocket-stable` — April 2, 2026
Colyseus room working, multiplayer tested locally and on Railway.
April 18 DJ set ready.
