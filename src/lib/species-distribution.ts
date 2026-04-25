// Geo lookup pro mapu výskytu tučňáků.
// Equirectangular projection — function project(lng, lat) -> {x, y}
// viewBox je 0 0 360 110 (lng -180..180, lat 20..-90, jen jižní polokoule + Galapágy).

export interface Region {
  id: string;
  name: string;        // čeština pro tooltip
  lng: number;         // longitude (E pos, W neg)
  lat: number;         // latitude (N pos, S neg)
}

export const REGIONS: Record<string, Region> = {
  antarctic_continent: { id: "antarctic_continent", name: "Antarktický kontinent",  lng: 0,    lat: -82 },
  antarctic_peninsula: { id: "antarctic_peninsula", name: "Antarktický poloostrov", lng: -65,  lat: -67 },
  south_georgia:       { id: "south_georgia",       name: "Jižní Georgie",          lng: -36,  lat: -54 },
  falklands:           { id: "falklands",           name: "Falklandy",              lng: -59,  lat: -52 },
  patagonia:           { id: "patagonia",           name: "Patagonie",              lng: -71,  lat: -48 },
  galapagos:           { id: "galapagos",           name: "Galapágy",               lng: -91,  lat: 0   },
  coastal_chile_peru:  { id: "coastal_chile_peru",  name: "Pobřeží Chile a Peru",   lng: -76,  lat: -20 },
  south_africa:        { id: "south_africa",        name: "Jižní Afrika",           lng: 18,   lat: -34 },
  prince_edward:       { id: "prince_edward",       name: "Prince Edwardovy ostrovy", lng: 38, lat: -47 },
  crozet:              { id: "crozet",              name: "Crozetovy ostrovy",      lng: 51,   lat: -46 },
  kerguelen:           { id: "kerguelen",           name: "Kerguelen",              lng: 70,   lat: -49 },
  heard:               { id: "heard",               name: "Heardův ostrov",         lng: 73,   lat: -53 },
  macquarie:           { id: "macquarie",           name: "Macquarie",              lng: 159,  lat: -54 },
  snares:              { id: "snares",              name: "Snares",                 lng: 166,  lat: -48 },
  auckland:            { id: "auckland",            name: "Aucklandovy ostrovy",    lng: 166,  lat: -50 },
  antipodes:           { id: "antipodes",           name: "Antipody",               lng: 178,  lat: -50 },
  bounty:              { id: "bounty",              name: "Bountyho ostrovy",       lng: 179,  lat: -47 },
  fiordland:           { id: "fiordland",           name: "Fiordland (NZ)",         lng: 167,  lat: -45 },
  stewart:             { id: "stewart",             name: "Stewart (NZ)",           lng: 168,  lat: -47 },
  new_zealand_south:   { id: "new_zealand_south",   name: "Jižní ostrov NZ",        lng: 170,  lat: -45 },
  australia_south:     { id: "australia_south",     name: "Jižní Austrálie",        lng: 138,  lat: -38 },
  tristan:             { id: "tristan",             name: "Tristan da Cunha",       lng: -12,  lat: -37 },
  gough:               { id: "gough",               name: "Gough",                  lng: -10,  lat: -41 },
};

// Per-druh seznam regionů (slug = entry.id v species collection).
export const SPECIES_REGIONS: Record<string, string[]> = {
  brylovy:        ["south_africa"],
  cisarsky:       ["antarctic_continent"],
  galapazsky:     ["galapagos"],
  humboldtuv:     ["coastal_chile_peru"],
  krouzkovy:      ["antarctic_continent", "antarctic_peninsula"],
  magellansky:    ["patagonia", "falklands"],
  nejmensi:       ["australia_south", "new_zealand_south"],
  novozelandsky:  ["fiordland", "stewart"],
  osli:           ["antarctic_peninsula", "south_georgia", "kerguelen"],
  patagonsky:     ["south_georgia", "kerguelen", "crozet", "macquarie", "prince_edward"],
  royal:          ["macquarie"],
  sclateruv:      ["antipodes", "bounty"],
  "skalni-jizni": ["falklands", "south_georgia", "crozet", "kerguelen"],
  "skalni-severni":["tristan", "gough"],
  snaresky:       ["snares"],
  uzdickovy:      ["antarctic_peninsula", "south_georgia"],
  zlatovlasy:     ["south_georgia", "crozet", "kerguelen", "prince_edward", "heard"],
  zlutooky:       ["new_zealand_south", "auckland", "stewart"],
};

/** Equirectangular projection (lng,lat) → SVG coords for viewBox 0 0 360 110. */
export function project(lng: number, lat: number): { x: number; y: number } {
  return { x: lng + 180, y: 20 - lat };
}

export function getRegionsForSpecies(slug: string): Region[] {
  const ids = SPECIES_REGIONS[slug] ?? [];
  return ids.map((id) => REGIONS[id]).filter(Boolean);
}
