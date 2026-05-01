const KEYS = {
  playerPos: 'm3_playerPos',
  playerRot: 'm3_playerRot',
  cameraPos: 'm3_cameraPos',
  zone:      'm3_zone',
  chatOpen:  'm3_chatOpen',
  audioMuted:'m3_audioMuted',
};

function jsonGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function jsonSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function savePlayerPos(x, y, z) { jsonSet(KEYS.playerPos, { x, y, z }); }
export function savePlayerRot(y)        { jsonSet(KEYS.playerRot, { y }); }
export function saveCameraPos(x, y, z)  { jsonSet(KEYS.cameraPos, { x, y, z }); }
export function saveZone(zone)          { jsonSet(KEYS.zone, zone); }
export function saveChatOpen(open)      { jsonSet(KEYS.chatOpen, open); }
export function saveAudioMuted(muted)   { jsonSet(KEYS.audioMuted, muted); }

export function getPlayerPos()  { return jsonGet(KEYS.playerPos, { x: 0, y: 0, z: 0 }); }
export function getPlayerRot()  { return jsonGet(KEYS.playerRot, { y: 0 }); }
export function getCameraPos()  { return jsonGet(KEYS.cameraPos, null); }
export function getZone()       { return jsonGet(KEYS.zone, 'hub'); }
export function getChatOpen()   { return jsonGet(KEYS.chatOpen, false); }
export function getAudioMuted() { return jsonGet(KEYS.audioMuted, false); }

export function clearSession() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
