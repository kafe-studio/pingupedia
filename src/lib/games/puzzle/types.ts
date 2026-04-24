export type Difficulty = "easy" | "medium" | "hard";

export interface PuzzleImage {
  src: string;
  alt: string;
  speciesName: string;
  speciesSlug: string;
  author: string;
  license: string;
}

// Edge = 0 (flat, board border), 1 (tab/knob sticks out), -1 (pocket/socket indent)
export type Edge = 0 | 1 | -1;

export interface Piece {
  idx: number;          // stable index 0..N-1
  col: number;
  row: number;
  sx: number;           // source x in the image (slice origin, no tab expansion)
  sy: number;
  sw: number;           // source slice width (piece body, no tabs)
  sh: number;
  targetX: number;      // target x in target region (viewport coords, slice origin)
  targetY: number;
  currentX: number;     // current position (viewport coords, slice origin)
  currentY: number;
  placed: boolean;
  edges: { top: Edge; right: Edge; bottom: Edge; left: Edge };
}

export interface PuzzleState {
  grid: { cols: number; rows: number };
  pieces: Piece[];
  image: HTMLImageElement;
  imageMeta: PuzzleImage;
  target: { x: number; y: number; w: number; h: number; pieceW: number; pieceH: number };
  placedCount: number;
  dragPieceIdx: number | null;
  dragOffsetX: number;
  dragOffsetY: number;
  peekUntil: number;    // timestamp for "peek" mode
  startTime: number;
  completed: boolean;
}

export interface PuzzleHooks {
  onProgress(_placed: number, _total: number): void;
  onComplete(_elapsedSec: number): void;
  onImage(_meta: PuzzleImage): void;
}
