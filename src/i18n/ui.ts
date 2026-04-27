// UI translation dictionary — pingupedia
// Pokrývá pouze navigační stringy a labely. Obsah druhů (markdown body) zůstává v češtině.
// Strojový překlad — pro produkční nasazení s nárokem na kvalitu doporučujeme human review pass per locale.

export const LOCALES = [
  "cs", // Čeština (default)
  "en", // English
  "de", // Deutsch
  "fr", // Français
  "es", // Español
  "it", // Italiano
  "pl", // Polski
  "uk", // Українська
] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  cs: "Čeština",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  pl: "Polski",
  uk: "Українська",
};

export type UiKey =
  | "nav.species"
  | "nav.games"
  | "nav.films"
  | "nav.about"
  | "nav.menu"
  | "nav.main"
  | "footer.navigation"
  | "lang.label"
  | "lang.aria"
  | "common.skip"
  | "home.dayBadge"
  | "species.facts"
  | "species.genus"
  | "species.height"
  | "species.weight"
  | "species.habitat"
  | "species.lifespan"
  | "species.lifespan.wild"
  | "species.lifespan.captivity"
  | "species.distribution"
  | "species.diet"
  | "species.diving"
  | "species.depth"
  | "species.duration"
  | "species.population"
  | "species.sources"
  | "species.updated"
  | "druhy.eyebrow"
  | "druhy.cta.continue"
  | "hry.eyebrow"
  | "hry.cta.eyebrow"
  | "filmy.eyebrow"
  | "filmy.note.eyebrow"
  | "about.sources.eyebrow"
  | "about.purpose.eyebrow";

export const ui: Record<Locale, Record<UiKey, string>> = {
  cs: {
    "nav.species": "Druhy", "nav.games": "Hry", "nav.films": "Filmy", "nav.about": "O projektu",
    "nav.menu": "Menu", "nav.main": "Hlavní navigace",
    "footer.navigation": "Navigace",
    "lang.label": "Jazyk", "lang.aria": "Přepínač jazyka",
    "common.skip": "Přeskočit na obsah",
    "home.dayBadge": "Tučňák dne",
    "species.facts": "Fakta", "species.genus": "Rod",
    "species.height": "Výška", "species.weight": "Váha",
    "species.habitat": "Habitat", "species.lifespan": "Délka života",
    "species.lifespan.wild": "ve volné přírodě", "species.lifespan.captivity": "v péči lidí",
    "species.distribution": "Rozšíření", "species.diet": "Strava",
    "species.diving": "Potápění", "species.depth": "Hloubka",
    "species.duration": "Délka ponoru", "species.population": "Populace",
    "species.sources": "Zdroje", "species.updated": "Aktualizováno",
    "druhy.eyebrow": "Encyklopedie", "druhy.cta.continue": "Pokračuj",
    "hry.eyebrow": "Herna", "hry.cta.eyebrow": "Další hry v přípravě",
    "filmy.eyebrow": "Tučňáci na plátně", "filmy.note.eyebrow": "Něco chybí?",
    "about.sources.eyebrow": "Zdroje obsahu", "about.purpose.eyebrow": "Záměr",
  },
  en: {
    "nav.species": "Species", "nav.games": "Games", "nav.films": "Films", "nav.about": "About",
    "nav.menu": "Menu", "nav.main": "Main navigation",
    "footer.navigation": "Navigation",
    "lang.label": "Language", "lang.aria": "Language switcher",
    "common.skip": "Skip to content",
    "home.dayBadge": "Penguin of the day",
    "species.facts": "Facts", "species.genus": "Genus",
    "species.height": "Height", "species.weight": "Weight",
    "species.habitat": "Habitat", "species.lifespan": "Lifespan",
    "species.lifespan.wild": "in the wild", "species.lifespan.captivity": "in human care",
    "species.distribution": "Distribution", "species.diet": "Diet",
    "species.diving": "Diving", "species.depth": "Depth",
    "species.duration": "Dive duration", "species.population": "Population",
    "species.sources": "Sources", "species.updated": "Updated",
    "druhy.eyebrow": "Encyclopedia", "druhy.cta.continue": "Keep exploring",
    "hry.eyebrow": "Arcade", "hry.cta.eyebrow": "More games coming",
    "filmy.eyebrow": "Penguins on screen", "filmy.note.eyebrow": "Missing something?",
    "about.sources.eyebrow": "Content sources", "about.purpose.eyebrow": "Purpose",
  },
  de: {
    "nav.species": "Arten", "nav.games": "Spiele", "nav.films": "Filme", "nav.about": "Über",
    "nav.menu": "Menü", "nav.main": "Hauptnavigation",
    "footer.navigation": "Navigation",
    "lang.label": "Sprache", "lang.aria": "Sprachumschalter",
    "common.skip": "Zum Inhalt springen",
    "home.dayBadge": "Pinguin des Tages",
    "species.facts": "Fakten", "species.genus": "Gattung",
    "species.height": "Höhe", "species.weight": "Gewicht",
    "species.habitat": "Lebensraum", "species.lifespan": "Lebenserwartung",
    "species.lifespan.wild": "in freier Wildbahn", "species.lifespan.captivity": "in Menschenobhut",
    "species.distribution": "Verbreitung", "species.diet": "Ernährung",
    "species.diving": "Tauchen", "species.depth": "Tiefe",
    "species.duration": "Tauchdauer", "species.population": "Population",
    "species.sources": "Quellen", "species.updated": "Aktualisiert",
    "druhy.eyebrow": "Enzyklopädie", "druhy.cta.continue": "Weiter erkunden",
    "hry.eyebrow": "Spielhalle", "hry.cta.eyebrow": "Weitere Spiele in Vorbereitung",
    "filmy.eyebrow": "Pinguine auf der Leinwand", "filmy.note.eyebrow": "Fehlt etwas?",
    "about.sources.eyebrow": "Inhaltsquellen", "about.purpose.eyebrow": "Zweck",
  },
  fr: {
    "nav.species": "Espèces", "nav.games": "Jeux", "nav.films": "Films", "nav.about": "À propos",
    "nav.menu": "Menu", "nav.main": "Navigation principale",
    "footer.navigation": "Navigation",
    "lang.label": "Langue", "lang.aria": "Sélecteur de langue",
    "common.skip": "Aller au contenu",
    "home.dayBadge": "Manchot du jour",
    "species.facts": "Faits", "species.genus": "Genre",
    "species.height": "Taille", "species.weight": "Poids",
    "species.habitat": "Habitat", "species.lifespan": "Longévité",
    "species.lifespan.wild": "dans la nature", "species.lifespan.captivity": "en captivité",
    "species.distribution": "Répartition", "species.diet": "Alimentation",
    "species.diving": "Plongée", "species.depth": "Profondeur",
    "species.duration": "Durée de plongée", "species.population": "Population",
    "species.sources": "Sources", "species.updated": "Mis à jour",
    "druhy.eyebrow": "Encyclopédie", "druhy.cta.continue": "Continuer",
    "hry.eyebrow": "Salle de jeux", "hry.cta.eyebrow": "Plus de jeux en préparation",
    "filmy.eyebrow": "Manchots à l'écran", "filmy.note.eyebrow": "Quelque chose manque ?",
    "about.sources.eyebrow": "Sources du contenu", "about.purpose.eyebrow": "Objectif",
  },
  es: {
    "nav.species": "Especies", "nav.games": "Juegos", "nav.films": "Películas", "nav.about": "Acerca de",
    "nav.menu": "Menú", "nav.main": "Navegación principal",
    "footer.navigation": "Navegación",
    "lang.label": "Idioma", "lang.aria": "Selector de idioma",
    "common.skip": "Saltar al contenido",
    "home.dayBadge": "Pingüino del día",
    "species.facts": "Datos", "species.genus": "Género",
    "species.height": "Altura", "species.weight": "Peso",
    "species.habitat": "Hábitat", "species.lifespan": "Esperanza de vida",
    "species.lifespan.wild": "en estado salvaje", "species.lifespan.captivity": "al cuidado humano",
    "species.distribution": "Distribución", "species.diet": "Dieta",
    "species.diving": "Buceo", "species.depth": "Profundidad",
    "species.duration": "Duración de buceo", "species.population": "Población",
    "species.sources": "Fuentes", "species.updated": "Actualizado",
    "druhy.eyebrow": "Enciclopedia", "druhy.cta.continue": "Continuar",
    "hry.eyebrow": "Sala de juegos", "hry.cta.eyebrow": "Más juegos en preparación",
    "filmy.eyebrow": "Pingüinos en pantalla", "filmy.note.eyebrow": "¿Falta algo?",
    "about.sources.eyebrow": "Fuentes del contenido", "about.purpose.eyebrow": "Propósito",
  },
  it: {
    "nav.species": "Specie", "nav.games": "Giochi", "nav.films": "Film", "nav.about": "Informazioni",
    "nav.menu": "Menu", "nav.main": "Navigazione principale",
    "footer.navigation": "Navigazione",
    "lang.label": "Lingua", "lang.aria": "Selettore di lingua",
    "common.skip": "Vai al contenuto",
    "home.dayBadge": "Pinguino del giorno",
    "species.facts": "Fatti", "species.genus": "Genere",
    "species.height": "Altezza", "species.weight": "Peso",
    "species.habitat": "Habitat", "species.lifespan": "Longevità",
    "species.lifespan.wild": "in natura", "species.lifespan.captivity": "in cattività",
    "species.distribution": "Distribuzione", "species.diet": "Dieta",
    "species.diving": "Immersione", "species.depth": "Profondità",
    "species.duration": "Durata d'immersione", "species.population": "Popolazione",
    "species.sources": "Fonti", "species.updated": "Aggiornato",
    "druhy.eyebrow": "Enciclopedia", "druhy.cta.continue": "Continua",
    "hry.eyebrow": "Sala giochi", "hry.cta.eyebrow": "Altri giochi in arrivo",
    "filmy.eyebrow": "Pinguini sullo schermo", "filmy.note.eyebrow": "Manca qualcosa?",
    "about.sources.eyebrow": "Fonti del contenuto", "about.purpose.eyebrow": "Scopo",
  },
  pl: {
    "nav.species": "Gatunki", "nav.games": "Gry", "nav.films": "Filmy", "nav.about": "O projekcie",
    "nav.menu": "Menu", "nav.main": "Główna nawigacja",
    "footer.navigation": "Nawigacja",
    "lang.label": "Język", "lang.aria": "Przełącznik języka",
    "common.skip": "Przejdź do treści",
    "home.dayBadge": "Pingwin dnia",
    "species.facts": "Fakty", "species.genus": "Rodzaj",
    "species.height": "Wzrost", "species.weight": "Waga",
    "species.habitat": "Siedlisko", "species.lifespan": "Długość życia",
    "species.lifespan.wild": "na wolności", "species.lifespan.captivity": "pod opieką ludzi",
    "species.distribution": "Występowanie", "species.diet": "Pożywienie",
    "species.diving": "Nurkowanie", "species.depth": "Głębokość",
    "species.duration": "Czas nurkowania", "species.population": "Populacja",
    "species.sources": "Źródła", "species.updated": "Zaktualizowano",
    "druhy.eyebrow": "Encyklopedia", "druhy.cta.continue": "Kontynuuj",
    "hry.eyebrow": "Salon gier", "hry.cta.eyebrow": "Więcej gier w przygotowaniu",
    "filmy.eyebrow": "Pingwiny na ekranie", "filmy.note.eyebrow": "Czegoś brakuje?",
    "about.sources.eyebrow": "Źródła treści", "about.purpose.eyebrow": "Cel",
  },
  uk: {
    "nav.species": "Види", "nav.games": "Ігри", "nav.films": "Фільми", "nav.about": "Про проєкт",
    "nav.menu": "Меню", "nav.main": "Головна навігація",
    "footer.navigation": "Навігація",
    "lang.label": "Мова", "lang.aria": "Перемикач мови",
    "common.skip": "Перейти до вмісту",
    "home.dayBadge": "Пінгвін дня",
    "species.facts": "Факти", "species.genus": "Рід",
    "species.height": "Зріст", "species.weight": "Вага",
    "species.habitat": "Середовище", "species.lifespan": "Тривалість життя",
    "species.lifespan.wild": "у дикій природі", "species.lifespan.captivity": "під опікою людей",
    "species.distribution": "Поширення", "species.diet": "Раціон",
    "species.diving": "Пірнання", "species.depth": "Глибина",
    "species.duration": "Тривалість пірнання", "species.population": "Популяція",
    "species.sources": "Джерела", "species.updated": "Оновлено",
    "druhy.eyebrow": "Енциклопедія", "druhy.cta.continue": "Продовжити",
    "hry.eyebrow": "Ігротека", "hry.cta.eyebrow": "Інші ігри готуються",
    "filmy.eyebrow": "Пінгвіни на екрані", "filmy.note.eyebrow": "Чогось не вистачає?",
    "about.sources.eyebrow": "Джерела вмісту", "about.purpose.eyebrow": "Мета",
  },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// Map URL path -> i18n key for navigation links (single source of truth).
export const NAV_KEY_BY_HREF: Record<string, UiKey> = {
  "/druhy/": "nav.species",
  "/hry/": "nav.games",
  "/filmy/": "nav.films",
  "/o-projektu/": "nav.about",
};
