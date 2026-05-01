import type { Door, Exit, Guardian, Item, KeyColor, Room } from "./types";
import { TILE } from "./types";
import { EXTRA_ROOMS } from "./levels-extras";
import { EXTRA_ROOMS_2 } from "./levels-extras2";

// Helper builders ------------------------------------------------------------

function h(sprite: Guardian["sprite"], y: number, minX: number, maxX: number, vx = 0.6, w = 20, hSize = 16): Guardian {
  return {
    kind: "horiz",
    sprite,
    x: minX * TILE,
    y: y * TILE + (TILE - hSize),
    w,
    h: hSize,
    minX: minX * TILE,
    maxX: (maxX + 1) * TILE - w,
    vx,
  };
}
function v(sprite: Guardian["sprite"], x: number, minY: number, maxY: number, vy = 0.6, w = 16, hSize = 16): Guardian {
  return {
    kind: "vert",
    sprite,
    x: x * TILE + (TILE - w) / 2,
    y: minY * TILE,
    w,
    h: hSize,
    minY: minY * TILE,
    maxY: (maxY + 1) * TILE - hSize,
    vy,
  };
}
function d(sprite: Guardian["sprite"], x: number, y: number, minX: number, maxX: number, minY: number, maxY: number, vx = 0.5, vy = 0.5, w = 16, hSize = 16): Guardian {
  return {
    kind: "diag",
    sprite,
    x: x * TILE,
    y: y * TILE,
    w,
    h: hSize,
    minX: minX * TILE,
    maxX: (maxX + 1) * TILE - w,
    minY: minY * TILE,
    maxY: (maxY + 1) * TILE - hSize,
    vx,
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
function door(id: string, col: number, row: number, color: KeyColor): Door {
  return { id, col, row, color };
}
function exit(side: Exit["side"], toRoom: string, toX?: number, toY?: number): Exit {
  return { side, toRoom, toX, toY };
}

// Rooms ----------------------------------------------------------------------
// Grid: 20 cols × 14 rows. Legend:
//   . empty  | # solid | = jump-through platform | H ladder | ~ water | * spikes
//
// Audit rules:
//   * Every exit must have a real opening on that edge (no full wall blocks).
//   * Each A.side→B pair has a B.oppositeSide→A return pair.
//   * bottom/top exits need a gap in the floor/ceiling row for the player to fall through / climb out.

const iglu: Room = {
  id: "iglu",
  name: "Iglú",
  palette: "arctic",
  // Right wall removed in rows 10-11; floor extended to the right edge so the player walks out smoothly.
  tiles: [
    "....................",
    "....................",
    "...##############...",
    "...#............#...",
    "...#............#...",
    "...#............#...",
    "...#......H.....#...",
    "...#......H.....#...",
    "...#=====.H.....#...",
    "...#......H.....#...",
    ".........H..........",
    "....................",
    "####################",
    "####################",
  ],
  guardians: [],
  items: [i("fish", 5, 7, "iglu-f1")],
  exits: [
    exit("right", "zakladna", 1, 11),
    exit("left", "kuchyne", 18, 11),
  ],
  spawn: { x: 4 * TILE, y: 11 * TILE },
  hint: "Jet Set Pingu. Sesbírej všechno a vrať se sem.",
};

const zakladna: Room = {
  id: "zakladna",
  name: "Polární stanice",
  palette: "night",
  // Floor has a left-side segment for iglu return (row 12), top open.
  tiles: [
    "....................",
    "....................",
    "........========....",
    "....................",
    "...====.............",
    "...........====.....",
    "....................",
    "====................",
    ".................===",
    "....................",
    "......====..........",
    "............===.....",
    "....................",
    "######......########",
  ],
  guardians: [
    h("skua", 3, 0, 19, 0.8),
    d("petrel", 2, 1, 0, 19, 0, 11, 0.7, 0.4),
    h("polarbear", 12, 8, 18, 0.6, 22, 18),
  ],
  items: [
    i("fish", 10, 1, "zakladna-f1"),
    i("fish", 1, 6, "zakladna-f2"),
    i("medal", 5, 5, "zak-m1"),
    i("flag", 14, 8, "zak-fl"),

  ],
  exits: [
    exit("left", "iglu", 17, 11),
    exit("right", "kolonie", 1, 12),
    exit("top", "majak", 10, 12),
    exit("bottom", "tunelky", 8, 1),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
  doors: [door("zakladna-blue", 4, 12, "blue")],
  movers: [
    { kind: "lift", x: 10 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const kolonie: Room = {
  id: "kolonie",
  name: "Kolonie císařských",
  palette: "emperor",
  tiles: [
    "....................",
    "....................",
    "...==============...",
    "....................",
    "....................",
    "===============.....",
    "....................",
    "....................",
    ".....===========....",
    "....................",
    "....................",
    "..===============...",
    "....................",
    "#########..#########",
  ],
  guardians: [
    h("skua", 4, 2, 18, 1.0),
    h("skua", 10, 0, 14, -0.8),
    h("seal", 12, 3, 16, 0.6),
    s("snowwind", 9, 6),
  ],
  items: [
    i("egg", 9, 1, "kolonie-e1"),
    i("egg", 2, 4, "kolonie-e2"),
    i("fish", 17, 7, "kolonie-f1"),
    key("blue", 11, 7, "kolonie-key-blue"),
  ],
  exits: [
    exit("left", "zakladna", 18, 12),
    exit("right", "prusmyk", 1, 12),
    exit("top", "vejcohnizdo", 10, 12),
    exit("bottom", "ledovec", 9, 1),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
  hint: "Modrý klíč otevírá lyže.",
  movers: [
    { kind: "lift", x: 10 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const prusmyk: Room = {
  id: "prusmyk",
  name: "Ledovcový průsmyk",
  palette: "ice",
  // Side walls cleared on rows 11-12 so player can exit left/right. Top center gap for schody.
  tiles: [
    "..####..........####",
    "..####..........####",
    "..####..........####",
    "..####==========####",
    "..####..........####",
    "..####..........####",
    "..####==========####",
    "..####..........####",
    "..####..........####",
    "..####==========####",
    "..####..........####",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [
    v("icicle", 8, 0, 12, 1.2),
    v("icicle", 13, 0, 12, -1.1),
    v("icicle", 10, 0, 12, 0.9),
    h("walrus", 12, 6, 13, 0.5, 28, 18),
  ],
  items: [
    i("fish", 6, 3, "prusmyk-f1"),
    i("fish", 15, 9, "prusmyk-f2"),
    i("egg", 7, 8, "pru-e1"),

  ],
  exits: [
    exit("left", "kolonie", 18, 12),
    exit("right", "skaly", 3, 12),
    exit("top", "schody", 10, 12),
  ],
  spawn: { x: 8 * TILE, y: 12 * TILE },
  movers: [
    { kind: "lift", x: 10 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const skaly: Room = {
  id: "skaly",
  name: "Skalní útesy",
  palette: "sunset",
  // Side cliffs trimmed on rows 11-12 for exits. Floor is row 13.
  tiles: [
    "....................",
    "....................",
    "##..................",
    "##......##H#........",
    "##..................",
    "##..........####....",
    "##..................",
    "##................##",
    "##.####...........##",
    "##................##",
    "##..........####....",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [
    h("polarbear", 12, 3, 17, 1.2),
    d("skua", 10, 1, 5, 19, 1, 7, 0.6, 0.5),
  ],
  items: [
    i("egg", 5, 2, "skaly-e1"),
    i("fish", 11, 4, "skaly-f1"),
    i("medal", 6, 7, "skaly-m1"),
  ],
  exits: [
    exit("left", "prusmyk", 13, 12),
    exit("right", "more", 1, 5),
    exit("top", "hreben", 10, 12),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
  movers: [
    { kind: "lift", x: 10 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const more: Room = {
  id: "more",
  name: "Otevřené moře",
  palette: "ocean",
  // Floating ice chunks; left/right exits at row 5. Water = death below row 8.
  tiles: [
    "....................",
    "...==============...",
    "....................",
    "........===.........",
    "....................",
    "===...........======",
    "....................",
    "....===.............",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
  ],
  guardians: [
    h("walrus", 10, 0, 19, 1.6, 36, 20),
    h("bubble", 11, 0, 19, 0.8, 12, 12),
  ],
  items: [
    i("fish", 10, 2, "more-f1"),
    i("fish", 16, 4, "more-f2"),
    i("fish", 2, 6, "more-f3"),
    i("fish", 5, 10, "more-f-deep1"),
    i("fish", 14, 11, "more-f-deep2"),
  ],
  exits: [
    exit("left", "skaly", 18, 5),
    exit("right", "rybarska-dira", 1, 5),
  ],
  spawn: { x: 2 * TILE, y: 4 * TILE },
  hint: "Skoč do vody - tučňák plave a může lovit ryby.",
};

const rybarskaDira: Room = {
  id: "rybarska-dira",
  name: "Díra v ledu",
  palette: "ice",
  // Top 2 rows are solid ceiling, bottom row 12 water with 2 gaps to drop through to jeskyne.
  tiles: [
    "####################",
    "####################",
    "....................",
    "....................",
    "..####...######...##",
    "....................",
    "....................",
    "........####........",
    "....................",
    "....................",
    "..####..........####",
    "....................",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
  ],
  guardians: [
    v("bubble", 9, 6, 11, -0.9, 12, 12),
    v("bubble", 17, 6, 11, 0.8, 12, 12),
    h("petrel", 5, 2, 18, 0.7),
  ],
  items: [
    i("fish", 3, 3, "dira-f1"),
    i("fish", 10, 6, "dira-f2"),
    i("fish", 15, 9, "dira-f3"),
    key("green", 9, 3, "dira-key-green"),
  ],
  exits: [
    exit("left", "more", 18, 5),
    exit("right", "galapagos", 1, 10),
    exit("bottom", "jeskyne", 10, 2),
  ],
  spawn: { x: 2 * TILE, y: 3 * TILE },
  hint: "Zelený klíč k potápění.",
};

const galapagos: Room = {
  id: "galapagos",
  name: "Galapágy",
  palette: "galapagos",
  tiles: [
    "....................",
    "....................",
    "....................",
    "........====........",
    "....................",
    "..====..............",
    "...............====.",
    "....................",
    "..........====......",
    "....................",
    "====..........======",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [
    h("seal", 12, 2, 17, 0.7),
    d("petrel", 3, 2, 0, 19, 1, 9, 0.6, 0.4),
  ],
  items: [
    i("fish", 9, 2, "gala-f1"),
    i("egg", 15, 5, "gala-e1"),
    i("flag", 2, 9, "gala-fl"),
  ],
  exits: [
    exit("left", "rybarska-dira", 15, 11),
    exit("right", "vrak", 5, 11),
    exit("top", "sopka", 10, 12),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
  doors: [door("galapagos-green", 11, 12, "green")],
  movers: [
    { kind: "lift", x: 10 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const jeskyne: Room = {
  id: "jeskyne",
  name: "Ledová jeskyně",
  palette: "cave",
  // Side walls removed on rows 11-12 (below ladders/platforms). Top has ceiling with center hole for rybarska-dira return.
  tiles: [
    "##########H#########",
    "....................",
    "....................",
    "##................##",
    "##................##",
    "##..====..====....##",
    "##................##",
    "##.====.....====..##",
    "##................##",
    "##........====....##",
    "##................##",
    "....................",
    "....................",
    "######......########",
  ],
  guardians: [
    h("polarbear", 6, 4, 10, 1.0),
    h("polarbear", 8, 8, 15, -0.9),
  ],
  items: [
    i("crystal", 4, 4, "jes-c1"),
    i("crystal", 12, 6, "jes-c2"),
    i("crystal", 10, 8, "jes-c3"),
  ],
  exits: [
    exit("top", "rybarska-dira", 10, 2),
    exit("right", "stanice", 1, 12),
    exit("bottom", "ruda", 8, 1),
  ],
  spawn: { x: 10 * TILE, y: 3 * TILE },
  hint: "Krystaly září. Leopardí tuleni nemilí.",
  movers: [
    { kind: "lift", x: 10 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const stanice: Room = {
  id: "stanice",
  name: "Opuštěná stanice",
  palette: "lab",
  // Indoor room with side openings on rows 11-12 so player can leave left/right.
  // Bottom hole cols 9-10 leads down to stanice2 (Antarktická základna).
  tiles: [
    "....................",
    "..##############....",
    "..#............#....",
    "..#.====....==.#....",
    "..#............#....",
    "..#..====...===#....",
    "..#............#....",
    "..#=====...====#....",
    "..#............#....",
    "..#..H.........#....",
    "..#..H.===...H.#....",
    "..#..H.......H......",
    "....................",
    "#########..#########",
  ],
  guardians: [
    v("snowwind", 7, 3, 11, 0.9),
    h("petrel", 4, 3, 13, 0.8),
  ],
  items: [
    i("fish", 5, 4, "stan-f1"),
    i("flag", 11, 2, "stan-fl"),
    i("medal", 8, 10, "stan-m1"),
  ],
  exits: [
    exit("left", "jeskyne", 17, 12),
    exit("right", "laborator", 1, 12),
    exit("bottom", "stanice2", 9, 1),
  ],
  spawn: { x: 4 * TILE, y: 12 * TILE },
};

const laborator: Room = {
  id: "laborator",
  name: "Laboratoř IUCN",
  palette: "lab",
  // Bottom row 13 has a hole (col 9-10) so player can drop to vrak.
  tiles: [
    "....................",
    "....................",
    "...=====...=====....",
    "....................",
    "..............======",
    "........=====.......",
    "====................",
    "....................",
    "......====..........",
    "..............====..",
    "....................",
    "==...............==.",
    "....................",
    "##########..########",
  ],
  guardians: [
    d("petrel", 5, 1, 0, 19, 0, 10, 0.7, 0.5),
    d("petrel", 14, 3, 0, 19, 0, 10, -0.6, 0.5),
    s("crystal", 9, 11),
  ],
  items: [
    i("fish", 4, 1, "lab-f1"),
    i("medal", 17, 3, "lab-m1"),
    i("fish", 2, 5, "lab-f2"),
  ],
  exits: [
    exit("left", "stanice", 18, 12),
    exit("bottom", "vrak", 9, 1),
    exit("top", "hriste", 10, 12),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
  doors: [door("laborator-red", 6, 12, "red")],
  movers: [
    { kind: "lift", x: 10 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const vrak: Room = {
  id: "vrak",
  name: "Vrak lodi",
  palette: "wreck",
  // Top center open for laborator return. Left open on row 10 for galapagos.
  tiles: [
    "....................",
    "....................",
    "................####",
    "....................",
    "............####....",
    "....................",
    "........#H#.........",
    "....................",
    "....####............",
    "....................",
    "####................",
    "....................",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
  ],
  guardians: [
    h("walrus", 11, 0, 19, 1.4, 36, 20),
    v("bubble", 6, 7, 11, -0.8, 12, 12),
    v("bubble", 13, 7, 11, 0.9, 12, 12),
  ],
  items: [
    i("medal", 17, 1, "vrak-m1"),
    i("fish", 10, 5, "vrak-f1"),
    i("flag", 2, 9, "vrak-fl"),
    i("fish", 6, 12, "vrak-f-deep1"),
    i("fish", 16, 13, "vrak-f-deep2"),
  ],
  exits: [
    exit("left", "galapagos", 18, 10),
    exit("top", "laborator", 9, 12),
    exit("right", "kostra", 1, 11),
  ],
  spawn: { x: 3 * TILE, y: 9 * TILE },
  doors: [door("vrak-yellow", 14, 9, "yellow")],
  movers: [
    { kind: "lift", x: 9 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const schody: Room = {
  id: "schody",
  name: "Ledové schody",
  palette: "ice",
  // Floor row 13 has a hole in the center (col 9-10) for bottom→prusmyk exit.
  // Right side open on row 12 for right→hriste exit.
  tiles: [
    "................====",
    "....................",
    "............====....",
    "....................",
    "........====........",
    "....................",
    "....====............",
    "....................",
    "====................",
    "....................",
    "==..................",
    "....................",
    "....................",
    "##########..########",
  ],
  guardians: [
    d("snowwind", 10, 5, 0, 19, 0, 10, 0.6, 0.6),
    h("petrel", 6, 1, 18, 0.9),

  ],
  items: [
    i("fish", 16, 0, "sch-f1"),
    i("crystal", 2, 10, "sch-c1"),
    i("medal", 5, 5, "sch-m1"),
    i("crystal", 14, 8, "sch-c1"),

  ],
  exits: [
    exit("bottom", "prusmyk", 9, 1),
    exit("right", "hriste", 1, 12),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
};

const hriste: Room = {
  id: "hriste",
  name: "Hřiště mláďat",
  palette: "candy",
  // Indoor with side openings on rows 11-12 for left/right, bottom has hole for laborator.
  tiles: [
    "....................",
    "....................",
    "..==============....",
    "....................",
    "..H.............H...",
    "..H.=====..=====H...",
    "..H.............H...",
    "..H.............H...",
    "..H====..===.===H...",
    "..H.............H...",
    "..H.............H...",
    "....................",
    "....................",
    "##########..########",
  ],
  guardians: [
    h("seal", 4, 2, 16, 0.8),
    h("seal", 8, 5, 13, -0.7),
    h("skua", 10, 2, 17, 1.0),
  ],
  items: [
    i("egg", 6, 4, "hr-e1"),
    i("egg", 14, 7, "hr-e2"),
    i("fish", 10, 9, "hr-f1"),
    key("red", 10, 7, "hr-key-red"),
  ],
  exits: [
    exit("bottom", "laborator", 9, 1),
    exit("left", "schody", 18, 12),
    exit("right", "tajny", 1, 12),
    exit("top", "klubovna", 10, 12),
  ],
  spawn: { x: 3 * TILE, y: 12 * TILE },
  hint: "Červený klíč pustí na hokejové hřiště.",
  movers: [
    { kind: "lift", x: 10 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const tajny: Room = {
  id: "tajny",
  name: "Tajná síň",
  palette: "aurora",
  // Frame of walls except left opening (row 11-12) for hriste return.
  tiles: [
    "####################",
    "#..................#",
    "#..................#",
    "#......=====.......#",
    "#..................#",
    "#....====...====...#",
    "#..................#",
    "#......=====.......#",
    "#..................#",
    "#..................#",
    "#....====...====...#",
    "...................#",
    "...................#",
    "####################",
  ],
  guardians: [
    d("petrel", 3, 2, 1, 18, 1, 12, 0.6, 0.5),
    d("petrel", 14, 8, 1, 18, 1, 12, -0.7, 0.6),
    s("crystal", 9, 12),
  ],
  items: [
    i("medal", 9, 2, "taj-m1"),
    i("flag", 5, 8, "taj-fl"),
    i("crystal", 14, 10, "taj-c1"),
  ],
  exits: [
    exit("left", "hriste", 18, 12),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
  hint: "Trofejní síň - medaile, vlajka, krystal.",
};

const majak: Room = {
  id: "majak",
  name: "Antarktický maják",
  palette: "aurora",
  // Floor row 13 has center hole for bottom→zakladna exit. Right opening for jeskyne.
  tiles: [
    "........####........",
    "........####........",
    "........####........",
    "......========......",
    "....................",
    "..====........====..",
    "....................",
    "........====........",
    "....................",
    "..==............==..",
    "....................",
    "....................",
    "....................",
    "##########..########",
  ],
  guardians: [
    h("skua", 3, 1, 18, 1.1),
    d("petrel", 8, 6, 0, 19, 0, 12, 0.8, 0.6),
    v("snowwind", 10, 5, 12, 0.9),
  ],
  items: [
    i("flag", 9, 2, "maj-fl"),
    i("medal", 2, 5, "maj-m1"),
    i("medal", 17, 5, "maj-m2"),
  ],
  exits: [
    exit("bottom", "zakladna", 10, 1),
    exit("right", "vrak2", 1, 11),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
  hint: "Maják nad stanicí. Vlajka je poslední.",
};

// =============== EXPANSION: 24 new rooms in 8 mini-trees ===============

// Tree A: iglu.left → kuchyne → spizirna → komin
const kuchyne: Room = {
  id: "kuchyne",
  name: "Kuchyně iglú",
  palette: "candy",
  tiles: [
    "....................",
    "....................",
    "..==============....",
    "....................",
    "..H.............H...",
    "..H...====..====H...",
    "..H.............H...",
    "..H.....====....H...",
    "..H.............H...",
    "..H...===...===.H...",
    "..H.............H...",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("skua", 7, 3, 14, 0.7), v("snowwind", 10, 1, 12, 0.7)],
  items: [i("fish", 9, 6, "ku-f1"), i("egg", 4, 8, "ku-e1"), i("medal", 16, 6, "ku-m1"), i("crystal", 3, 2, "ku-c1")],
  exits: [
    exit("right", "iglu", 1, 11),
    exit("left", "spizirna", 18, 12),
  ],
  spawn: { x: 17 * TILE, y: 12 * TILE },
};

const spizirna: Room = {
  id: "spizirna",
  name: "Spižírna",
  palette: "candy",
  tiles: [
    "....................",
    "....................",
    "....................",
    "===.......====...===",
    "....................",
    "...===..........===.",
    "....................",
    "===.......====......",
    "....................",
    "..====..........====",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("seal", 12, 1, 18, 0.6), d("petrel", 4, 5, 0, 19, 1, 10, 0.5, 0.4)],
  items: [i("fish", 9, 2, "sp-f1"), i("egg", 16, 6, "sp-e1"), i("medal", 2, 8, "sp-m1")],
  exits: [
    exit("right", "kuchyne", 1, 12),
    exit("left", "komin", 13, 12),
  ],
  spawn: { x: 17 * TILE, y: 12 * TILE },
};

const komin: Room = {
  id: "komin",
  name: "Komín",
  palette: "night",
  tiles: [
    "..####..........####",
    "..####..........####",
    "..####..........####",
    "..####..........####",
    "..####..........####",
    "..####==========####",
    "..####..........####",
    "..####..........####",
    "..####==========####",
    "..####..........####",
    "..####..........####",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [v("snowwind", 9, 1, 11, 0.7), v("icicle", 12, 0, 11, 0.9)],
  items: [i("crystal", 9, 7, "ko-c1"), i("medal", 6, 4, "ko-m1"), i("flag", 14, 9, "ko-fl"), i("fish", 14, 4, "ko-f1")],
  exits: [exit("right", "spizirna", 1, 12)],
  spawn: { x: 13 * TILE, y: 12 * TILE },
  hint: "Komín - dead-end. Vyber a vrať se.",
};

// Tree B: zakladna.bottom → tunelky → dilna → sklad
const tunelky: Room = {
  id: "tunelky",
  name: "Tunely pod stanicí",
  palette: "cave",
  tiles: [
    "######......########",
    "....................",
    "....................",
    "###.....====......##",
    "....................",
    "....................",
    "##....====..====...#",
    "....................",
    "....................",
    "###.......====......",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("polarbear", 5, 2, 10, 0.8), d("bubble", 14, 5, 0, 19, 1, 10, 0.5, 0.4, 12, 12)],
  items: [i("crystal", 9, 2, "tu-c1"), i("fish", 14, 5, "tu-f1"), i("medal", 4, 9, "tu-m1"), i("egg", 17, 7, "tu-e1")],
  exits: [
    exit("top", "zakladna", 8, 12),
    exit("right", "dilna", 1, 12),
  ],
  spawn: { x: 8 * TILE, y: 2 * TILE },
  movers: [
    { kind: "lift", x: 8 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const dilna: Room = {
  id: "dilna",
  name: "Dílna",
  palette: "lab",
  tiles: [
    "....................",
    "....................",
    "....=========.......",
    "....................",
    ".=====..............",
    "....................",
    "..........=====.....",
    "....................",
    "===...........======",
    "....................",
    "..........====......",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [d("petrel", 6, 2, 0, 19, 0, 11, 0.6, 0.5), s("crystal", 10, 11)],
  items: [i("medal", 8, 1, "di-m1"), i("fish", 16, 7, "di-f1"), i("egg", 3, 9, "di-e1")],
  exits: [
    exit("left", "tunelky", 18, 12),
    exit("right", "sklad", 1, 12),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
};

const sklad: Room = {
  id: "sklad",
  name: "Sklad",
  palette: "wreck",
  tiles: [
    "....................",
    "..##############....",
    "..#............#....",
    "..#.====.======#....",
    "..#............#....",
    "..#======..====#....",
    "..#............#....",
    "..#.===========#....",
    "..#............#....",
    "..#======...===#....",
    "..#............#....",
    "....................",
    "....................",
    "######......########",
  ],
  guardians: [h("seal", 4, 3, 14, 0.7), v("snowwind", 13, 4, 10, 0.6)],
  items: [i("flag", 5, 2, "sk-fl"), i("medal", 12, 6, "sk-m1"), i("crystal", 8, 9, "sk-c1")],
  exits: [
    exit("left", "dilna", 18, 12),
    exit("bottom", "klubovna", 9, 1),
  ],
  spawn: { x: 17 * TILE, y: 12 * TILE },
  hint: "Sklad - trofeje + tajný tunel dolů.",
};

// Tree C: kolonie.top → vejcohnizdo → mladata → skolka
const vejcohnizdo: Room = {
  id: "vejcohnizdo",
  name: "Vejcohnízdo",
  palette: "emperor",
  tiles: [
    "....................",
    "..==============....",
    "....................",
    "..H.............H...",
    "..H...===..===..H...",
    "..H.............H...",
    "..H.====...=====H...",
    "..H.............H...",
    "..H...====..===.H...",
    "..H.............H...",
    "..H.============H...",
    "..H.............H...",
    "..H.............H...",
    "######......########",
  ],
  guardians: [h("skua", 5, 2, 17, 0.9), h("skua", 9, 1, 18, -0.7)],
  items: [
    i("egg", 5, 3, "vh-e1"),
    i("egg", 14, 5, "vh-e2"),
    i("egg", 9, 8, "vh-e3"),
    i("chick", 7, 12, "vh-c1"),
    i("chick", 12, 12, "vh-c2"),
    i("egg", 3, 2, "kuch-e1"),
    i("medal", 16, 6, "kuch-m1"),

    i("crystal", 9, 3, "kom-c1"),
    i("flag", 4, 9, "kom-fl"),

    i("medal", 14, 5, "tun-m1"),
    i("fish", 6, 9, "tun-f1"),

  ],
  exits: [
    exit("bottom", "kolonie", 8, 1),
    exit("top", "mladata", 10, 12),
  ],
  spawn: { x: 3 * TILE, y: 12 * TILE },
  movers: [
    { kind: "lift", x: 10 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const mladata: Room = {
  id: "mladata",
  name: "Mláďata",
  palette: "candy",
  tiles: [
    "....................",
    "....................",
    "....................",
    "..====..====..======",
    "....................",
    "===..====...===.....",
    "....................",
    "..====...======.....",
    "....................",
    "===.......====......",
    "....................",
    "....................",
    "....................",
    "######......########",
  ],
  guardians: [h("seal", 4, 1, 12, 0.6), d("petrel", 12, 4, 0, 19, 1, 10, 0.6, 0.5)],
  items: [
    i("egg", 8, 2, "ml-e1"),
    i("fish", 14, 6, "ml-f1"),
    i("medal", 3, 8, "ml-m1"),
    i("chick", 3, 12, "ml-c1"),
    i("chick", 15, 12, "ml-c2"),
    i("chick", 10, 6, "ml-c3"),
  ],
  exits: [
    exit("bottom", "vejcohnizdo", 8, 1),
    exit("top", "skolka", 10, 12),
  ],
  spawn: { x: 8 * TILE, y: 2 * TILE },
  hint: "Mláďata se ti přidají do houfu - doruč je do iglú za bonus body!",
  movers: [
    { kind: "lift", x: 10 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const skolka: Room = {
  id: "skolka",
  name: "Tučňáčí školka",
  palette: "candy",
  tiles: [
    "....................",
    "..==============....",
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    "....................",
    "..==============....",
    "....................",
    "....................",
    "######......########",
  ],
  guardians: [h("seal", 5, 2, 16, 0.7), h("skua", 9, 2, 17, 1.0)],
  items: [
    i("egg", 4, 3, "sko-e1"),
    i("egg", 14, 6, "sko-e2"),
    i("flag", 9, 9, "sko-fl"),
    i("chick", 4, 12, "sko-c1"),
    i("chick", 14, 12, "sko-c2"),
  ],
  exits: [
    exit("bottom", "mladata", 8, 1),
    exit("right", "trida", 1, 11),
  ],
  spawn: { x: 8 * TILE, y: 2 * TILE },
  hint: "Školka pro mláďata - sebrat všechna vejce a chyť mláďata pro doprovod do iglu! Vpravo je akademie.",
};

// Tree D: skaly.top → hreben → arch → vrchol
const hreben: Room = {
  id: "hreben",
  name: "Horský hřeben",
  palette: "sunset",
  tiles: [
    "....................",
    "....................",
    "....................",
    "...===.......===....",
    "....................",
    ".==.....====.....==.",
    "....................",
    "....===.......===...",
    "....................",
    "==..............==..",
    "....................",
    "....................",
    "....................",
    "######......########",
  ],
  guardians: [d("skua", 6, 1, 0, 19, 1, 9, 0.8, 0.5), h("polarbear", 12, 4, 16, 1.0)],
  items: [i("medal", 9, 4, "hr-m1"), i("fish", 14, 7, "hr-f1"), i("crystal", 3, 8, "hr-c1"), key("yellow", 10, 4, "hreben-key-yellow")],
  exits: [
    exit("bottom", "skaly", 8, 1),
    exit("right", "arch", 1, 12),
  ],
  spawn: { x: 8 * TILE, y: 2 * TILE },
};

const arch: Room = {
  id: "arch",
  name: "Ledový oblouk",
  palette: "ice",
  tiles: [
    "....................",
    "....................",
    "...####......####...",
    "..##############....",
    "..##############....",
    "....................",
    "....................",
    "....================",
    "....................",
    "===.................",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [v("icicle", 10, 5, 11, 1.0), h("petrel", 8, 4, 17, 0.7)],
  items: [i("fish", 5, 6, "ar-f1"), i("crystal", 16, 6, "ar-c1"), i("flag", 9, 4, "arch-fl"), i("crystal", 14, 8, "arch-c1")],
  exits: [
    exit("left", "hreben", 18, 12),
    exit("right", "vrchol", 1, 12),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
};

const vrchol: Room = {
  id: "vrchol",
  name: "Vrchol",
  palette: "aurora",
  tiles: [
    "........####........",
    ".......######.......",
    "......########......",
    ".....##########.....",
    "....============....",
    "....................",
    "..==............==..",
    "....................",
    "....................",
    "==................==",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [d("petrel", 6, 5, 0, 19, 1, 11, 0.7, 0.5), v("snowwind", 9, 5, 11, 0.9)],
  items: [i("flag", 9, 3, "vr-fl"), i("medal", 2, 5, "vr-m1"), i("medal", 17, 5, "vr-m2")],
  exits: [
    exit("left", "arch", 18, 12),
    exit("right", "katedra", 1, 11),
  ],
  spawn: { x: 17 * TILE, y: 12 * TILE },
  hint: "Nejvyšší bod. 3 trofeje + průchod do katedrály vpravo.",
};

// Tree E: galapagos.top → sopka → terasy → kalejdoskop
const sopka: Room = {
  id: "sopka",
  name: "Sopka",
  palette: "tropical",
  tiles: [
    "....................",
    "....................",
    "........====........",
    "....................",
    ".....====...===.....",
    "....................",
    "..===..........===..",
    "....................",
    "===.................",
    "....................",
    "....................",
    "....................",
    "....................",
    "######......########",
  ],
  guardians: [h("petrel", 4, 1, 17, 0.8), v("crystal", 9, 5, 7, 0)],
  items: [i("fish", 9, 1, "so-f1"), i("crystal", 14, 5, "so-c1"), i("medal", 2, 7, "so-m1")],
  exits: [
    exit("bottom", "galapagos", 8, 1),
    exit("left", "terasy", 18, 12),
    exit("right", "kraterUst", 1, 12),
  ],
  spawn: { x: 8 * TILE, y: 2 * TILE },
};

const terasy: Room = {
  id: "terasy",
  name: "Terasy",
  palette: "galapagos",
  tiles: [
    "....................",
    "................====",
    "....................",
    "............====....",
    "....................",
    "........====........",
    "....................",
    "....====............",
    "....................",
    "====................",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [d("petrel", 8, 5, 0, 19, 1, 10, 0.6, 0.5), h("petrel", 5, 1, 18, 0.8)],
  items: [i("fish", 16, 0, "te-f1"), i("egg", 9, 4, "te-e1"), i("medal", 2, 8, "te-m1")],
  exits: [
    exit("right", "sopka", 1, 12),
    exit("left", "kalejdoskop", 18, 12),
    exit("top", "palma", 9, 12),
  ],
  spawn: { x: 17 * TILE, y: 12 * TILE },
  movers: [
    { kind: "lift", x: 9 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const kalejdoskop: Room = {
  id: "kalejdoskop",
  name: "Kalejdoskop",
  palette: "aurora",
  tiles: [
    "....................",
    "...====......====...",
    "....................",
    "..H.............H...",
    "..H..====..====.H...",
    "..H.............H...",
    "..H..==..==..==.H...",
    "..H.............H...",
    "..H..====..====.H...",
    "..H.............H...",
    "..H.............H...",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("skua", 4, 2, 17, 0.9), h("petrel", 7, 1, 18, -0.7)],
  items: [i("crystal", 5, 1, "ka-c1"), i("crystal", 14, 1, "ka-c2"), i("flag", 9, 9, "ka-fl")],
  exits: [
    exit("right", "terasy", 1, 12),
    exit("left", "magArchipelag", 18, 11),
  ],
  spawn: { x: 17 * TILE, y: 12 * TILE },
  hint: "Kalejdoskop - barevný průchod, vlevo Magellanův archipelag.",
};

// Tree F: vrak.right → kostra → propast → poklad
const kostra: Room = {
  id: "kostra",
  name: "Kostra velryby",
  palette: "wreck",
  tiles: [
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    ".===..===..===..===.",
    "....................",
    "..==..==..==..==....",
    "....................",
    ".===..===..===..===.",
    "....................",
    "..==..==..==..==....",
    "....................",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
  ],
  guardians: [h("walrus", 11, 0, 19, 1.4, 36, 20), v("bubble", 6, 7, 11, -0.8, 12, 12)],
  items: [i("medal", 9, 1, "ko-m1"), i("fish", 5, 5, "ko-f1"), i("flag", 14, 9, "ko-fl")],
  exits: [
    exit("left", "vrak", 18, 11),
    exit("right", "propast", 1, 9),
  ],
  spawn: { x: 2 * TILE, y: 11 * TILE },
};

const propast: Room = {
  id: "propast",
  name: "Mořská propast",
  palette: "ocean",
  tiles: [
    "....................",
    "..============......",
    "....................",
    "............===.....",
    "....................",
    ".===................",
    "....................",
    ".........====.......",
    "....................",
    "===.......===.......",
    "....................",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
  ],
  guardians: [h("walrus", 8, 0, 19, 1.5, 36, 20), v("bubble", 10, 5, 10, -0.9, 12, 12)],
  items: [i("fish", 9, 2, "pr-f1"), i("medal", 16, 7, "pr-m1"), i("fish", 4, 12, "pr-f-deep1"), i("fish", 12, 13, "pr-f-deep2")],
  exits: [
    exit("left", "kostra", 18, 9),
    exit("bottom", "poklad", 9, 1),
  ],
  spawn: { x: 2 * TILE, y: 11 * TILE },
  hint: "Pozor na kosatku v dolní vodě.",
};

const poklad: Room = {
  id: "poklad",
  name: "Pirátský poklad",
  palette: "wreck",
  tiles: [
    "######......########",
    "....................",
    "....................",
    "...######H#######...",
    "...#............#...",
    "...#..====..====#...",
    "...#............#...",
    "...#=====..=====#...",
    "...#............#...",
    "...#..H..====...#...",
    "...#..H.........#...",
    "...######H#######...",
    "....................",
    "####################",
  ],
  guardians: [h("petrel", 5, 4, 14, 0.7), s("crystal", 9, 8)],
  items: [i("medal", 5, 4, "pk-m1"), i("medal", 14, 4, "pk-m2"), i("flag", 9, 9, "pk-fl")],
  exits: [exit("top", "propast", 9, 0)],
  spawn: { x: 9 * TILE, y: 2 * TILE },
  hint: "Pirátský poklad - 3 trofeje, dead-end.",
  movers: [
    { kind: "lift", x: 9 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

// Tree G: jeskyne.bottom → ruda → labyrinth → planety
const ruda: Room = {
  id: "ruda",
  name: "Rudovinné chodby",
  palette: "cave",
  tiles: [
    "######......########",
    "....................",
    "....................",
    "##...===....===....#",
    "....................",
    "##.............====#",
    "....................",
    "##....====...===...#",
    "....................",
    "##====..............",
    "....................",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("polarbear", 4, 3, 8, 0.9), d("crystal", 14, 5, 1, 18, 1, 10, 0.6, 0.5)],
  items: [i("crystal", 5, 2, "ru-c1"), i("crystal", 16, 4, "ru-c2"), i("crystal", 8, 6, "ru-c3")],
  exits: [
    exit("top", "jeskyne", 8, 12),
    exit("right", "labyrinth", 1, 12),
  ],
  spawn: { x: 8 * TILE, y: 2 * TILE },
  movers: [
    { kind: "lift", x: 8 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const labyrinth: Room = {
  id: "labyrinth",
  name: "Bludiště",
  palette: "cave",
  tiles: [
    "....................",
    "..####....####......",
    "..####....####......",
    "..............####..",
    "..............####..",
    "..####..####........",
    "..####..####........",
    "........####..####..",
    "........####..####..",
    "..####..............",
    "..####..............",
    "....................",
    "....................",
    "########..##########",
  ],
  guardians: [h("polarbear", 4, 6, 18, 1.0), v("snowwind", 9, 1, 11, 0.7)],
  items: [i("crystal", 7, 1, "la-c1"), i("medal", 15, 9, "la-m1"), i("fish", 1, 11, "la-f1")],
  exits: [
    exit("left", "ruda", 18, 12),
    exit("right", "planety", 1, 12),
    exit("bottom", "prepad", 9, 1),
  ],
  spawn: { x: 10 * TILE, y: 12 * TILE },
};

const planety: Room = {
  id: "planety",
  name: "Krystalové komnaty",
  palette: "aurora",
  tiles: [
    "....................",
    "....................",
    "....=====.....=====.",
    "....................",
    "..==..............==",
    "....................",
    "........=====.......",
    "....................",
    "..==..............==",
    "....................",
    "....=====.....=====.",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [d("petrel", 8, 5, 0, 19, 1, 10, 0.7, 0.5), s("crystal", 9, 6)],
  items: [i("crystal", 6, 1, "pl-c1"), i("crystal", 16, 1, "pl-c2"), i("medal", 9, 5, "pl-m1"), i("flag", 9, 9, "pl-fl")],
  exits: [
    exit("left", "labyrinth", 18, 12),
    exit("top", "aurora1", 9, 12),
  ],
  spawn: { x: 17 * TILE, y: 12 * TILE },
  hint: "Krystalové komnaty - 4 trofeje. Aurora se otvírá nahoře.",
  movers: [
    { kind: "lift", x: 9 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

// Tree H: hriste.top → klubovna → divadlo → kino
const klubovna: Room = {
  id: "klubovna",
  name: "Klubovna",
  palette: "candy",
  tiles: [
    "....................",
    "..==============....",
    "....................",
    "..H..====.======H...",
    "..H.............H...",
    "..H.======..====H...",
    "..H.............H...",
    "..H..====..======H..",
    "..H.............H...",
    "..H.======..====H...",
    "..H.............H...",
    "....................",
    "....................",
    "######......########",
  ],
  guardians: [h("seal", 3, 4, 14, 0.7), h("skua", 7, 2, 17, 0.9)],
  items: [i("egg", 8, 3, "kl-e1"), i("fish", 14, 5, "kl-f1"), i("medal", 4, 9, "kl-m1")],
  exits: [
    exit("bottom", "hriste", 8, 1),
    exit("left", "divadlo", 18, 12),
    exit("top", "sklad", 3, 11),
  ],
  spawn: { x: 8 * TILE, y: 2 * TILE },
  movers: [
    { kind: "lift", x: 3 * 16, y: 11 * 16, w: 32, h: 6, minY: -8, maxY: 11 * 16, vy: 0.7 },
  ],
};

const divadlo: Room = {
  id: "divadlo",
  name: "Divadlo",
  palette: "candy",
  tiles: [
    "....................",
    "...================.",
    "....................",
    "....................",
    "....................",
    "...====.......====..",
    "....................",
    "....................",
    "..==..==..==..==....",
    "....................",
    ".=================..",
    "....................",
    "....................",
    "####################",
  ],
  guardians: [h("seal", 8, 1, 13, 0.7), d("petrel", 4, 4, 0, 19, 1, 9, 0.6, 0.5)],
  items: [i("medal", 9, 0, "dv-m1"), i("flag", 14, 4, "dv-fl"), i("fish", 4, 7, "dv-f1")],
  exits: [
    exit("right", "klubovna", 1, 12),
    exit("left", "kino", 13, 12),
  ],
  spawn: { x: 17 * TILE, y: 12 * TILE },
};

const kino: Room = {
  id: "kino",
  name: "Kino pingvínků",
  palette: "night",
  tiles: [
    "....................",
    "....................",
    "..================..",
    "....................",
    "....................",
    "..####..........####",
    "....................",
    "....................",
    "..####..........####",
    "....................",
    "....................",
    "..####..........####",
    "....................",
    "####################",
  ],
  guardians: [v("snowwind", 9, 4, 11, 0.7), h("petrel", 7, 1, 18, 0.7)],
  items: [i("medal", 9, 1, "ki-m1"), i("flag", 5, 6, "ki-fl"), i("crystal", 14, 9, "ki-c1")],
  exits: [exit("right", "divadlo", 1, 12)],
  spawn: { x: 13 * TILE, y: 12 * TILE },
  hint: "Kino - promítací sál, dead-end.",
};

export const ROOMS: Room[] = [
  iglu, zakladna, kolonie, prusmyk, skaly, more, rybarskaDira,
  galapagos, jeskyne, stanice, laborator, vrak, schody, hriste, tajny, majak,
  // Expansion (24 rooms in 8 trees):
  kuchyne, spizirna, komin,
  tunelky, dilna, sklad,
  vejcohnizdo, mladata, skolka,
  hreben, arch, vrchol,
  sopka, terasy, kalejdoskop,
  kostra, propast, poklad,
  ruda, labyrinth, planety,
  klubovna, divadlo, kino,
  // Sprint 006 expansion: Antarktická základna (1. várka)
  ...EXTRA_ROOMS,
  // Sprint 006 Run 019-024: Aurora, Vrak, Tropický ostrov, Severní pól, Katedrála, Magellan
  ...EXTRA_ROOMS_2,
];

export const START_ROOM_ID = "iglu";
