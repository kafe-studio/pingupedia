// Sprint 006 Run 019-024: dalších 30 místností v 6 klastrech.
// Cluster connections (přes existing rooms — viz levels.ts):
//   planety.top    → aurora1     (Aurora, 5)
//   iglu.right     → vrak2       (Vrak, 5)
//   galapagos.right→ palma       (Tropický ostrov, 5)
//   kolonie.top    → ledovec     (Severní pól, 5)
//   vrchol.top     → katedra     (Tučňáčí katedrála, 5)
//   kalejdoskop.right → magArchipelag (Magellan, 5)

import type { Exit, Guardian, Item, Room } from "./types";
import { TILE } from "./types";

function h(sprite: Guardian["sprite"], y: number, minX: number, maxX: number, vx = 0.6, w = 20, hSize = 16): Guardian {
  return { kind: "horiz", sprite, x: minX * TILE, y: y * TILE + (TILE - hSize), w, h: hSize, minX: minX * TILE, maxX: (maxX + 1) * TILE - w, vx };
}
function v(sprite: Guardian["sprite"], x: number, minY: number, maxY: number, vy = 0.6, w = 16, hSize = 16): Guardian {
  return { kind: "vert", sprite, x: x * TILE + (TILE - w) / 2, y: minY * TILE, w, h: hSize, minY: minY * TILE, maxY: (maxY + 1) * TILE - hSize, vy };
}
function s(sprite: Guardian["sprite"], x: number, y: number, w = 16, hSize = 16): Guardian {
  return { kind: "static", sprite, x: x * TILE, y: y * TILE, w, h: hSize };
}
function i(kind: Item["kind"], x: number, y: number, id: string): Item {
  return { kind, x, y, id };
}
function exit(side: Exit["side"], toRoom: string, toX?: number, toY?: number): Exit {
  return { side, toRoom, toX, toY };
}

// =============================================================================
// Cluster: Aurora (5 místností, palette aurora) — vstup z planety.top
// =============================================================================

const aurora1: Room = {
  id: "aurora1",
  name: "Polární záře — vstup",
  palette: "aurora",
  tiles: [
    ".........H..........",
    ".........H..........",
    "..=======H======....",
    ".........H..........",
    ".........H..........",
    "...====.=H=..====...",
    "....................",
    "....................",
    "..H..............H..",
    "..H..====H=======H..",
    "..H......H.......H..",
    "..H......H.......H..",
    ".........H..........",
    "########..##########",
  ],
  guardians: [v("snowwind", 9, 3, 11, 0.9), h("petrel", 6, 1, 18, 0.7)],
  items: [i("crystal", 9, 1, "au1-c1"), i("fish", 4, 4, "au1-f1"), i("medal", 14, 4, "au1-m1")],
  exits: [
    exit("bottom", "planety", 9, 1),
    exit("left", "auroraZarka", 18, 11),
    exit("right", "auroraOltar", 1, 11),
    exit("top", "auroraKomin", 9, 12),
  ],
  spawn: { x: 9 * TILE, y: 1 * TILE },
  hint: "Polární záře — křižovatka aurory.",
};

const auroraZarka: Room = {
  id: "auroraZarka",
  name: "Zářivý sloup",
  palette: "aurora",
  tiles: [
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    "####################",
  ],
  guardians: [v("snowwind", 5, 1, 12, 0.9), v("snowwind", 14, 1, 12, 0.7)],
  items: [i("crystal", 1, 1, "auz-c1"), i("crystal", 18, 1, "auz-c2"), i("flag", 9, 6, "auz-fl"), i("fish", 9, 12, "auz-f1")],
  exits: [exit("right", "aurora1", 1, 11)],
  spawn: { x: 18 * TILE, y: 12 * TILE },
  hint: "Zářivý sloup — postup mezi plošinami.",
};

const auroraOltar: Room = {
  id: "auroraOltar",
  name: "Aurorin oltář",
  palette: "aurora",
  tiles: [
    "....................",
    "....................",
    "..==============....",
    "....................",
    "....................",
    "....================",
    "....................",
    "....................",
    "..======............",
    "....................",
    "....................",
    "..==============....",
    "....................",
    "####################",
  ],
  guardians: [h("petrel", 1, 1, 14, 0.9), s("crystal", 9, 6)],
  items: [i("medal", 9, 1, "auo-m1"), i("heart", 1, 4, "auo-h1"), i("crystal", 17, 4, "auo-c1"), i("flag", 1, 7, "auo-fl")],
  exits: [exit("left", "aurora1", 18, 11)],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Oltář aurory — sebrat srdce a vrátit se.",
};

const auroraKomin: Room = {
  id: "auroraKomin",
  name: "Komín k auroře",
  palette: "aurora",
  tiles: [
    "....................",
    "..H.................",
    "..H.....========....",
    "..H.................",
    "..H.................",
    "..H..====...........",
    "..H.................",
    "..H.................",
    "..H........====.....",
    "..H.....=H=.........",
    "..H......H..........",
    "..H..====H..........",
    "..H......H..........",
    "########..##########",
  ],
  guardians: [v("snowwind", 9, 1, 12, 1.0), h("petrel", 7, 8, 18, 0.7)],
  items: [i("medal", 9, 1, "auk-m1"), i("crystal", 5, 4, "auk-c1"), i("crystal", 14, 7, "auk-c2"), i("fish", 5, 10, "auk-f1")],
  exits: [exit("bottom", "aurora1", 9, 1)],
  spawn: { x: 9 * TILE, y: 1 * TILE },
  hint: "Komín — vyšplhat po žebříku, potom skoky.",
};

const auroraOblak: Room = {
  id: "auroraOblak",
  name: "Aurorin oblak",
  palette: "aurora",
  tiles: [
    "....................",
    ".====...====...====.",
    "....................",
    "....................",
    "..====..====..====..",
    "....................",
    "....................",
    "....====..====......",
    "....................",
    "....................",
    "..====...====...====",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("petrel", 3, 1, 17, 1.0), v("crystal", 9, 5, 7, 0)],
  items: [i("flag", 1, 0, "aub-fl"), i("crystal", 18, 0, "aub-c1"), i("medal", 9, 9, "aub-m1"), i("heart", 1, 12, "aub-h1")],
  exits: [exit("bottom", "auroraOltar", 9, 1)],
  spawn: { x: 9 * TILE, y: 12 * TILE },
  hint: "Oblak aurory — voláci nahoře.",
};

// =============================================================================
// Cluster: Vrak (5 místností, palette wreck) — vstup z iglu.right
// =============================================================================

const vrak2: Room = {
  id: "vrak2",
  name: "Vyplavený vrak",
  palette: "wreck",
  tiles: [
    ".........H..........",
    ".........H..........",
    ".........H..........",
    "..=======H======....",
    ".........H..........",
    "........=H=.........",
    "...=====...=====....",
    "....................",
    "....................",
    "..H.....=H=......H..",
    "..H..====H=======H..",
    "..H......H.......H..",
    ".........H..........",
    "########..##########",
  ],
  guardians: [v("bubble", 9, 4, 12, 0.7), h("seal", 7, 1, 18, 0.6)],
  items: [i("fish", 9, 2, "vr2-f1"), i("crystal", 4, 5, "vr2-c1"), i("medal", 14, 8, "vr2-m1")],
  exits: [
    exit("left", "majak", 18, 11),
    exit("right", "pristav", 1, 11),
    exit("bottom", "rezavyKormidlnik", 9, 1),
    exit("top", "pokladVraku", 9, 12),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Vyplavený vrak — přístav doprava, kormidlo dolů.",
};

const pristav: Room = {
  id: "pristav",
  name: "Přístav",
  palette: "wreck",
  tiles: [
    "....................",
    "....................",
    "....................",
    "..==..====..====....",
    "....................",
    "..============......",
    "....................",
    "....................",
    "..==~~~~~~~~~~~~==..",
    "....................",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("seal", 1, 6, 18, 0.9), h("bubble", 1, 8, 17, 0.5)],
  items: [i("fish", 4, 2, "pri-f1"), i("fish", 14, 2, "pri-f2"), i("medal", 9, 5, "pri-m1"), i("crystal", 17, 12, "pri-c1")],
  exits: [exit("left", "vrak2", 18, 11)],
  spawn: { x: 18 * TILE, y: 12 * TILE },
  hint: "Přístav — voda dole, plošiny nahoře.",
};

const prazdnaSelma: Room = {
  id: "prazdnaSelma",
  name: "Prázdná soutěska",
  palette: "wreck",
  tiles: [
    "....................",
    "....................",
    "...####....####.....",
    "....................",
    "....................",
    "...####....####.....",
    "....................",
    "....................",
    "...####....####.....",
    "....................",
    "....................",
    "...####....####.....",
    "....................",
    "####################",
  ],
  guardians: [h("polarbear", 4, 6, 17, 0.9), v("snowwind", 9, 1, 12, 0.7)],
  items: [i("flag", 9, 1, "ps-fl"), i("fish", 1, 4, "ps-f1"), i("fish", 18, 7, "ps-f2"), i("medal", 9, 12, "ps-m1")],
  exits: [exit("right", "rezavyKormidlnik", 1, 12)],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Prázdná soutěska — slalom mezi sloupy.",
};

const rezavyKormidlnik: Room = {
  id: "rezavyKormidlnik",
  name: "Rezavý kormidlík",
  palette: "wreck",
  tiles: [
    ".........H..........",
    ".........H..........",
    ".........H..........",
    "..==.....H........==",
    ".........H..........",
    "..=======H=...======",
    "....................",
    "....................",
    "...====..====..====.",
    "....................",
    "....................",
    "..==......==......==",
    "....................",
    "########..##########",
  ],
  guardians: [h("seal", 4, 1, 18, 1.0), v("crystal", 9, 5, 8, 0)],
  items: [i("crystal", 9, 2, "rk-c1"), i("medal", 1, 4, "rk-m1"), i("medal", 18, 4, "rk-m2"), i("heart", 9, 7, "rk-h1")],
  exits: [
    exit("top", "vrak2", 9, 12),
    exit("left", "prazdnaSelma", 18, 12),
    exit("bottom", "more", 9, 1),
  ],
  spawn: { x: 9 * TILE, y: 1 * TILE },
  hint: "Rezavé kormidlo — propad k moři.",
};

const pokladVraku: Room = {
  id: "pokladVraku",
  name: "Poklad vraku",
  palette: "wreck",
  tiles: [
    "....................",
    "....................",
    "..==============....",
    "....................",
    "....................",
    "..####........####..",
    "....................",
    "....................",
    "....================",
    "........=H=.........",
    ".........H..........",
    "..=======H======....",
    ".........H..........",
    "####################",
  ],
  guardians: [h("seal", 1, 1, 14, 0.6), s("crystal", 9, 6), s("crystal", 4, 12), s("crystal", 14, 12)],
  items: [i("medal", 4, 1, "pv-m1"), i("medal", 14, 1, "pv-m2"), i("flag", 9, 4, "pv-fl"), i("heart", 9, 6, "pv-h1"), i("crystal", 9, 10, "pv-c1")],
  exits: [exit("bottom", "vrak2", 9, 1)],
  spawn: { x: 9 * TILE, y: 1 * TILE },
  hint: "Poklad vraku — bohatství i past krystalů.",
};

// =============================================================================
// Cluster: Tropický ostrov (5 místností, palette tropical) — vstup z galapagos.right
// =============================================================================

const palma: Room = {
  id: "palma",
  name: "Pod palmou",
  palette: "tropical",
  tiles: [
    ".........H..........",
    "..####..####..####..",
    ".........H..........",
    "....=====H==========",
    ".........H..........",
    "........=H=.........",
    "..==..............==",
    "....................",
    "....................",
    "..H..====H=.====..H.",
    "..H......H.......H..",
    "..H......H.......H..",
    ".........H..........",
    "########..##########",
  ],
  guardians: [h("petrel", 5, 1, 17, 0.9), v("crystal", 9, 4, 7, 0)],
  items: [i("flag", 4, 0, "pal-fl"), i("fish", 14, 0, "pal-f1"), i("medal", 9, 8, "pal-m1")],
  exits: [
    exit("bottom", "terasy", 9, 1),
    exit("right", "ananas", 1, 11),
    exit("top", "tropPlazh", 9, 12),
    exit("left", "liana", 18, 11),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Pod palmou — křižovatka tropů.",
};

const ananas: Room = {
  id: "ananas",
  name: "Ananasovník",
  palette: "tropical",
  tiles: [
    "....................",
    "....................",
    ".===................",
    "....................",
    "..====...====.......",
    "....................",
    "..............======",
    "....................",
    "..==..====..........",
    "....................",
    "..............======",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("seal", 4, 1, 18, 0.9), h("petrel", 8, 1, 18, 1.1)],
  items: [i("fish", 1, 1, "an-f1"), i("medal", 18, 5, "an-m1"), i("crystal", 5, 7, "an-c1"), i("flag", 18, 9, "an-fl")],
  exits: [exit("left", "palma", 18, 11)],
  spawn: { x: 18 * TILE, y: 12 * TILE },
  hint: "Ananasovník — výstup po větvích.",
};

const liana: Room = {
  id: "liana",
  name: "Liány",
  palette: "tropical",
  tiles: [
    "....................",
    "....................",
    "..H...H...H...H...H.",
    "..H...H...H...H...H.",
    "..H...H...H...H...H.",
    "..H...H...H...H...H.",
    "..H...H...H...H...H.",
    "..H...H...H...H...H.",
    "..H...H...H...H...H.",
    "..H...H...H...H...H.",
    "..H...H...H...H...H.",
    "..H...H...H...H...H.",
    "....................",
    "####################",
  ],
  guardians: [h("petrel", 12, 1, 18, 1.0), h("seal", 1, 1, 18, 0.7)],
  items: [i("fish", 1, 1, "li-f1"), i("fish", 18, 1, "li-f2"), i("medal", 9, 6, "li-m1"), i("crystal", 18, 12, "li-c1")],
  exits: [exit("right", "palma", 1, 11)],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Liány — žebříky všude, hledej cestu.",
};

const tropPlazh: Room = {
  id: "tropPlazh",
  name: "Tropická pláž",
  palette: "tropical",
  tiles: [
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "..==..====..====..==",
    "....................",
    "....................",
    "..======......======",
    "........=H=.........",
    "..~~~~~~~H~~~~~~~~..",
    "..~~~~~~~H~~~~~~~~..",
    ".........H..........",
    "####################",
  ],
  guardians: [h("seal", 4, 1, 18, 1.0), h("bubble", 1, 10, 17, 0.6)],
  items: [i("flag", 9, 0, "tp-fl"), i("fish", 1, 7, "tp-f1"), i("fish", 18, 7, "tp-f2"), i("medal", 9, 9, "tp-m1"), i("heart", 9, 12, "tp-h1")],
  exits: [exit("bottom", "palma", 9, 1)],
  spawn: { x: 9 * TILE, y: 1 * TILE },
  hint: "Tropická pláž — voda dole, sebrat srdce.",
};

const dzungle: Room = {
  id: "dzungle",
  name: "Džungle",
  palette: "tropical",
  tiles: [
    "....................",
    "..####..####..####..",
    "....................",
    "..==..==..==..==....",
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("petrel", 4, 1, 17, 0.9), h("seal", 7, 1, 17, 1.0)],
  items: [i("medal", 1, 0, "dz-m1"), i("medal", 18, 0, "dz-m2"), i("crystal", 9, 6, "dz-c1"), i("fish", 9, 12, "dz-f1")],
  exits: [exit("left", "ananas", 18, 12)],
  spawn: { x: 18 * TILE, y: 12 * TILE },
  hint: "Džungle — bujná, dead-end.",
};

// =============================================================================
// Cluster: Severní pól (5 místností, palette arctic) — vstup z kolonie.top
// =============================================================================

const ledovec: Room = {
  id: "ledovec",
  name: "Velký ledovec",
  palette: "arctic",
  tiles: [
    ".........H..........",
    ".........H..........",
    "..=======H======....",
    ".........H..........",
    ".........H..........",
    "..====..=H=.====....",
    "....................",
    "....................",
    "..H..............H..",
    "..H..====H=.====.H..",
    "..H......H.......H..",
    "..H......H.......H..",
    ".........H..........",
    "########..##########",
  ],
  guardians: [h("polarbear", 7, 1, 18, 0.7), v("snowwind", 9, 3, 11, 0.9)],
  items: [i("crystal", 9, 1, "le-c1"), i("fish", 4, 4, "le-f1"), i("medal", 14, 4, "le-m1")],
  exits: [
    exit("top", "kolonie", 9, 12),
    exit("left", "polarniDen", 18, 11),
    exit("right", "snehovaBoure", 1, 11),
    exit("bottom", "iglutop", 9, 1),
  ],
  spawn: { x: 9 * TILE, y: 1 * TILE },
  hint: "Velký ledovec — křižovatka severu.",
};

const polarniDen: Room = {
  id: "polarniDen",
  name: "Polární den",
  palette: "arctic",
  tiles: [
    "....................",
    "....................",
    "...=====...=====....",
    "....................",
    "....................",
    "..==..====..====..==",
    "....................",
    "....................",
    "..======......======",
    "....................",
    "....................",
    ".......======.......",
    "....................",
    "####################",
  ],
  guardians: [h("seal", 5, 1, 18, 0.9), h("petrel", 9, 1, 18, 1.0)],
  items: [i("flag", 4, 1, "pd-fl"), i("flag", 14, 1, "pd-fl2"), i("medal", 9, 7, "pd-m1"), i("fish", 9, 10, "pd-f1")],
  exits: [exit("right", "ledovec", 1, 11)],
  spawn: { x: 18 * TILE, y: 12 * TILE },
  hint: "Polární den — slunce nezapadá, sbírej rychle.",
};

const snehovaBoure: Room = {
  id: "snehovaBoure",
  name: "Sněhová bouře",
  palette: "arctic",
  tiles: [
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    "....................",
    "..==..==..==..==....",
    "........=H=.........",
    ".........H..........",
    "..==..==.H==..==....",
    ".........H..........",
    "####################",
  ],
  guardians: [v("snowwind", 5, 1, 12, 1.2), v("snowwind", 14, 1, 12, 1.2), h("petrel", 7, 1, 18, 1.0)],
  items: [i("fish", 1, 1, "sb-f1"), i("crystal", 18, 4, "sb-c1"), i("medal", 1, 9, "sb-m1"), i("heart", 18, 12, "sb-h1")],
  exits: [exit("left", "ledovec", 18, 11)],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Sněhová bouře — vítr fouká shora dolů.",
};

const iglutop: Room = {
  id: "iglutop",
  name: "Iglú na vrcholku",
  palette: "arctic",
  tiles: [
    ".........H..........",
    ".........H..........",
    ".........H..........",
    "........=H===.......",
    ".........H..........",
    "......===H=====.....",
    "....................",
    "....================",
    "....................",
    "..H..............H..",
    "..H..============H..",
    "..H..............H..",
    "..H..............H..",
    "########..##########",
  ],
  guardians: [v("snowwind", 9, 3, 12, 0.9), h("polarbear", 1, 1, 18, 0.6)],
  items: [i("medal", 9, 2, "it-m1"), i("crystal", 1, 6, "it-c1"), i("crystal", 17, 6, "it-c2"), i("flag", 9, 9, "it-fl")],
  exits: [exit("top", "ledovec", 9, 12)],
  spawn: { x: 9 * TILE, y: 12 * TILE },
  hint: "Iglú na vrcholku — výhled na celý sever.",
};

const saneSladcen: Room = {
  id: "saneSladcen",
  name: "Saně tučňáků",
  palette: "arctic",
  tiles: [
    ".........H..........",
    ".........H..........",
    ".........H..........",
    ".........H..........",
    "..====...H..........",
    "........=H=.........",
    "....======..........",
    "....................",
    "..........====......",
    "....................",
    "............======..",
    "....................",
    "..............======",
    "####################",
  ],
  guardians: [h("seal", 1, 1, 18, 1.0), h("polarbear", 12, 1, 18, 0.7)],
  items: [i("flag", 1, 1, "ss-fl"), i("medal", 9, 6, "ss-m1"), i("fish", 18, 9, "ss-f1"), i("crystal", 18, 12, "ss-c1")],
  exits: [exit("top", "snehovaBoure", 9, 12)],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Saně tučňáků — sjezd zleva doprava dolů.",
};

// =============================================================================
// Cluster: Tučňáčí katedrála (5 místností, palette emperor) — vstup z vrchol.top
// =============================================================================

const katedra: Room = {
  id: "katedra",
  name: "Katedrála",
  palette: "emperor",
  tiles: [
    ".........H..........",
    ".........H..........",
    "..=======H======....",
    ".........H..........",
    "...####..H.####.....",
    "........=H=.........",
    "..H..............H..",
    "..H..............H..",
    "..H...========...H..",
    "..H.....=H=......H..",
    "..H......H.......H..",
    "..H......H.......H..",
    ".........H..........",
    "########..##########",
  ],
  guardians: [h("petrel", 5, 1, 18, 0.9), v("walrus", 9, 6, 11, 0.5)],
  items: [i("crystal", 9, 1, "kat-c1"), i("medal", 4, 3, "kat-m1"), i("medal", 14, 3, "kat-m2")],
  exits: [
    exit("left", "vrchol", 18, 12),
    exit("right", "vez", 1, 11),
    exit("bottom", "chor", 9, 1),
    exit("top", "klenotnice", 9, 12),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Katedrála — chór dole, věž napravo.",
};

const chor: Room = {
  id: "chor",
  name: "Chór",
  palette: "emperor",
  tiles: [
    ".........H..........",
    ".........H..........",
    "..=======H======....",
    ".........H..........",
    "....=====H==========",
    "........=H=.........",
    "..==============....",
    "....................",
    "....................",
    "..==============....",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("petrel", 1, 1, 14, 1.0), h("petrel", 5, 1, 18, 0.8)],
  items: [i("flag", 9, 1, "cho-fl"), i("medal", 1, 5, "cho-m1"), i("fish", 18, 5, "cho-f1"), i("crystal", 9, 8, "cho-c1")],
  exits: [exit("top", "katedra", 9, 12)],
  spawn: { x: 9 * TILE, y: 12 * TILE },
  hint: "Chór — kostelní zpěv mezi plošinami.",
};

const vez: Room = {
  id: "vez",
  name: "Zvonice",
  palette: "emperor",
  tiles: [
    "....................",
    "..H.................",
    "..H.................",
    "..H.....======......",
    "..H.................",
    "..H.................",
    "..H........====.....",
    "..H.................",
    "..H.................",
    "..H..====...........",
    "..H.................",
    "..H.................",
    "..H.................",
    "####################",
  ],
  guardians: [v("petrel", 9, 1, 12, 1.0), v("snowwind", 14, 1, 12, 0.7)],
  items: [i("medal", 9, 0, "vez-m1"), i("crystal", 14, 5, "vez-c1"), i("flag", 5, 8, "vez-fl"), i("fish", 18, 12, "vez-f1")],
  exits: [exit("left", "katedra", 18, 11)],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Zvonice — vyšplhej po žebříku k zvonům.",
};

const oltarKatedraly: Room = {
  id: "oltarKatedraly",
  name: "Oltář katedrály",
  palette: "emperor",
  tiles: [
    "....................",
    "....................",
    "....................",
    "....================",
    "....................",
    "....................",
    "..======......======",
    "....................",
    "....................",
    "....================",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("walrus", 4, 1, 14, 0.5), s("crystal", 9, 7)],
  items: [i("heart", 9, 2, "olk-h1"), i("medal", 1, 5, "olk-m1"), i("medal", 18, 5, "olk-m2"), i("crystal", 9, 8, "olk-c1")],
  exits: [exit("right", "vez", 1, 12)],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Oltář katedrály — sebrat srdce.",
};

const klenotnice: Room = {
  id: "klenotnice",
  name: "Klenotnice",
  palette: "emperor",
  tiles: [
    "....................",
    "....................",
    "..==============....",
    "....................",
    "....####....####....",
    "....................",
    "....================",
    "....................",
    "....####....####....",
    "........=H=.........",
    "....=====H==========",
    ".........H..........",
    ".........H..........",
    "####################",
  ],
  guardians: [s("crystal", 5, 4), s("crystal", 14, 4), s("crystal", 5, 8), s("crystal", 14, 8), h("petrel", 1, 1, 14, 0.9)],
  items: [i("medal", 1, 1, "kl-m1"), i("medal", 18, 1, "kl-m2"), i("crystal", 9, 5, "kl-c1"), i("flag", 9, 9, "kl-fl"), i("heart", 9, 12, "kl-h1")],
  exits: [exit("bottom", "katedra", 9, 1)],
  spawn: { x: 9 * TILE, y: 1 * TILE },
  hint: "Klenotnice — krystaly v každém rohu.",
};

// =============================================================================
// Cluster: Magellan (5 místností, palette magellan) — vstup z kalejdoskop.right
// =============================================================================

const magArchipelag: Room = {
  id: "magArchipelag",
  name: "Magellanův archipelag",
  palette: "magellan",
  tiles: [
    ".........H..........",
    ".........H..........",
    "..==..==.H==..==....",
    ".........H..........",
    ".........H..........",
    "..==..===H==..==....",
    "....................",
    "....................",
    "..H..............H..",
    "..H..====H=.====.H..",
    "..H......H.......H..",
    "..H......H.......H..",
    ".........H..........",
    "########..##########",
  ],
  guardians: [h("seal", 5, 1, 18, 0.9), h("petrel", 8, 1, 18, 1.0)],
  items: [i("flag", 1, 1, "ma1-fl"), i("flag", 18, 1, "ma1-fl2"), i("medal", 9, 9, "ma1-m1")],
  exits: [
    exit("left", "kalejdoskop", 18, 11),
    exit("right", "magBouracky", 1, 11),
    exit("bottom", "magUniky", 9, 1),
    exit("top", "magPosledni", 9, 12),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Magellanův archipelag — křižovatka, vede do tří dalších míst.",
};

const magBouracky: Room = {
  id: "magBouracky",
  name: "Bouračky",
  palette: "magellan",
  tiles: [
    "....................",
    "....................",
    "....................",
    "..==......==......==",
    "....................",
    "....................",
    "==......==......==..",
    "....................",
    "....................",
    "..==......==......==",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("petrel", 5, 1, 18, 1.1), h("seal", 8, 1, 18, 0.9)],
  items: [i("fish", 9, 2, "mb-f1"), i("medal", 1, 5, "mb-m1"), i("crystal", 18, 5, "mb-c1"), i("flag", 9, 8, "mb-fl"), i("fish", 9, 12, "mb-f2")],
  exits: [exit("left", "magArchipelag", 18, 11)],
  spawn: { x: 18 * TILE, y: 12 * TILE },
  hint: "Bouračky — šachovnice plošin, skoč přesně.",
};

const magUniky: Room = {
  id: "magUniky",
  name: "Mořské úniky",
  palette: "magellan",
  tiles: [
    ".........H..........",
    ".........H..........",
    "....=====H==========",
    ".........H..........",
    ".........H..........",
    "=========H======....",
    "....................",
    "....................",
    "....================",
    "....................",
    "..~~~~~~~~~~~~~~~~..",
    "..~~~~~~~~~~~~~~~~..",
    "....................",
    "####################",
  ],
  guardians: [h("seal", 4, 1, 17, 0.9), h("bubble", 1, 10, 17, 0.5)],
  items: [i("fish", 9, 1, "mu-f1"), i("medal", 1, 4, "mu-m1"), i("medal", 18, 7, "mu-m2"), i("heart", 9, 12, "mu-h1")],
  exits: [exit("top", "magArchipelag", 9, 12)],
  spawn: { x: 9 * TILE, y: 12 * TILE },
  hint: "Mořské úniky — voda dole, neskákej.",
};

const magOstroh: Room = {
  id: "magOstroh",
  name: "Magellanův ostroh",
  palette: "magellan",
  tiles: [
    "....................",
    "....................",
    "....................",
    "...####....####.....",
    "....................",
    "....................",
    "..==============....",
    "....................",
    "....................",
    "....####....####....",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("polarbear", 4, 1, 17, 0.7), h("petrel", 7, 1, 18, 1.0)],
  items: [i("flag", 9, 1, "mo-fl"), i("fish", 1, 5, "mo-f1"), i("fish", 18, 5, "mo-f2"), i("medal", 9, 8, "mo-m1"), i("crystal", 9, 12, "mo-c1")],
  exits: [exit("right", "magBouracky", 1, 12)],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Magellanův ostroh — pevný kus země.",
};

const magPosledni: Room = {
  id: "magPosledni",
  name: "Poslední maják",
  palette: "magellan",
  tiles: [
    "....................",
    "....................",
    "..==============....",
    "....................",
    "....####....####....",
    "....................",
    "....================",
    "....................",
    "....####....####....",
    "........=H=.........",
    "....=====H==========",
    ".........H..........",
    ".........H..........",
    "####################",
  ],
  guardians: [h("petrel", 1, 1, 14, 0.9), v("walrus", 9, 5, 11, 0.5), s("crystal", 9, 7)],
  items: [i("medal", 9, 1, "mp-m1"), i("heart", 1, 4, "mp-h1"), i("medal", 18, 4, "mp-m2"), i("flag", 9, 9, "mp-fl"), i("crystal", 9, 12, "mp-c1")],
  exits: [exit("bottom", "magArchipelag", 9, 1)],
  spawn: { x: 9 * TILE, y: 1 * TILE },
  hint: "Poslední maják — vrchol mapy, all you can collect.",
};

export const EXTRA_ROOMS_2: Room[] = [
  // Run 019: Aurora
  aurora1, auroraZarka, auroraOltar, auroraKomin, auroraOblak,
  // Run 020: Vrak
  vrak2, pristav, prazdnaSelma, rezavyKormidlnik, pokladVraku,
  // Run 021: Tropický ostrov
  palma, ananas, liana, tropPlazh, dzungle,
  // Run 022: Severní pól
  ledovec, polarniDen, snehovaBoure, iglutop, saneSladcen,
  // Run 023: Tučňáčí katedrála
  katedra, chor, vez, oltarKatedraly, klenotnice,
  // Run 024: Magellan
  magArchipelag, magBouracky, magUniky, magOstroh, magPosledni,
];
