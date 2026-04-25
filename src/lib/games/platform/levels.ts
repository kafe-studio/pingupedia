import type { Exit, Guardian, Item, Room } from "./types";
import { TILE } from "./types";

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
    "...#......H.........",
    "...#................",
    "...#################",
    "####################",
  ],
  guardians: [],
  items: [i("fish", 5, 7, "iglu-f1")],
  exits: [exit("right", "zakladna", 1, 11)],
  spawn: { x: 4 * TILE, y: 11 * TILE },
  hint: "Jet Set Pingu. Sesbírej všechno a vrať se sem. Dveře vpravo →",
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
    "####################",
  ],
  guardians: [
    h("skua", 3, 0, 19, 0.8),
    d("petrel", 2, 1, 0, 19, 0, 11, 0.7, 0.4),
  ],
  items: [
    i("fish", 10, 1, "zakladna-f1"),
    i("fish", 1, 6, "zakladna-f2"),
  ],
  exits: [
    exit("left", "iglu", 17, 11),
    exit("right", "kolonie", 1, 12),
    exit("top", "majak", 10, 12),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
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
    "####################",
  ],
  guardians: [
    h("skua", 4, 2, 18, 1.0),
    h("skua", 10, 0, 14, -0.8),
    s("snowwind", 9, 6),
  ],
  items: [
    i("egg", 9, 1, "kolonie-e1"),
    i("egg", 2, 4, "kolonie-e2"),
    i("fish", 17, 7, "kolonie-f1"),
  ],
  exits: [
    exit("left", "zakladna", 18, 12),
    exit("right", "prusmyk", 1, 12),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
  hint: "Pozor na chaluny, kradou vejce.",
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
  ],
  items: [
    i("fish", 6, 3, "prusmyk-f1"),
    i("fish", 15, 9, "prusmyk-f2"),
  ],
  exits: [
    exit("left", "kolonie", 18, 12),
    exit("right", "skaly", 1, 12),
    exit("top", "schody", 10, 12),
  ],
  spawn: { x: 3 * TILE, y: 12 * TILE },
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
    "##......####........",
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
    h("leopard", 12, 3, 17, 1.2),
    d("skua", 10, 1, 5, 19, 1, 7, 0.6, 0.5),
  ],
  items: [
    i("egg", 5, 2, "skaly-e1"),
    i("fish", 11, 4, "skaly-f1"),
    i("medal", 6, 7, "skaly-m1"),
  ],
  exits: [
    exit("left", "prusmyk", 18, 12),
    exit("right", "more", 1, 5),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
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
    h("orca", 10, 0, 19, 1.6, 36, 20),
    h("bubble", 11, 0, 19, 0.8, 12, 12),
  ],
  items: [
    i("fish", 10, 2, "more-f1"),
    i("fish", 16, 4, "more-f2"),
    i("fish", 2, 6, "more-f3"),
  ],
  exits: [
    exit("left", "skaly", 18, 5),
    exit("right", "rybarska-dira", 1, 5),
  ],
  spawn: { x: 2 * TILE, y: 4 * TILE },
  hint: "Voda dole zabíjí. Skákej mezi krami.",
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
  ],
  exits: [
    exit("left", "more", 18, 5),
    exit("right", "galapagos", 1, 10),
    exit("bottom", "jeskyne", 10, 2),
  ],
  spawn: { x: 2 * TILE, y: 3 * TILE },
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
    exit("left", "rybarska-dira", 18, 11),
    exit("right", "vrak", 1, 11),
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
};

const jeskyne: Room = {
  id: "jeskyne",
  name: "Ledová jeskyně",
  palette: "cave",
  // Side walls removed on rows 11-12 (below ladders/platforms). Top has ceiling with center hole for rybarska-dira return.
  tiles: [
    "####################",
    "##########.#########",
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
    "####################",
  ],
  guardians: [
    h("leopard", 6, 4, 10, 1.0),
    h("leopard", 8, 8, 15, -0.9),
  ],
  items: [
    i("crystal", 4, 4, "jes-c1"),
    i("crystal", 12, 6, "jes-c2"),
    i("crystal", 10, 8, "jes-c3"),
  ],
  exits: [
    exit("top", "rybarska-dira", 10, 2),
    exit("right", "stanice", 1, 12),
  ],
  spawn: { x: 10 * TILE, y: 3 * TILE },
  hint: "Krystaly září. Leopardí tuleni nemilí.",
};

const stanice: Room = {
  id: "stanice",
  name: "Opuštěná stanice",
  palette: "lab",
  // Indoor room with side openings on rows 11-12 so player can leave left/right.
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
    "####################",
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
    exit("left", "jeskyne", 18, 12),
    exit("right", "laborator", 1, 12),
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
    "....................",
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
    "........####........",
    "....................",
    "....####............",
    "....................",
    "####................",
    "....................",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
  ],
  guardians: [
    h("orca", 11, 0, 19, 1.4, 36, 20),
    v("bubble", 6, 7, 11, -0.8, 12, 12),
    v("bubble", 13, 7, 11, 0.9, 12, 12),
  ],
  items: [
    i("medal", 17, 1, "vrak-m1"),
    i("fish", 10, 5, "vrak-f1"),
    i("flag", 2, 9, "vrak-fl"),
  ],
  exits: [
    exit("left", "galapagos", 18, 10),
    exit("top", "laborator", 9, 12),
  ],
  spawn: { x: 3 * TILE, y: 9 * TILE },
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
  ],
  items: [
    i("fish", 16, 0, "sch-f1"),
    i("crystal", 2, 10, "sch-c1"),
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
  ],
  exits: [
    exit("bottom", "laborator", 9, 1),
    exit("left", "schody", 18, 12),
    exit("right", "tajny", 1, 12),
  ],
  spawn: { x: 3 * TILE, y: 12 * TILE },
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
  hint: "Trofejní síň — medaile, vlajka, krystal.",
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
  ],
  spawn: { x: 2 * TILE, y: 12 * TILE },
  hint: "Maják nad stanicí. Vlajka je poslední.",
};

export const ROOMS: Room[] = [
  iglu, zakladna, kolonie, prusmyk, skaly, more, rybarskaDira,
  galapagos, jeskyne, stanice, laborator, vrak, schody, hriste, tajny, majak,
];

export const START_ROOM_ID = "iglu";
