export interface PuzzleImage {
  src: string;
  alt: string;
  speciesName: string;
  speciesSlug: string;
  author: string;
  license: string;
}

export interface Piece {
  idx: number;          // stable index 0..N-1
  col: number;
  row: number;
  sx: number;           // source x in the image
  sy: number;
  sw: number;           // source width
  sh: number;
  targetX: number;      // target x in target region (viewport coords)
  targetY: number;
  currentX: number;     // current position (viewport coords)
  currentY: number;
  placed: boolean;
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
