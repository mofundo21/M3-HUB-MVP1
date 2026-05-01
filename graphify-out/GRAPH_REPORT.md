# Graph Report - M3-HUB-MVP1  (2026-05-01)

## Corpus Check
- 43 files · ~1,623,690 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 131 nodes · 93 edges · 7 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]

## God Nodes (most connected - your core abstractions)
1. `HubRoom` - 6 edges
2. `MCPService` - 6 edges
3. `useDevice()` - 3 edges
4. `add_box()` - 2 edges
5. `add_light()` - 2 edges
6. `AppInner()` - 2 edges
7. `parseAvatar()` - 2 edges
8. `Avatar()` - 2 edges
9. `Hub3D()` - 2 edges
10. `DeviceProvider()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `AppInner()` --calls--> `useDevice()`  [INFERRED]
  client\src\App.jsx → client\src\context\DeviceContext.jsx
- `Hub3D()` --calls--> `useDevice()`  [INFERRED]
  client\src\components\Hub3D.jsx → client\src\context\DeviceContext.jsx
- `DeviceProvider()` --calls--> `useDeviceDetection()`  [INFERRED]
  client\src\context\DeviceContext.jsx → client\src\hooks\useDeviceDetection.js

## Communities

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (5): Hub3D(), DeviceProvider(), useDevice(), useDeviceDetection(), AppInner()

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (1): HubRoom

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (1): MCPService

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (4): add_box(), add_light(), Create a box primitive, Create a light source

### Community 7 - "Community 7"
Cohesion: 0.4
Nodes (2): HubRoomState, PlayerState

### Community 8 - "Community 8"
Cohesion: 0.5
Nodes (2): defaultData(), load()

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (2): Avatar(), parseAvatar()

## Knowledge Gaps
- **2 isolated node(s):** `Create a box primitive`, `Create a light source`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 3`** (7 nodes): `HubRoom`, `.onAuth()`, `.onCreate()`, `.onDispose()`, `.onJoin()`, `.onLeave()`, `HubRoom.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (7 nodes): `MCPService.js`, `MCPService`, `.constructor()`, `.crawlUrl()`, `.getStatus()`, `.initialize()`, `.scrapeUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (5 nodes): `HubRoomState`, `.constructor()`, `PlayerState`, `.constructor()`, `RoomState.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (5 nodes): `db.js`, `defaultData()`, `getDb()`, `load()`, `save()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (3 nodes): `Avatar.jsx`, `Avatar()`, `parseAvatar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `useDevice()` (e.g. with `AppInner()` and `Hub3D()`) actually correct?**
  _`useDevice()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Create a box primitive`, `Create a light source` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._