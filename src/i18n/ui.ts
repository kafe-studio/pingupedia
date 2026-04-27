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
  da: {
    "nav.species": "Arter", "nav.games": "Spil", "nav.films": "Film", "nav.about": "Om",
    "nav.menu": "Menu", "nav.main": "Hovednavigation",
    "footer.navigation": "Navigation",
    "lang.label": "Sprog", "lang.aria": "Sprogvælger",
    "common.skip": "Gå til indhold",
    "home.dayBadge": "Dagens pingvin",
    "species.facts": "Fakta", "species.genus": "Slægt",
    "species.height": "Højde", "species.weight": "Vægt",
    "species.habitat": "Levested", "species.lifespan": "Levetid",
    "species.lifespan.wild": "i naturen", "species.lifespan.captivity": "i menneskelig pleje",
    "species.distribution": "Udbredelse", "species.diet": "Føde",
    "species.diving": "Dykning", "species.depth": "Dybde",
    "species.duration": "Dykkevarighed", "species.population": "Bestand",
    "species.sources": "Kilder", "species.updated": "Opdateret",
    "druhy.eyebrow": "Encyklopædi", "druhy.cta.continue": "Fortsæt",
    "hry.eyebrow": "Spillehal", "hry.cta.eyebrow": "Flere spil på vej",
    "filmy.eyebrow": "Pingviner på skærmen", "filmy.note.eyebrow": "Mangler der noget?",
    "about.sources.eyebrow": "Indholdskilder", "about.purpose.eyebrow": "Formål",
  },
  sv: {
    "nav.species": "Arter", "nav.games": "Spel", "nav.films": "Filmer", "nav.about": "Om",
    "nav.menu": "Meny", "nav.main": "Huvudnavigering",
    "footer.navigation": "Navigering",
    "lang.label": "Språk", "lang.aria": "Språkväljare",
    "common.skip": "Hoppa till innehåll",
    "home.dayBadge": "Dagens pingvin",
    "species.facts": "Fakta", "species.genus": "Släkte",
    "species.height": "Höjd", "species.weight": "Vikt",
    "species.habitat": "Habitat", "species.lifespan": "Livslängd",
    "species.lifespan.wild": "i det vilda", "species.lifespan.captivity": "i mänsklig vård",
    "species.distribution": "Utbredning", "species.diet": "Föda",
    "species.diving": "Dykning", "species.depth": "Djup",
    "species.duration": "Dyklängd", "species.population": "Population",
    "species.sources": "Källor", "species.updated": "Uppdaterat",
    "druhy.eyebrow": "Encyklopedi", "druhy.cta.continue": "Fortsätt",
    "hry.eyebrow": "Spelhall", "hry.cta.eyebrow": "Fler spel på gång",
    "filmy.eyebrow": "Pingviner på duken", "filmy.note.eyebrow": "Saknas något?",
    "about.sources.eyebrow": "Innehållskällor", "about.purpose.eyebrow": "Syfte",
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
  kl: {
    "nav.species": "Suussusiit", "nav.games": "Pinnguartitsiviit", "nav.films": "Filmit", "nav.about": "Pillugu",
    "nav.menu": "Menu", "nav.main": "Pingaarnermik nikitsineq",
    "footer.navigation": "Nikitsineq",
    "lang.label": "Oqaatsit", "lang.aria": "Oqaatsinik toraartuisut",
    "common.skip": "Atugassanut ingerlaqqigit",
    "home.dayBadge": "Ullup pingvinia",
    "species.facts": "Paasissutissat", "species.genus": "Suussusii",
    "species.height": "Portunera", "species.weight": "Oqimaassusaa",
    "species.habitat": "Najugaa", "species.lifespan": "Inuussutsi sivisussusaa",
    "species.lifespan.wild": "nunami", "species.lifespan.captivity": "inunnit isumagineqarluni",
    "species.distribution": "Najugaqarfii", "species.diet": "Nerisartagai",
    "species.diving": "Aappuneq", "species.depth": "Itissusaa",
    "species.duration": "Aappunerup sivisussusaa", "species.population": "Amerlassusaa",
    "species.sources": "Tunngaviit", "species.updated": "Nutartereersimasoq",
    "druhy.eyebrow": "Encyclopedia", "druhy.cta.continue": "Ingerlaqqigit",
    "hry.eyebrow": "Pinnguarfik", "hry.cta.eyebrow": "Allatqavittut pinnguartitsiviit",
    "filmy.eyebrow": "Pingvinit filminiittut", "filmy.note.eyebrow": "Suna amigaateqarpa?",
    "about.sources.eyebrow": "Atugassat tunngaviat", "about.purpose.eyebrow": "Siunertaq",
  },
  pt: {
    "nav.species": "Espécies", "nav.games": "Jogos", "nav.films": "Filmes", "nav.about": "Sobre",
    "nav.menu": "Menu", "nav.main": "Navegação principal",
    "footer.navigation": "Navegação",
    "lang.label": "Idioma", "lang.aria": "Seletor de idioma",
    "common.skip": "Saltar para o conteúdo",
    "home.dayBadge": "Pinguim do dia",
    "species.facts": "Factos", "species.genus": "Género",
    "species.height": "Altura", "species.weight": "Peso",
    "species.habitat": "Habitat", "species.lifespan": "Longevidade",
    "species.lifespan.wild": "em estado selvagem", "species.lifespan.captivity": "ao cuidado humano",
    "species.distribution": "Distribuição", "species.diet": "Dieta",
    "species.diving": "Mergulho", "species.depth": "Profundidade",
    "species.duration": "Duração do mergulho", "species.population": "População",
    "species.sources": "Fontes", "species.updated": "Atualizado",
    "druhy.eyebrow": "Enciclopédia", "druhy.cta.continue": "Continuar",
    "hry.eyebrow": "Sala de jogos", "hry.cta.eyebrow": "Mais jogos a caminho",
    "filmy.eyebrow": "Pinguins no ecrã", "filmy.note.eyebrow": "Falta alguma coisa?",
    "about.sources.eyebrow": "Fontes do conteúdo", "about.purpose.eyebrow": "Propósito",
  },
  hu: {
    "nav.species": "Fajok", "nav.games": "Játékok", "nav.films": "Filmek", "nav.about": "A projektről",
    "nav.menu": "Menü", "nav.main": "Főmenü",
    "footer.navigation": "Navigáció",
    "lang.label": "Nyelv", "lang.aria": "Nyelvválasztó",
    "common.skip": "Ugrás a tartalomhoz",
    "home.dayBadge": "A nap pingvinje",
    "species.facts": "Tények", "species.genus": "Nem",
    "species.height": "Magasság", "species.weight": "Tömeg",
    "species.habitat": "Élőhely", "species.lifespan": "Élettartam",
    "species.lifespan.wild": "a vadonban", "species.lifespan.captivity": "emberi gondozásban",
    "species.distribution": "Elterjedés", "species.diet": "Táplálkozás",
    "species.diving": "Búvárkodás", "species.depth": "Mélység",
    "species.duration": "Merülési idő", "species.population": "Populáció",
    "species.sources": "Források", "species.updated": "Frissítve",
    "druhy.eyebrow": "Enciklopédia", "druhy.cta.continue": "Folytatás",
    "hry.eyebrow": "Játékterem", "hry.cta.eyebrow": "További játékok készülnek",
    "filmy.eyebrow": "Pingvinek a vásznon", "filmy.note.eyebrow": "Hiányzik valami?",
    "about.sources.eyebrow": "Tartalmi források", "about.purpose.eyebrow": "Cél",
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
  ja: {
    "nav.species": "種", "nav.games": "ゲーム", "nav.films": "映画", "nav.about": "プロジェクトについて",
    "nav.menu": "メニュー", "nav.main": "メインナビゲーション",
    "footer.navigation": "ナビゲーション",
    "lang.label": "言語", "lang.aria": "言語切り替え",
    "common.skip": "コンテンツへスキップ",
    "home.dayBadge": "今日のペンギン",
    "species.facts": "事実", "species.genus": "属",
    "species.height": "身長", "species.weight": "体重",
    "species.habitat": "生息地", "species.lifespan": "寿命",
    "species.lifespan.wild": "野生", "species.lifespan.captivity": "飼育下",
    "species.distribution": "分布", "species.diet": "食性",
    "species.diving": "潜水", "species.depth": "深度",
    "species.duration": "潜水時間", "species.population": "個体数",
    "species.sources": "出典", "species.updated": "更新日",
    "druhy.eyebrow": "百科事典", "druhy.cta.continue": "続ける",
    "hry.eyebrow": "ゲームコーナー", "hry.cta.eyebrow": "他のゲームも準備中",
    "filmy.eyebrow": "スクリーンのペンギン", "filmy.note.eyebrow": "何か足りないですか？",
    "about.sources.eyebrow": "コンテンツの出典", "about.purpose.eyebrow": "目的",
  },
  ko: {
    "nav.species": "종", "nav.games": "게임", "nav.films": "영화", "nav.about": "프로젝트 소개",
    "nav.menu": "메뉴", "nav.main": "기본 탐색",
    "footer.navigation": "탐색",
    "lang.label": "언어", "lang.aria": "언어 전환",
    "common.skip": "본문으로 건너뛰기",
    "home.dayBadge": "오늘의 펭귄",
    "species.facts": "사실", "species.genus": "속",
    "species.height": "키", "species.weight": "몸무게",
    "species.habitat": "서식지", "species.lifespan": "수명",
    "species.lifespan.wild": "야생에서", "species.lifespan.captivity": "사람 보호 하에",
    "species.distribution": "분포", "species.diet": "먹이",
    "species.diving": "잠수", "species.depth": "깊이",
    "species.duration": "잠수 시간", "species.population": "개체수",
    "species.sources": "출처", "species.updated": "업데이트",
    "druhy.eyebrow": "백과사전", "druhy.cta.continue": "계속하기",
    "hry.eyebrow": "게임존", "hry.cta.eyebrow": "더 많은 게임 준비 중",
    "filmy.eyebrow": "화면 속 펭귄", "filmy.note.eyebrow": "빠진 게 있나요?",
    "about.sources.eyebrow": "콘텐츠 출처", "about.purpose.eyebrow": "목적",
  },
  zh: {
    "nav.species": "物种", "nav.games": "游戏", "nav.films": "电影", "nav.about": "关于",
    "nav.menu": "菜单", "nav.main": "主导航",
    "footer.navigation": "导航",
    "lang.label": "语言", "lang.aria": "语言切换",
    "common.skip": "跳到内容",
    "home.dayBadge": "今日企鹅",
    "species.facts": "事实", "species.genus": "属",
    "species.height": "身高", "species.weight": "体重",
    "species.habitat": "栖息地", "species.lifespan": "寿命",
    "species.lifespan.wild": "在野外", "species.lifespan.captivity": "人工照料下",
    "species.distribution": "分布", "species.diet": "食性",
    "species.diving": "潜水", "species.depth": "深度",
    "species.duration": "潜水时长", "species.population": "数量",
    "species.sources": "来源", "species.updated": "更新于",
    "druhy.eyebrow": "百科全书", "druhy.cta.continue": "继续浏览",
    "hry.eyebrow": "游戏厅", "hry.cta.eyebrow": "更多游戏即将推出",
    "filmy.eyebrow": "银幕上的企鹅", "filmy.note.eyebrow": "缺少什么吗？",
    "about.sources.eyebrow": "内容来源", "about.purpose.eyebrow": "目的",
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
