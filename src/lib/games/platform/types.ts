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

// Locked doors: 4 colors, each unlocks a different mini-game.
export type KeyColor = "blue" | "red" | "yellow" | "green";

export type MinigameKind = "ski" | "hockey" | "jump" | "dive";

export const KEY_TO_MINIGAME: Record<KeyColor, MinigameKind> = {
  blue:   "ski",      // modrý klíč → lyžování
  red:    "hockey",   // červený klíč → hokej
  yellow: "jump",     // žlutý klíč → skok do dálky
  green:  "dive",     // zelený klíč → potápění
};

export const MINIGAME_TITLE: Record<MinigameKind, string> = {
  ski:    "Lyžování",
  hockey: "Hokej",
  jump:   "Skok do dálky",
  dive:   "Potápění",
};

export interface Door {
  id: string;       // unique persistent id
  col: number;
  row: number;
  color: KeyColor;
}

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

export type ItemKind = "fish" | "egg" | "medal" | "flag" | "crystal" | "heart" | "key" | "chick";

export type SfxKind =
  | "mlask"   // sběr ryby
  | "pop"     // sběr vejce
  | "ding"    // sběr medaile / vlajky / krystalu
  | "gulp"    // sběr srdíčka (život)
  | "zbunk"   // přechod mezi místnostmi
  | "boing"   // skok
  | "ouch"    // ztráta života
  | "bzzt"    // game over
  | "tada"    // výhra
  | "peep"    // mládě se přidalo do follow-train
  | "fanfare"; // mláďata doručena do iglu

export interface Item {
  kind: ItemKind;
  x: number;  // tile col
  y: number;  // tile row
  id: string; // unique (room + index) for tracking
  keyColor?: KeyColor;  // only for kind === "key"
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
  doors?: Door[];                    // locked doors that trigger a minigame
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

// Mládě následující hráče v "lemmings"-stylu — pamatuje si zpožděnou pozici
// (delay buffer), takže prochází stejnou cestou s odstupem.
export interface Chick {
  id: string;          // unique (originalRoom + index) — survives follow-train
  x: number;
  y: number;
  facing: 1 | -1;
  trail: { x: number; y: number; facing: 1 | -1 }[]; // buffer pozic hráče za posledních N tiků
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
  keys: Set<KeyColor>;            // collected keys
  openedDoors: Set<string>;       // door ids that have been unlocked
  paused: boolean;                // true while a minigame is active
  chicks: Chick[];                // mláďata aktuálně následující hráče
  deliveredChicks: number;        // počet doručených mláďat do iglu (cumulative)
  score: number;                  // body — items + bonus za chicks
}

export interface GameHud {
  roomName: string;
  roomIndex: number;     // 1-based
  totalRooms: number;
  hint: string | null;
  lives: number;
  collected: number;
  total: number;
  keys: KeyColor[];      // colors of keys currently held
  chicksFollowing: number;  // mláďata aktuálně v doprovodu
  chicksDelivered: number;  // mláďata doručená do iglu (kumulativně)
  score: number;
}

export interface GameHooks {
  onHud(_h: GameHud): void;
  onWin(_timeSec: number): void;
  onGameover(): void;
  onSfx(_kind: SfxKind): void;
  onMinigame(_kind: MinigameKind, _doorId: string): void;
}
