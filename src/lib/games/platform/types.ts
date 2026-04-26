// Jet Set Willy-style tile platformer pro pingupedia.
// Každá obrazovka = místnost s gridem 20×14 tiles, 16×16 px per tile → 320×224 px.
// Room transitions přes okraje, sběr předmětů (rybiček), guardians jako patrolující nepřátelé.

export const TILE = 16;
export const COLS = 20;
export const ROWS = 14;
export const VIEW_W = COLS * TILE;   // 320
export const VIEW_H = ROWS * TILE;   // 224

export type TileChar =
  | "." // empty
  | "#" // solid block (un-breakable wall / ground)
  | "b" // breakable ice block — solid until pecked, then becomes "."
  | "=" // platform / jumpthrough top
  | "H" // ladder
  | "~" // water / death zone
  | "*" // spikes / crystals — death on touch
  | "C" // conveyor (auto-push right)
  | "c" // conveyor (auto-push left)
  ;

export type GuardianKind =
  | "horiz"     // horizontal patrol
  | "vert"      // vertical patrol
  | "diag"      // diagonal bouncer (bounces off bounds)
  | "static"    // stationary hazard
  ;

export type GuardianSprite =
  | "skua" | "seal" | "polarbear" | "petrel" | "walrus"
  | "crystal" | "snowwind" | "icicle" | "bubble";

export interface Guardian {
  kind: GuardianKind;
  sprite: GuardianSprite;
  x: number;        // pixel
  y: number;
  w: number;
  h: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  vx?: number;
  vy?: number;
  phase?: number;
}

export type ItemKind = "fish" | "egg" | "medal" | "flag" | "crystal" | "heart";

export type SfxKind =
  | "mlask"   // sběr ryby
  | "pop"     // sběr vejce
  | "ding"    // sběr medaile / vlajky / krystalu
  | "gulp"    // sběr srdíčka (život)
  | "zbunk"   // přechod mezi místnostmi
  | "boing"   // skok
  | "ouch"    // ztráta života
  | "bzzt"    // game over
  | "tada";   // výhra

export interface Item {
  kind: ItemKind;
  x: number;  // tile col
  y: number;  // tile row
  id: string; // unique (room + index) for tracking
}

export interface Exit {
  side: "left" | "right" | "top" | "bottom";
  toRoom: string;
  toX?: number;   // tile col in next room (default: mirrored)
  toY?: number;   // tile row in next room
}

export type Palette =
  | "arctic" | "aurora" | "ocean" | "ice" | "lab" | "cave"
  | "wreck" | "tropical" | "sunset" | "night" | "candy"
  | "emperor" | "magellan" | "galapagos";

export interface Room {
  id: string;
  name: string;        // Czech display name
  palette: Palette;
  tiles: string[];     // rows.length === ROWS, each string.length === COLS
  guardians: Guardian[];
  items: Item[];
  exits: Exit[];
  spawn: { x: number; y: number };   // pixel start position (first entry)
  hint?: string;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  onLadder: boolean;
  facing: 1 | -1;
  animPhase: number;
  invulnerableMs: number;
}

export interface GameState {
  rooms: Map<string, Room>;
  currentRoomId: string;
  player: PlayerState;
  lives: number;
  collected: Set<string>;
  totalItems: number;
  time: number;
  completed: boolean;
  gameover: boolean;
  lastHintRoom: string | null;
  hintUntil: number;
}

export interface GameHud {
  roomName: string;
  roomIndex: number;     // 1-based
  totalRooms: number;
  hint: string | null;
  lives: number;
  collected: number;
  total: number;
}

export interface GameHooks {
  onHud(_h: GameHud): void;
  onWin(_timeSec: number): void;
  onGameover(): void;
  onSfx(_kind: SfxKind): void;
}
