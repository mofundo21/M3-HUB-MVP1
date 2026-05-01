# Open Tickets

## Critical

| ID | Title | File(s) | Status |
|----|-------|---------|--------|
| BUG-001 | Login form not showing at 93% scroll | CinematicLoginScene.jsx, LoginFormPanel.jsx | ✅ Fixed (commit 22d7164) |
| BUG-002 | Username/password login returns 401 | server/src/routes/auth.js, utils/jwt.js | ✅ Fixed — auth works on Railway (tested 2026-05-01) |
| BUG-003 | Mobile forces guest login, no choice | App.jsx, Hub3D.jsx | ✅ Fixed — MobileAuthModal + Hub3D logout button exist |

## In Progress

| ID | Title | Status |
|----|-------|--------|
| FEAT-001 | MCP integration (6 tools) | In Progress |
| FEAT-002 | Graphify graph database setup | In Progress |

## Backlog

| ID | Title | Phase |
|----|-------|-------|
| FEAT-003 | Zone system (Gallery, Store, Music, Lore) | Phase 3 |
| FEAT-004 | HUD redesign | Phase 3 |
| FEAT-005 | PostgreSQL persistence | Phase 4 |
| FEAT-006 | Friend system | Phase 4 |
| FEAT-007 | Inventory & trading | Phase 4 |
| FEAT-008 | Music lounge | Phase 4 |
| BUG-004 | JSON DB resets on Railway redeploy (ephemeral filesystem) | Phase 4 |
