// Mapová projekce pro pingupedia mapy výskytu.
// world.svg generated z Natural Earth 110m landmasses (Public Domain),
// viewBox 720×360 = ratio 2:1 → čistá equirectangular projekce.
// Markery na lat/lon souřadnice se zobrazí přesně — žádný offset.

export const MAP_WIDTH = 720;
export const MAP_HEIGHT = 360;

/** lat/lon (WGS84) → x/y v souřadnicích SVG world map (720×360, equirectangular). */
export function project(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon + 180) / 360) * MAP_WIDTH;
  const y = ((90 - lat) / 180) * MAP_HEIGHT;
  return { x, y };
}
