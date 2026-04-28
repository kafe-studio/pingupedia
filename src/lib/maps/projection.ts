// Mapová projekce pro pingupedia mapy výskytu.
// world.svg z Wikimedia Commons (BlankMap-World, Public Domain) — viewBox 950×620.
// Přibližně equirectangular s lehkou modifikací: -180..180° lon → 0..950 px,
// 90..-90° lat → 0..620 px (sever nahoře). Pro účely vizualizace kolonií
// tučňáků je odchylka pod 1° řádu — dostatečně přesné.

export const MAP_WIDTH = 950;
export const MAP_HEIGHT = 620;

/** lat/lon (WGS84) → x/y v souřadnicích SVG world map (950×620). */
export function project(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon + 180) / 360) * MAP_WIDTH;
  const y = ((90 - lat) / 180) * MAP_HEIGHT;
  return { x, y };
}
