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
    ".........H..........",
    ".........H..........",
    ".........H..........",
    ".....====H===.......",
    ".........H..........",
    ".====....H.....=====",
    ".........H..........",
    ".........H..........",
    ".H.......H......H...",
    ".H..=====H......H...",
    ".H.......H......H...",
    ".H.......H......H...",
    ".H..=====H====..H...",
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
    i("chick", 9, 12, "kan-ch1"),
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
    exit("left", "kryostat", 18, 12),
  ],
  spawn: { x: 18 * TILE, y: 12 * TILE },
  hint: "Spárna — police plné zásob, vlevo kryostat.",
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
    i("chick", 10, 12, "obs-ch1"),
  ],
  exits: [
    exit("left", "stanice2", 18, 11),
    exit("right", "kryostat", 1, 12),
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
    ".........H..........",
    ".........H..........",
    ".........H..........",
    "..=======H======....",
    ".........H..........",
    "..**.....H......**..",
    ".........H..........",
    "....=====H..........",
    ".........H..........",
    "..==.....H....==....",
    ".........H..........",
    ".........H..........",
    ".........H..........",
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
    exit("left", "observatorium", 18, 12),
    exit("right", "sparna", 1, 12),
  ],
  spawn: { x: 9 * TILE, y: 12 * TILE },
  hint: "Mrazicí komora. Žlutý klíč otevírá Skok do dálky.",
};

// =============================================================================
// Cluster: Pingvíní akademie (5 místností, palette candy)
// Vstup zleva ze skolka.right → trida → knihovna/telocvicna → drilovaciRampa → reditelna (red key)
// =============================================================================

const trida: Room = {
  id: "trida",
  name: "Třída",
  palette: "candy",
  tiles: [
    "....................",
    "....................",
    "..==============....",
    "....................",
    "....................",
    ".===.....====.......",
    "....................",
    "..H.................",
    "..H..====..====.....",
    "..H.................",
    "..H.................",
    "..H.................",
    "....................",
    "##########..########",
  ],
  guardians: [h("seal", 5, 4, 14, 0.7), v("snowwind", 11, 5, 12, 0.6)],
  items: [
    i("egg", 3, 1, "tri-e1"),
    i("fish", 12, 4, "tri-f1"),
    i("medal", 15, 7, "tri-m1"),
    i("chick", 17, 12, "tri-c1"),
  ],
  exits: [
    exit("left", "skolka", 18, 11),
    exit("right", "knihovna", 1, 11),
    exit("bottom", "telocvicna", 10, 1),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Třída — sběr vajec a první mládě. Doprava do knihovny, dolů do tělocvičny.",
};

const knihovna: Room = {
  id: "knihovna",
  name: "Knihovna",
  palette: "candy",
  tiles: [
    "....................",
    "....................",
    "..####..####..####..",
    "....................",
    "..####..####..####..",
    "....................",
    "..####..####..####..",
    "....................",
    "..####..####..####..",
    "....................",
    "..####..####..####..",
    "....................",
    "....................",
    "##########..########",
  ],
  guardians: [h("petrel", 9, 1, 18, 0.9), h("petrel", 11, 1, 18, 0.7)],
  items: [
    i("medal", 1, 1, "kn-m1"),
    i("medal", 18, 1, "kn-m2"),
    i("crystal", 9, 5, "kn-c1"),
    i("flag", 9, 11, "kn-fl"),
    i("fish", 1, 11, "kn-f1"),
    i("chick", 1, 11, "kn-ch1"),
  ],
  exits: [
    exit("left", "trida", 18, 11),
    exit("right", "drilovaciRampa", 1, 11),
    exit("bottom", "telocvicna", 10, 1),
  ],
  spawn: { x: 1 * TILE, y: 11 * TILE },
  hint: "Knihovna — slalom mezi policemi, dolů do tělocvičny.",
};

const telocvicna: Room = {
  id: "telocvicna",
  name: "Tělocvična",
  palette: "candy",
  tiles: [
    "..........H.........",
    "..........H.........",
    "....======H=========",
    "..........H.........",
    "..........H.........",
    "==========H=====....",
    "..........H.........",
    "..........H.........",
    "..H.......H......H..",
    "..H.......H......H..",
    "..H..=====H======H..",
    "..H.......H......H..",
    "..H..CCCCCHCCCC..H..",
    "####################",
  ],
  guardians: [h("seal", 4, 5, 17, 1.0), h("skua", 7, 1, 18, 0.8)],
  items: [
    i("fish", 18, 1, "te-f1"),
    i("fish", 1, 4, "te-f2"),
    i("medal", 9, 9, "te-m1"),
    i("heart", 10, 12, "te-h1"),
  ],
  exits: [
    exit("top", "trida", 10, 12),
    exit("left", "reditelna", 18, 12),
    exit("right", "knihovna", 1, 11),
  ],
  spawn: { x: 10 * TILE, y: 12 * TILE },
  hint: "Tělocvična — žebříky nahoru, vlevo ředitelna, vpravo knihovna.",
};

const drilovaciRampa: Room = {
  id: "drilovaciRampa",
  name: "Drilovací rampa",
  palette: "candy",
  tiles: [
    "....................",
    "....................",
    "..==................",
    "...*................",
    "....==..............",
    ".....*..............",
    "......==............",
    ".......*............",
    "........==..........",
    ".........*..........",
    "..........====......",
    "....................",
    ".cccccccccccccccccc.",
    "####################",
  ],
  guardians: [h("polarbear", 12, 11, 17, 0.6)],
  items: [
    i("fish", 4, 1, "dr-f1"),
    i("fish", 14, 9, "dr-f2"),
    i("crystal", 17, 12, "dr-c1"),
  ],
  exits: [
    exit("left", "knihovna", 18, 11),
    exit("right", "reditelna", 1, 12),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Drilovací rampa — pozor na bodce pod každou plošinou.",
};

const reditelna: Room = {
  id: "reditelna",
  name: "Ředitelna",
  palette: "candy",
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
    "....................",
    "....................",
    "..==============....",
    "....................",
    "####################",
  ],
  guardians: [v("walrus", 9, 6, 10, 0.5), h("petrel", 4, 2, 17, 0.9)],
  items: [
    i("heart", 1, 4, "re-h1"),
    key("red", 9, 1, "re-key"),
    i("medal", 17, 6, "re-m1"),
    i("crystal", 9, 10, "re-c1"),
  ],
  exits: [
    exit("left", "drilovaciRampa", 18, 12),
    exit("right", "telocvicna", 1, 12),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Ředitelna — červený klíč otevírá Hokej.",
};

// =============================================================================
// Cluster: Hluboká jeskyně (5 místností, palette cave)
// Vstup shora z labyrinth.bottom → prepad → 4 vedlejší (stalaktity, rybnik, chodba, pokladnice)
// =============================================================================

const prepad: Room = {
  id: "prepad",
  name: "Propad",
  palette: "cave",
  tiles: [
    ".........H..........",
    ".........H..........",
    ".........H..........",
    ".......==H===.......",
    ".........H..........",
    ".........H..........",
    ".==......H.......==.",
    ".........H..........",
    ".........H..........",
    "..H......H.......H..",
    "..H...===H====...H..",
    "..H......H.......H..",
    "..H......H.......H..",
    "########..##########",
  ],
  guardians: [v("icicle", 7, 0, 5, 0.8), v("icicle", 13, 0, 5, 0.8)],
  items: [
    i("crystal", 9, 2, "pre-c1"),
    i("fish", 2, 5, "pre-f1"),
    i("fish", 17, 5, "pre-f2"),
    i("medal", 9, 9, "pre-m1"),
    i("chick", 9, 11, "pre-ch1"),
  ],
  exits: [
    exit("top", "labyrinth", 9, 12),
    exit("left", "stalaktity", 18, 12),
    exit("right", "temnaChodba", 1, 12),
    exit("bottom", "podzemniRybnik", 9, 1),
  ],
  spawn: { x: 9 * TILE, y: 1 * TILE },
  hint: "Propad — křižovatka jeskyně. Klíč najdeš dole v rybníce.",
};

const stalaktity: Room = {
  id: "stalaktity",
  name: "Stalaktity",
  palette: "cave",
  tiles: [
    "....................",
    ".*..*..*..*..*..*..*",
    "....................",
    "....................",
    "..====..====..====..",
    "....................",
    "....................",
    "..====..====..====..",
    "....................",
    "....................",
    "..====..====..====..",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [v("icicle", 9, 1, 11, 1.0), h("petrel", 6, 1, 18, 0.9)],
  items: [
    i("crystal", 4, 3, "st-c1"),
    i("crystal", 14, 6, "st-c2"),
    i("medal", 9, 9, "st-m1"),
    i("fish", 1, 12, "st-f1"),
  ],
  exits: [
    exit("right", "prepad", 1, 12),
    exit("left", "pokladnice", 18, 12),
  ],
  spawn: { x: 18 * TILE, y: 12 * TILE },
  hint: "Stalaktity — bodce ze stropu, plošiny mezi.",
};

const temnaChodba: Room = {
  id: "temnaChodba",
  name: "Temná chodba",
  palette: "cave",
  tiles: [
    "....................",
    "..H.................",
    "..H.................",
    "..H..============...",
    "..H.................",
    "..H.................",
    "..H..============...",
    "..H.................",
    "..H.................",
    "..H..============...",
    "..H.................",
    "..H.................",
    "..H.................",
    "####################",
  ],
  guardians: [h("polarbear", 5, 4, 17, 0.9), h("polarbear", 11, 4, 17, 0.7)],
  items: [
    i("fish", 18, 2, "tch-f1"),
    i("fish", 18, 5, "tch-f2"),
    i("fish", 18, 8, "tch-f3"),
    i("crystal", 18, 12, "tch-c1"),
    i("medal", 1, 0, "tch-m1"),
  ],
  exits: [
    exit("left", "prepad", 18, 12),
    exit("right", "podzemniRybnik", 1, 12),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Temná chodba — dlouhý žebřík, sběr ryb.",
};

const podzemniRybnik: Room = {
  id: "podzemniRybnik",
  name: "Podzemní rybník",
  palette: "ocean",
  tiles: [
    ".........H..........",
    ".........H..........",
    ".........H..........",
    "..====...H....====..",
    ".........H..........",
    ".........H..........",
    ".........H..........",
    "..~~~~~~~H~~~~~~~~..",
    "..~~~~~~~H~~~~~~~~..",
    "..~~~~~~~H~~~~~~~~..",
    "..~~~~~~~H~~~~~~~~..",
    "..~~~~~~~H~~~~~~~~..",
    ".........H..........",
    "####################",
  ],
  guardians: [h("bubble", 8, 2, 18, 0.8), v("bubble", 5, 7, 11, 0.6)],
  items: [
    i("fish", 3, 2, "ryb-f1"),
    i("fish", 16, 2, "ryb-f2"),
    key("green", 9, 5, "ryb-key"),
    i("heart", 9, 12, "ryb-h1"),
  ],
  exits: [
    exit("top", "prepad", 9, 12),
    exit("left", "temnaChodba", 18, 12),
    exit("right", "pokladnice", 1, 12),
  ],
  spawn: { x: 9 * TILE, y: 12 * TILE },
  hint: "Rybník — zelený klíč otevírá Potápění.",
};

const pokladnice: Room = {
  id: "pokladnice",
  name: "Pokladnice",
  palette: "cave",
  tiles: [
    "....................",
    "....................",
    "..==============....",
    "....................",
    "...####....####.....",
    "....................",
    "....................",
    "....================",
    "....................",
    "....####....####....",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("polarbear", 1, 1, 13, 0.6), s("crystal", 9, 12)],
  items: [
    i("medal", 4, 1, "pkl-m1"),
    i("medal", 14, 1, "pkl-m2"),
    i("flag", 9, 6, "pkl-fl"),
    i("heart", 4, 8, "pkl-h1"),
    i("crystal", 14, 8, "pkl-c1"),
  ],
  exits: [
    exit("left", "podzemniRybnik", 18, 12),
    exit("right", "stalaktity", 1, 12),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Pokladnice — bohatství i past medvěda.",
};

// =============================================================================
// Cluster: Ostrov ohně (5 místností, palette sunset)
// Vstup zprava ze sopka.right → kraterUst → 4 vedlejší (lavoveJezirko, popelinka, horkyKamen, cervenyKamen)
// =============================================================================

const kraterUst: Room = {
  id: "kraterUst",
  name: "Ústí kráteru",
  palette: "sunset",
  tiles: [
    ".........H..........",
    ".........H..........",
    ".........H..........",
    ".........H..........",
    "....=====H==========",
    ".........H..........",
    ".........H..........",
    "=========H======....",
    ".........H..........",
    "..H......H.......H..",
    "..H......H.......H..",
    "..H..====H...====H..",
    "..H......H.......H..",
    "########..##########",
  ],
  guardians: [v("crystal", 5, 0, 7, 0), h("petrel", 6, 1, 17, 0.9)],
  items: [
    i("fish", 18, 3, "krat-f1"),
    i("fish", 1, 6, "krat-f2"),
    i("medal", 9, 11, "krat-m1"),
  ],
  exits: [
    exit("left", "sopka", 18, 12),
    exit("right", "horkyKamen", 1, 11),
    exit("bottom", "lavoveJezirko", 9, 1),
    exit("top", "popelinka", 9, 12),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Ústí kráteru — křižovatka, vede do tří dalších částí ostrova.",
};

const lavoveJezirko: Room = {
  id: "lavoveJezirko",
  name: "Lávové jezírko",
  palette: "sunset",
  tiles: [
    ".........H..........",
    ".........H..........",
    "....=====H==========",
    ".........H..........",
    "..======.H..........",
    ".........H..........",
    ".........H......====",
    ".........H..........",
    "..======.H..........",
    ".........H..........",
    "..~~~~~~~H~~~~~~~~..",
    "..~~~~~~~H~~~~~~~~..",
    ".........H..........",
    "####################",
  ],
  guardians: [h("petrel", 1, 4, 17, 1.0), v("bubble", 18, 10, 11, 0.5)],
  items: [
    i("fish", 9, 1, "lj-f1"),
    i("crystal", 17, 5, "lj-c1"),
    i("medal", 1, 7, "lj-m1"),
    i("heart", 9, 12, "lj-h1"),
  ],
  exits: [
    exit("top", "kraterUst", 9, 12),
    exit("left", "popelinka", 18, 12),
    exit("right", "cervenyKamen", 1, 12),
  ],
  spawn: { x: 9 * TILE, y: 12 * TILE },
  hint: "Lávové jezírko — voda hoří, neskákej dolů.",
};

const popelinka: Room = {
  id: "popelinka",
  name: "Popelínka",
  palette: "sunset",
  tiles: [
    "....................",
    "....................",
    "..**..**..**..**....",
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
    "########..##########",
  ],
  guardians: [h("seal", 6, 1, 18, 0.9)],
  items: [
    i("flag", 1, 1, "po-fl"),
    i("crystal", 18, 1, "po-c1"),
    i("fish", 9, 6, "po-f1"),
    i("medal", 9, 9, "po-m1"),
  ],
  exits: [
    exit("bottom", "kraterUst", 9, 1),
    exit("left", "cervenyKamen", 18, 12),
    exit("right", "lavoveJezirko", 1, 12),
  ],
  spawn: { x: 9 * TILE, y: 1 * TILE },
  hint: "Popelínka — houpačka přenese tě nad bodci.",
  movers: [
    { kind: "swing", x: 2 * TILE, y: 6 * TILE, w: 48, h: 6, minX: 1 * TILE, maxX: 16 * TILE, vx: 0.9 },
  ],
};

const horkyKamen: Room = {
  id: "horkyKamen",
  name: "Horký kámen",
  palette: "sunset",
  tiles: [
    "....................",
    "....................",
    "....................",
    "..==..............==",
    "....................",
    "..======......======",
    "....................",
    "....................",
    "..==..====..====..==",
    "....................",
    "....................",
    "..======......======",
    "....................",
    "####################",
  ],
  guardians: [h("polarbear", 1, 1, 18, 1.0), v("crystal", 9, 4, 11, 0)],
  items: [
    i("fish", 9, 2, "hk-f1"),
    i("crystal", 9, 7, "hk-c1"),
    i("medal", 1, 12, "hk-m1"),
  ],
  exits: [
    exit("left", "kraterUst", 18, 11),
    exit("right", "cervenyKamen", 1, 11),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Horký kámen — průchod doprava ke krvavému kameni.",
};

const cervenyKamen: Room = {
  id: "cervenyKamen",
  name: "Červený kámen",
  palette: "sunset",
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
    "....................",
    "....................",
    "..==============....",
    "....................",
    "####################",
  ],
  guardians: [v("walrus", 10, 6, 10, 0.6), h("skua", 1, 1, 17, 0.9)],
  items: [
    i("heart", 17, 4, "ck-h1"),
    key("blue", 9, 1, "ck-key"),
    i("medal", 1, 6, "ck-m1"),
    i("crystal", 9, 10, "ck-c1"),
  ],
  exits: [
    exit("left", "horkyKamen", 18, 12),
    exit("right", "popelinka", 1, 12),
  ],
  spawn: { x: 1 * TILE, y: 12 * TILE },
  hint: "Červený kámen — modrý klíč otevírá Lyžování.",
};

export const EXTRA_ROOMS: Room[] = [
  // Sprint 006 Run 017: Antarktická základna
  stanice2, kantyna, sparna, observatorium, kryostat,
  // Sprint 006 Run 018: Pingvíní akademie
  trida, knihovna, telocvicna, drilovaciRampa, reditelna,
  // Sprint 006 Run 018: Hluboká jeskyně
  prepad, stalaktity, temnaChodba, podzemniRybnik, pokladnice,
  // Sprint 006 Run 018: Ostrov ohně
  kraterUst, lavoveJezirko, popelinka, horkyKamen, cervenyKamen,
];
