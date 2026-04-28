// Sprint 006 expansion: Antarktická vědecká základna (1. várka, 5 místností).
// Propojeno přes existující "stanice" → bottom exit → "stanice2" (hub).
// Z hubu se pak rozvětvuje na kantyna, observatorium, kryostat (klíč) a sparna.

import type { Exit, Guardian, Item, KeyColor, Room } from "./types";
import { TILE } from "./types";

function h(sprite: Guardian["sprite"], y: number, minX: number, maxX: number, vx = 0.6, w = 20, hSize = 16): Guardian {
  return {
    kind: "horiz", sprite,
    x: minX * TILE,
    y: y * TILE + (TILE - hSize),
    w, h: hSize,
    minX: minX * TILE,
    maxX: (maxX + 1) * TILE - w,
    vx,
  };
}
function v(sprite: Guardian["sprite"], x: number, minY: number, maxY: number, vy = 0.6, w = 16, hSize = 16): Guardian {
  return {
    kind: "vert", sprite,
    x: x * TILE + (TILE - w) / 2,
    y: minY * TILE,
    w, h: hSize,
    minY: minY * TILE,
    maxY: (maxY + 1) * TILE - hSize,
    vy,
  };
}
function s(sprite: Guardian["sprite"], x: number, y: number, w = 16, hSize = 16): Guardian {
  return { kind: "static", sprite, x: x * TILE, y: y * TILE, w, h: hSize };
}
function i(kind: Item["kind"], x: number, y: number, id: string): Item {
  return { kind, x, y, id };
}
function key(color: KeyColor, x: number, y: number, id: string): Item {
  return { kind: "key", x, y, id, keyColor: color };
}
function exit(side: Exit["side"], toRoom: string, toX?: number, toY?: number): Exit {
  return { side, toRoom, toX, toY };
}

// stanice2 — hub. Top entry ze stanice (drop), exits left/right/bottom.
const stanice2: Room = {
  id: "stanice2",
  name: "Polární kupole",
  palette: "lab",
  tiles: [
    "....................",
    "....................",
    "....................",
    ".....========.......",
    "....................",
    ".====..........=====",
    "....................",
    "....................",
    ".H..............H...",
    ".H..======......H...",
    ".H..............H...",
    ".H..............H...",
    ".H..==========..H...",
    "########..##########",
  ],
  guardians: [
    v("snowwind", 9, 3, 12, 0.9),
    h("petrel", 7, 2, 17, 0.7),
  ],
  items: [
    i("fish", 8, 2, "s2-f1"),
    i("flag", 18, 4, "s2-fl"),
    i("medal", 4, 12, "s2-m1"),
  ],
  exits: [
    exit("top", "stanice", 9, 12),
    exit("left", "kantyna", 18, 11),
    exit("right", "observatorium", 1, 11),
    exit("bottom", "kryostat", 9, 1),
  ],
  spawn: { x: 9 * TILE, y: 1 * TILE },
  hint: "Polární kupole — křižovatka. Klíč najdeš dole v kryostatu.",
};

// kantyna — jídelna, conveyor + ryby. Levé od stanice2.
const kantyna: Room = {
  id: "kantyna",
  name: "Kantýna",
  palette: "lab",
  tiles: [
    "....................",
    "....................",
    "..==============....",
    "....................",
    "..####..............",
    "....................",
    "..======............",
    "....................",
    "............====....",
    "....................",
    "..====..............",
    "....................",
    "............CCCCCCCC",
    "####################",
  ],
  guardians: [
    h("skua", 12, 8, 18, 0.9),
    h("petrel", 6, 2, 7, 0.6),
  ],
  items: [
    i("fish", 4, 1, "kan-f1"),
    i("fish", 16, 11, "kan-f2"),
    i("heart", 14, 7, "kan-h1"),
    i("medal", 3, 9, "kan-m1"),
  ],
  exits: [
    exit("right", "stanice2", 1, 11),
    exit("left", "sparna", 18, 11),
  ],
  spawn: { x: 18 * TILE, y: 11 * TILE },
  hint: "Kuchyně tučňáků. Pásový dopravník vlevo dolů.",
};

// sparna — sklad zásob, dead-end nalevo od kantyna.
const sparna: Room = {
  id: "sparna",
  name: "Spárna",
  palette: "lab",
  tiles: [
    "....................",
    "....................",
    "...####....####.....",
    "....................",
    "...====....====.....",
    "....................",
    "...####....####.....",
    "....................",
    "...====....====.....",
    "....................",
    "...####....####.....",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [
    v("snowwind", 4, 2, 11, 0.7),
    v("snowwind", 12, 2, 11, 0.7),
  ],
  items: [
    i("fish", 4, 1, "spa-f1"),
    i("fish", 13, 1, "spa-f2"),
    i("egg", 8, 5, "spa-e1"),
    i("egg", 8, 9, "spa-e2"),
    i("crystal", 17, 12, "spa-c1"),
  ],
  exits: [
    exit("right", "kantyna", 1, 11),
  ],
  spawn: { x: 18 * TILE, y: 12 * TILE },
  hint: "Spárna — police plné zásob. Dead-end, sbírej a vrať se.",
};

// observatorium — dalekohledy a hvězdy. Vpravo od stanice2.
const observatorium: Room = {
  id: "observatorium",
  name: "Observatorium",
  palette: "night",
  tiles: [
    "....................",
    "....................",
    "....................",
    ".......*....*.......",
    "....................",
    ".======......======.",
    "....................",
    "...*..............*.",
    "....................",
    "..H..............H..",
    "..H..============H..",
    "..H..............H..",
    "..H..............H..",
    "####################",
  ],
  guardians: [
    h("petrel", 4, 1, 18, 1.0),
    v("snowwind", 10, 5, 12, 0.8),
  ],
  items: [
    i("medal", 10, 4, "obs-m1"),
    i("crystal", 3, 4, "obs-c1"),
    i("crystal", 16, 4, "obs-c2"),
    i("flag", 10, 12, "obs-fl"),
  ],
  exits: [
    exit("left", "stanice2", 18, 11),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Hvězdná obloha. Pozor na padající krystaly.",
};

// kryostat — kryogenní lab, žlutý klíč. Pod stanice2.
const kryostat: Room = {
  id: "kryostat",
  name: "Kryostat",
  palette: "ice",
  tiles: [
    "....................",
    "....................",
    "....................",
    "..==============....",
    "....................",
    "..**............**..",
    "....................",
    "....======..........",
    "....................",
    "..==..........==....",
    "....................",
    "....................",
    "....................",
    "##########****######",
  ],
  guardians: [
    h("walrus", 12, 4, 14, 0.5),
    s("crystal", 4, 12),
    s("crystal", 15, 12),
  ],
  items: [
    i("heart", 10, 2, "kry-h1"),
    key("yellow", 10, 8, "kry-key"),
    i("fish", 3, 8, "kry-f1"),
    i("fish", 17, 8, "kry-f2"),
  ],
  exits: [
    exit("top", "stanice2", 9, 12),
  ],
  spawn: { x: 9 * TILE, y: 12 * TILE },
  hint: "Mrazicí komora. Žlutý klíč otevírá Skok do dálky.",
};

export const EXTRA_ROOMS: Room[] = [
  stanice2, kantyna, sparna, observatorium, kryostat,
];
