// M3 Universe — Content Data
// Edit this file to update Store items and Gallery photos across the site.

// ─── STORE ────────────────────────────────────────────────────────────────────
// Categories from M3 lore:
//   A = Wearable merch (Kal)
//   B = Tech / innovative items (Psylens)
//   C = Small collectibles / trinkets (Gen)
//   D = Digital / access passes

export const STORE_ITEMS = [
  {
    id: 1,
    name: 'MOFUNDO Drop Tee',
    price: '$35',
    category: 'A',
    tag: 'NEW DROP',
    tagColor: '#22C55E',
    description: 'The original. MOFUNDO wordmark on heavyweight cotton.',
    pkg: 'KA0001',
    available: true,
  },
  {
    id: 2,
    name: 'Kal Hoodie',
    price: '$65',
    category: 'A',
    tag: 'LIMITED',
    tagColor: '#ff00ff',
    description: 'Every space is a board. Kal-edition heavyweight fleece.',
    pkg: 'KA0002',
    available: true,
  },
  {
    id: 3,
    name: 'Peace Sign Cap',
    price: '$28',
    category: 'A',
    tag: '',
    tagColor: '',
    description: 'GEN\'s signature ✌ — embroidered on a structured 6-panel.',
    pkg: 'KA0003',
    available: true,
  },
  {
    id: 4,
    name: 'EchoFrames (Concept)',
    price: '$120',
    category: 'B',
    tag: 'PRE-ORDER',
    tagColor: '#00ffff',
    description: 'AR wearable concept piece. First run, numbered PKG edition.',
    pkg: 'PB0001',
    available: true,
  },
  {
    id: 5,
    name: 'M3 PKG Card Pack',
    price: '$18',
    category: 'C',
    tag: 'COLLECTIBLE',
    tagColor: '#A78BFA',
    description: '12-card pack. Each card carries a unique PKG Number. No two packs alike.',
    pkg: 'GC0001',
    available: true,
  },
  {
    id: 6,
    name: 'Fritz Collectible Figure',
    price: '$42',
    category: 'C',
    tag: 'RARE',
    tagColor: '#ff9900',
    description: 'FritzGerald SnickleFritz — time-looping dog of the M3 universe. 4" resin figure.',
    pkg: 'GC0002',
    available: true,
  },
  {
    id: 7,
    name: 'Hub Access Pass',
    price: '$10',
    category: 'D',
    tag: 'DIGITAL',
    tagColor: '#00ff00',
    description: 'Your permanent PKG-linked access to the M3 Hub virtual space.',
    pkg: 'PD0001',
    available: true,
  },
  {
    id: 8,
    name: 'M3 Universe Book',
    price: '$25',
    category: 'D',
    tag: 'PRE-ORDER',
    tagColor: '#A78BFA',
    description: 'The origin story. GEN, KAL, PSY — the full MOFUNDO multiverse in print.',
    pkg: 'PD0002',
    available: true,
  },
  {
    id: 9,
    name: 'Living Merch Pin Set',
    price: '$15',
    category: 'C',
    tag: 'NEW',
    tagColor: '#22C55E',
    description: '3 enamel pins — GEN, KAL, PSY. Objects that remember.',
    pkg: 'GC0003',
    available: true,
  },
];

// ─── GALLERY ──────────────────────────────────────────────────────────────────
// Images served from /public/gallery/ (local) or full URLs (remote).

export const GALLERY_ITEMS = [
  { id: 1,  src: '/gallery/m3-01.png', title: 'M3 Universe', date: 'Jul 16, 2025', tag: 'LORE' },
  { id: 2,  src: '/gallery/m3-02.png', title: 'MOFUNDO Vision', date: 'Jul 16, 2025', tag: 'LORE' },
  { id: 3,  src: '/gallery/m3-03.png', title: 'The Mindscape', date: 'Jul 16, 2025', tag: 'CONCEPT' },
  { id: 4,  src: '/gallery/m3-04.png', title: 'M3 Multiverse', date: 'Jul 16, 2025', tag: 'CONCEPT' },
  { id: 5,  src: '/gallery/m3-05.png', title: 'GEN — Chapter 1', date: 'Apr 9, 2025', tag: 'CHARACTER' },
  { id: 6,  src: '/gallery/m3-06.png', title: 'KAL — The Map', date: 'Apr 9, 2025', tag: 'CHARACTER' },
  { id: 7,  src: '/gallery/m3-07.png', title: 'PSY — Liminal', date: 'Apr 9, 2025', tag: 'CHARACTER' },
  { id: 8,  src: '/gallery/m3-08.png', title: 'FOH Room', date: 'Apr 9, 2025', tag: 'LOCATION' },
  { id: 9,  src: '/gallery/m3-09.png', title: 'Mindscape Nexus', date: 'Apr 9, 2025', tag: 'LOCATION' },
  { id: 10, src: '/gallery/m3-10.png', title: 'PKG Card Drop', date: 'Apr 9, 2025', tag: 'MERCH' },
  { id: 11, src: '/gallery/m3-11.png', title: 'Fritz Sighting', date: 'Apr 9, 2025', tag: 'CHARACTER' },
  { id: 12, src: '/gallery/m3-12.png', title: 'MOFUNDO Live', date: 'Apr 9, 2025', tag: 'EVENT' },
  { id: 13, src: '/gallery/m3-13.png', title: 'Hub Session', date: 'Apr 9, 2025', tag: 'EVENT' },
  { id: 14, src: '/gallery/m3-14.png', title: 'EchoFrames Concept', date: 'Apr 9, 2025', tag: 'MERCH' },
  { id: 15, src: '/gallery/m3-15.png', title: 'The Triangle', date: 'Apr 9, 2025', tag: 'LORE' },
  { id: 16, src: '/gallery/m3-16.png', title: 'Universe Drop', date: 'Apr 9, 2025', tag: 'CONCEPT' },
];

// Tag colors for gallery badges
export const TAG_COLORS = {
  LORE:      '#A78BFA',
  CONCEPT:   '#00ffff',
  CHARACTER: '#ff00ff',
  LOCATION:  '#ffff00',
  MERCH:     '#22C55E',
  EVENT:     '#ff9900',
};
