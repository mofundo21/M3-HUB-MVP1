# M3 HUB MVP - Roadmap

## ✅ COMPLETED

### Phase 1: Core Infrastructure
- [x] Auth system (register/login with JWT + password hashing)
- [x] User database (JSON-based persistence)
- [x] Session management (localStorage tokens)
- [x] Guest login option

### Phase 2: 3D Hub & Multiplayer
- [x] Colyseus multiplayer server
- [x] Avatar rendering (3D models in hub)
- [x] Movement controls (keyboard + mobile)
- [x] Chat system (global messaging)
- [x] Zone system (portals/areas)
- [x] Typing indicators

### Phase 3: Avatar Customization
- [x] 5 geometric avatar models (Cube, Sphere, Pyramid, Crystal, Helix)
- [x] Color customization (primary, secondary, accent)
- [x] Post-registration customization flow
- [x] Avatar preview in customizer
- [x] Save customization to localStorage
- [x] Display custom avatars in hub

### Phase 4: Profile System
- [x] Profile panel (side panel UI)
- [x] Edit bio (max 200 chars)
- [x] Show avatar with colors
- [x] Display stats: member since date, login streak, zones visited
- [x] Profile button (top-left hub)

### Phase 5: UI Polish
- [x] Cyberpunk login screen with animations
- [x] Mobile controls (joystick + buttons)
- [x] User info display (top-right)
- [x] Logout button
- [x] Grid background, glow effects

---

## 🎯 NEXT (PRIORITY ORDER)

### Phase 6: Stats & Achievements (HIGH)
- [ ] Server-side stat tracking (zones visited, consecutive login days)
- [ ] API endpoint: `/api/users/stats` (POST to update)
- [ ] Sync stats from localStorage to server on login
- [ ] Achievement badges (first zone, 7-day streak, etc)
- [ ] Display achievements in profile

### Phase 7: Social Features (HIGH)
- [ ] Leaderboard (top 10 by login streak)
- [ ] Friend system (add/remove friends)
- [ ] Activity feed (who logged in today, new bios, etc)
- [ ] Player search
- [ ] Profile visiting (click on other players to see their profile)

### Phase 8: Cosmetics Shop (MEDIUM)
- [ ] Currency system (coins earned from daily login)
- [ ] Cosmetic items (glows, particles, accessories)
- [ ] Shop UI (browse & purchase cosmetics)
- [ ] Equip cosmetics to avatar
- [ ] Display on other players' avatars

### Phase 9: Enhanced Customization (MEDIUM)
- [ ] More avatar models (pull from Sketchfab)
- [ ] Custom avatar names
- [ ] Preset color schemes
- [ ] Avatar preview 3D viewer

### Phase 10: Guild/Clan System (LOW)
- [ ] Create guilds
- [ ] Guild chat
- [ ] Guild leaderboard
- [ ] Guild cosmetics/banner

### Phase 11: Events & Mini-Games (LOW)
- [ ] Time-limited events
- [ ] Treasure hunt zones
- [ ] Hide & seek game
- [ ] Race tracks

### Phase 12: Monetization (FUTURE)
- [ ] Premium cosmetics
- [ ] Battle pass
- [ ] NFT integration (optional)

---

## 📊 PRIORITY MATRIX

| Priority | Feature | Est. Time | Impact |
|----------|---------|-----------|--------|
| 🔥 CRITICAL | Server stat sync | 1h | High |
| 🔥 CRITICAL | API endpoints for stats/profile | 1.5h | High |
| 🟠 HIGH | Leaderboard UI | 2h | High |
| 🟠 HIGH | Friend system | 2.5h | High |
| 🟠 HIGH | Cosmetics shop | 3h | High |
| 🟡 MEDIUM | More avatar models | 2h | Medium |
| 🟡 MEDIUM | Activity feed | 2h | Medium |
| 🟡 MEDIUM | Guild system | 4h | Medium |
| 🔵 LOW | Mini-games | 5h | Low |
| ⚪ FUTURE | Monetization | TBD | Variable |

---

## 🛠️ TECH STACK

**Frontend:**
- React + React Three Fiber (3D)
- Colyseus.js (multiplayer)
- Axios (HTTP)
- localStorage (persistence)

**Backend:**
- Node.js + Express
- Colyseus (multiplayer server)
- JWT (auth)
- bcryptjs (password hashing)
- JSON file database (m3hub.json)

**Deployment:**
- Client: Netlify
- Server: Railway

---

## 📅 SUGGESTED TIMELINE

**Week 1:**
- Phase 6: Server stat sync
- Phase 7: Leaderboard (basic)

**Week 2:**
- Phase 7: Friend system
- Phase 8: Cosmetics shop

**Week 3:**
- Phase 9: More avatars
- Phase 7: Activity feed

**Week 4+:**
- Phase 10: Guilds
- Phase 11: Mini-games
- Phase 12: Monetization

---

## 🚀 KEY NEXT STEPS

1. **Update database schema** - Add stats tracking, friends list, cosmetics
2. **Create API endpoints** - `/api/users/stats`, `/api/users/profile`, `/api/leaderboard`
3. **Build leaderboard UI** - Top 10 by consecutive login days
4. **Add cosmetics system** - Shop UI + equip logic
5. **Profile visiting** - Click players to see their profiles

---

## 💾 DATABASE SCHEMA (Current)

```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "username": "mofundo1",
      "password": "hashed_bcrypt",
      "pkg": "PKGABC123",
      "createdAt": "2024-04-21T10:00:00Z",
      "lastLoginAt": "2024-04-21T15:00:00Z",
      "consecutiveLoginDays": 3,
      "zonesVisited": ["portal", "store"],
      "avatar": {
        "model": "geometric_1",
        "primaryColor": "#00ffff",
        "secondaryColor": "#ff00ff",
        "accentColor": "#ffff00"
      }
    }
  ]
}
```

**TODO - Add to schema:**
- `bio`: string (user bio)
- `friends`: array (friend IDs)
- `cosmetics`: array (equipped cosmetics)
- `coins`: number (currency)
- `stats`: object (achievements, badges)
- `badges`: array (achievement badges earned)

---

## 🎓 LEARNING RESOURCES

- Colyseus docs: https://docs.colyseus.io/
- Three.js: https://threejs.org/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber/
- JWT: https://jwt.io/

---

**Last Updated:** 2024-04-21
**Current Phase:** 5 (UI Polish)
**Next Phase:** 6 (Stats & Achievements)
