// Distribuce extra mláďat a iglu po herním plánu.
// Cíl: ~20 mláďat celkem (8 stávajících v levels.ts + 12 přidaných sem) a 10 iglu.
// Volá se po sestavení rooms — najde vhodná empty políčka nad podlahou a vloží
// `chick` / `iglu` items. Místnosti vybíráme deterministicky (stable ID list),
// takže každý restart dostane stejný stav.

import type { Item, Room } from "./types";
import { COLS, ROWS } from "./types";

// Místnosti, kde **přidáme jedno mládě** (mimo 4 místnosti, které mláďata už mají).
const EXTRA_CHICK_ROOMS = [
  "zakladna",
  "kolonie",
  "skaly",
  "more",
  "rybarska-dira",
  "jeskyne",
  "majak",
  "skolka",
  "spizirna",
  "komin",
  "laborator",
  "ruda",
];

// Místnosti, kde umístíme **iglu** (cílový bod doručení) — 10 různých míst.
const IGLU_ROOMS = [
  "iglu",
  "kuchyne",
  "labyrinth",
  "vez",
  "ledovec",
  "vrchol",
  "divadlo",
  "klubovna",
  "dilna",
  "hriste",
];

/** Najde první empty políčko, které stojí na podlaze (tile pod ním je #/=) a má volné místo nad sebou. */
function findGroundSpot(room: Room, occupied: Set<string>): { x: number; y: number } | null {
  for (let y = ROWS - 3; y >= 1; y--) {
    for (let x = 2; x < COLS - 2; x++) {
      const here = room.tiles[y][x];
      if (here !== ".") continue;
      const below = room.tiles[y + 1]?.[x] ?? ".";
      if (below !== "#" && below !== "=") continue;
      // potřebujeme tile-volné místo na výšku 1 nad mládětem (jeho hlava)
      const above = room.tiles[y - 1]?.[x] ?? ".";
      if (above === "#") continue;
      const key = `${x},${y}`;
      if (occupied.has(key)) continue;
      // ne pod door tile a ne kolize s existujícím item
      if (room.doors?.some((d) => d.col === x && d.row === y)) continue;
      if (room.items.some((it) => it.x === x && it.y === y)) continue;
      occupied.add(key);
      return { x, y };
    }
  }
  return null;
}

/** Přidá items do už existujících rooms (mutuje) — nutno volat po klonování rooms. */
export function placeChicksAndIglus(rooms: Map<string, Room>): void {
  for (const roomId of EXTRA_CHICK_ROOMS) {
    const room = rooms.get(roomId);
    if (!room) continue;
    const occupied = new Set<string>();
    const spot = findGroundSpot(room, occupied);
    if (!spot) continue;
    const item: Item = {
      kind: "chick",
      x: spot.x,
      y: spot.y,
      id: `${roomId}-extra-chick`,
    };
    room.items.push(item);
  }

  for (const roomId of IGLU_ROOMS) {
    const room = rooms.get(roomId);
    if (!room) continue;
    const occupied = new Set<string>();
    // Pokud už mládě dostala v EXTRA_CHICK_ROOMS, není problém (jiná pozice)
    const spot = findGroundSpot(room, occupied);
    if (!spot) continue;
    const item: Item = {
      kind: "iglu",
      x: spot.x,
      y: spot.y,
      id: `${roomId}-iglu`,
    };
    room.items.push(item);
  }
}
