# Maskot Pingu — asset sheet

Pingupedia má vlastního maskota ve 10 pózách. Zdrojový soubor `source.png` je
5×2 grid, který se rozřezává na jednotlivé PNG přes `scripts/split-mascot.mjs`.

## Workflow

1. Ulož zdrojový soubor jako `src/assets/mascot/source.png` (průhledné pozadí).
2. Spusť:
   ```bash
   node scripts/split-mascot.mjs
   ```
3. Skript vyprodukuje 10 PNG podle pozic v gridu:

```
┌───────┬───────┬──────────┬─────┬────────┐
│ ahoj  │ plave │ detektiv │ cte │ radost │   (řádek 1)
├───────┼───────┼──────────┼─────┼────────┤
│ otazka│ palec │ wow      │ srdce│ vajicko│   (řádek 2)
└───────┴───────┴──────────┴─────┴────────┘
```

## Pózy a doporučené použití

| Slug       | Popis                                  | Kde nasadit                                       |
|------------|----------------------------------------|---------------------------------------------------|
| `ahoj`     | Mává na pozdrav                        | Homepage hero, úvodní sekce                        |
| `plave`    | Plave / surfuje ve vodě                | Sekce habitat, win screen her                      |
| `detektiv` | Drží lupu, zkoumá                      | `/druhy/` header, search empty state               |
| `cte`      | Čte knihu s brýlemi                    | `/o-projektu/`, sekce Zdroje na detailu druhu     |
| `radost`   | Ruce nahoru, mrká                      | `/hry/` index, úspěch, achievement                 |
| `otazka`   | Přemýšlí, otazník                      | 404 stránka, neznámý slug                          |
| `palec`    | Palec nahoru, batoh                    | Empty states, "začni tady" CTA                    |
| `wow`      | Překvapený, výkřičníky                 | Reveal sekce, "zajímavost", highlight              |
| `srdce`    | Drží modré srdce                       | Oblíbené / favorites, kredity, poděkování          |
| `vajicko`  | Vyklubává se z vajíčka                 | "Nový obsah" badge, intro animace, newsletter CTA  |

## Licence a autorství

Maskot byl vygenerován pro pingupedia v roce 2026. Je interní brand asset — není
přejímaný z externího zdroje, takže nepatří do `CREDITS.md` pro fotky druhů.

## Nevracet do gitu

`source.png` je primární zdroj; po `split-mascot.mjs` jsou v gitu všech 10
jednotlivých PNG. Pokud maskota měníš:

1. Uprav/nahraď `source.png`
2. Spusť `node scripts/split-mascot.mjs` znovu
3. Commit nových PNG

## Astro integrace

Maskoty se vždy používají přes sdílenou komponentu
`src/components/mascot/Mascot.astro`, která načítá obrázky přes `astro:assets`
a respektuje projektové pravidlo bez ořezu (`object-contain`, aspect-ratio wrapper).
