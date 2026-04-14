# M3 Hub MVP - Deployment Notes

## Current Working State (April 2, 2026)

### Live Deployments
- **Client:** Vercel (https://m3-hub-mvp.vercel.app or your custom domain)
- **Server:** Railway (https://m3-hub-mvp1-production.up.railway.app)
- **WebSocket:** wss://m3-hub-mvp1-production.up.railway.app

### Key Fixes Applied (v1.0.0-websocket-stable)

#### 1. Server WebSocket Config (server/src/index.js)
```javascript
// Lines 37-40: WebSocket Transport
pingInterval: 15000,      // 5000 → 15000 (was dropping connections too fast)
pingTimeout: 30000,       // 10000 → 30000 (was timing out too quick)
graceTimeout: 120000,     // 60000 → 120000 (allow more time to reconnect)

// Lines 16-19: CORS
origin: true,             // '*' → true
credentials: true,        // false → true (allow auth tokens over WebSocket)
```

#### 2. Server Room Implementation (server/src/rooms/HubRoom.js)
- **Problem:** File contained React client code (Hub3D component), not a Colyseus Room
- **Solution:** Created proper Colyseus Room class with:
  - `seatReservationTime = 15` (was defaulting to 3s, too short for mobile)
  - `onAuth()` - JWT token validation
  - `onJoin()` - PlayerState creation with spawn offset
  - `onMessage('move')` - Position/rotation sync
  - `onMessage('zone')` - Zone tracking for spatial audio
  - `onLeave()` - Cleanup and broadcast
  - `onCreate()` - World state initialization

#### 3. Client URL Configuration (client/src/components/Hub3D.jsx)
```javascript
// Line 8: Changed from hardcoded production URL
// BEFORE: const COLYSEUS_URL = 'wss://m3-hub-mvp1-production.up.railway.app';
// AFTER:  const COLYSEUS_URL = import.meta.env.VITE_COLYSEUS_URL || 'ws://localhost:3001';
```

#### 4. Client Environment Variables (client/.env)
```
VITE_COLYSEUS_URL=wss://m3-hub-mvp1-production.up.railway.app
```

### Verification Checklist

#### Local Development
- [ ] `cd server && npm run dev` starts without errors
- [ ] `cd client && npm run dev` starts at http://localhost:5173
- [ ] Client connects to local server (ws://localhost:3001)
- [ ] Multiple browser tabs show players syncing in real-time
- [ ] No disconnects after 10+ seconds
- [ ] Console shows no WebSocket errors

#### Production
- [ ] Vercel deployment is live
- [ ] Railway deployment is live
- [ ] Client connects to production server (wss://m3-hub-mvp1-production.up.railway.app)
- [ ] Players can join and stay connected
- [ ] Movement syncs without lag
- [ ] No console errors in browser DevTools

### Git History / Recovery Points

**Current stable tag:**
```bash
git checkout v1.0.0-websocket-stable
```

**To revert to stable if anything breaks:**
```bash
git revert HEAD --no-edit
# or
git reset --hard v1.0.0-websocket-stable
```

### Dependencies

**Server (server/package.json)**
- Colyseus: `^0.14.x` or higher
- Express: `^4.x`
- jsonwebtoken: `^9.x` (for auth)

**Client (client/package.json)**
- colyseus.js: `^0.14.x` or higher
- React: `^18.x`
- Three.js: `^r128` or higher
- Vite: `^4.x` or higher

### Environment Variables

#### Netlify (if not using Vercel)
```
VITE_COLYSEUS_URL=wss://m3-hub-mvp1-production.up.railway.app
```

#### Vercel
Same as above, set in Vercel dashboard → Settings → Environment Variables

#### Railway (Server)
```
NODE_ENV=production
JWT_SECRET=your-secret-key-here
PORT=3001
```

### Known Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Players won't sync** | Position updates don't show on other clients | Check browser console for state schema errors; verify HubRoom.js is using correct state structure |
| **Disconnects after 5s** | Client connects then immediately disconnects | Check pingInterval/pingTimeout in index.js; verify client sends valid JWT token |
| **"CONNECTING..." forever** | Client stuck trying to connect | Check COLYSEUS_URL in Hub3D.jsx and .env; verify Railway server is running |
| **404 on WebSocket** | "WebSocket connection failed" in console | Check that server is exposed on correct port (3001); verify Railway has correct start command |

### Next Steps (Post April 18)

1. **Other Rooms** (April 19+)
   - GEN's FOH Room (isolation narrative)
   - KAL's Bounce Chamber (playful chaos)
   - PSY's Mindscape Nexus (philosophical synthesis)

2. **React Native Expo App**
   - Reuse Colyseus connection code
   - Port Three.js Hub3D to React Native Three
   - Support mobile players for Bonnaroo

3. **Content & Book**
   - Finish M3 book rough draft
   - Complete March content calendar
   - Hopeless Core video

### Useful Commands
```bash
# Test local connection
npm run dev  # Run both client and server

# Deploy to production
git push origin main  # Vercel and Railway auto-deploy

# Check server logs
railway logs m3-hub-mvp-server

# Emergency rollback
git reset --hard v1.0.0-websocket-stable
git push origin main --force
```

### Contact / Questions
- Check console logs first (F12 in browser, terminal for server)
- Review this document for known issues
- Check git history: `git log --oneline`

---
**Last updated:** April 2, 2026
**Stable version:** v1.0.0-websocket-stable
**Status:** ✅ LIVE (Web Hub working, April 18 ready)