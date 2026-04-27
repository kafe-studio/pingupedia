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
  "da", // Dansk
  "sv", // Svenska
  "pl", // Polski
  "kl", // Kalaallisut (Greenlandic)
  "pt", // Português
  "hu", // Magyar
  "uk", // Українська
  "ja", // 日本語
  "ko", // 한국어
  "zh", // 中文 (zjednodušená)
] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  cs: "Čeština",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  da: "Dansk",
  sv: "Svenska",
  pl: "Polski",
  kl: "Kalaallisut",
  pt: "Português",
  hu: "Magyar",
  uk: "Українська",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
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
  | "lang.aria";

export const ui: Record<Locale, Record<UiKey, string>> = {
  cs: {
    "nav.species": "Druhy",
    "nav.games": "Hry",
    "nav.films": "Filmy",
    "nav.about": "O projektu",
    "nav.menu": "Menu",
    "nav.main": "Hlavní navigace",
    "footer.navigation": "Navigace",
    "lang.label": "Jazyk",
    "lang.aria": "Přepínač jazyka",
  },
  en: {
    "nav.species": "Species",
    "nav.games": "Games",
    "nav.films": "Films",
    "nav.about": "About",
    "nav.menu": "Menu",
    "nav.main": "Main navigation",
    "footer.navigation": "Navigation",
    "lang.label": "Language",
    "lang.aria": "Language switcher",
  },
  de: {
    "nav.species": "Arten",
    "nav.games": "Spiele",
    "nav.films": "Filme",
    "nav.about": "Über",
    "nav.menu": "Menü",
    "nav.main": "Hauptnavigation",
    "footer.navigation": "Navigation",
    "lang.label": "Sprache",
    "lang.aria": "Sprachumschalter",
  },
  fr: {
    "nav.species": "Espèces",
    "nav.games": "Jeux",
    "nav.films": "Films",
    "nav.about": "À propos",
    "nav.menu": "Menu",
    "nav.main": "Navigation principale",
    "footer.navigation": "Navigation",
    "lang.label": "Langue",
    "lang.aria": "Sélecteur de langue",
  },
  es: {
    "nav.species": "Especies",
    "nav.games": "Juegos",
    "nav.films": "Películas",
    "nav.about": "Acerca de",
    "nav.menu": "Menú",
    "nav.main": "Navegación principal",
    "footer.navigation": "Navegación",
    "lang.label": "Idioma",
    "lang.aria": "Selector de idioma",
  },
  it: {
    "nav.species": "Specie",
    "nav.games": "Giochi",
    "nav.films": "Film",
    "nav.about": "Informazioni",
    "nav.menu": "Menu",
    "nav.main": "Navigazione principale",
    "footer.navigation": "Navigazione",
    "lang.label": "Lingua",
    "lang.aria": "Selettore di lingua",
  },
  da: {
    "nav.species": "Arter",
    "nav.games": "Spil",
    "nav.films": "Film",
    "nav.about": "Om",
    "nav.menu": "Menu",
    "nav.main": "Hovednavigation",
    "footer.navigation": "Navigation",
    "lang.label": "Sprog",
    "lang.aria": "Sprogvælger",
  },
  sv: {
    "nav.species": "Arter",
    "nav.games": "Spel",
    "nav.films": "Filmer",
    "nav.about": "Om",
    "nav.menu": "Meny",
    "nav.main": "Huvudnavigering",
    "footer.navigation": "Navigering",
    "lang.label": "Språk",
    "lang.aria": "Språkväljare",
  },
  pl: {
    "nav.species": "Gatunki",
    "nav.games": "Gry",
    "nav.films": "Filmy",
    "nav.about": "O projekcie",
    "nav.menu": "Menu",
    "nav.main": "Główna nawigacja",
    "footer.navigation": "Nawigacja",
    "lang.label": "Język",
    "lang.aria": "Przełącznik języka",
  },
  kl: {
    "nav.species": "Suussusiit",
    "nav.games": "Pinnguartitsiviit",
    "nav.films": "Filmit",
    "nav.about": "Pillugu",
    "nav.menu": "Menu",
    "nav.main": "Pingaarnermik nikitsineq",
    "footer.navigation": "Nikitsineq",
    "lang.label": "Oqaatsit",
    "lang.aria": "Oqaatsinik toraartuisut",
  },
  pt: {
    "nav.species": "Espécies",
    "nav.games": "Jogos",
    "nav.films": "Filmes",
    "nav.about": "Sobre",
    "nav.menu": "Menu",
    "nav.main": "Navegação principal",
    "footer.navigation": "Navegação",
    "lang.label": "Idioma",
    "lang.aria": "Seletor de idioma",
  },
  hu: {
    "nav.species": "Fajok",
    "nav.games": "Játékok",
    "nav.films": "Filmek",
    "nav.about": "A projektről",
    "nav.menu": "Menü",
    "nav.main": "Főmenü",
    "footer.navigation": "Navigáció",
    "lang.label": "Nyelv",
    "lang.aria": "Nyelvválasztó",
  },
  uk: {
    "nav.species": "Види",
    "nav.games": "Ігри",
    "nav.films": "Фільми",
    "nav.about": "Про проєкт",
    "nav.menu": "Меню",
    "nav.main": "Головна навігація",
    "footer.navigation": "Навігація",
    "lang.label": "Мова",
    "lang.aria": "Перемикач мови",
  },
  ja: {
    "nav.species": "種",
    "nav.games": "ゲーム",
    "nav.films": "映画",
    "nav.about": "プロジェクトについて",
    "nav.menu": "メニュー",
    "nav.main": "メインナビゲーション",
    "footer.navigation": "ナビゲーション",
    "lang.label": "言語",
    "lang.aria": "言語切り替え",
  },
  ko: {
    "nav.species": "종",
    "nav.games": "게임",
    "nav.films": "영화",
    "nav.about": "프로젝트 소개",
    "nav.menu": "메뉴",
    "nav.main": "기본 탐색",
    "footer.navigation": "탐색",
    "lang.label": "언어",
    "lang.aria": "언어 전환",
  },
  zh: {
    "nav.species": "物种",
    "nav.games": "游戏",
    "nav.films": "电影",
    "nav.about": "关于",
    "nav.menu": "菜单",
    "nav.main": "主导航",
    "footer.navigation": "导航",
    "lang.label": "语言",
    "lang.aria": "语言切换",
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
