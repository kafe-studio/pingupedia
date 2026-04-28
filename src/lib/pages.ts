import { getEntry } from "astro:content";

export async function getHomePage() {
  const entry = await getEntry("home", "home");
  if (!entry) throw new Error("src/content/pages/home.json not found");
  return entry.data;
}

export type HomePage = Awaited<ReturnType<typeof getHomePage>>;

export async function getOProjektuPage() {
  const entry = await getEntry("oProjektu", "o-projektu");
  if (!entry) throw new Error("src/content/pages/o-projektu.json not found");
  return entry.data;
}

export type OProjektuPage = Awaited<ReturnType<typeof getOProjektuPage>>;

export async function getHryPage() {
  const entry = await getEntry("hry", "hry");
  if (!entry) throw new Error("src/content/pages/hry.json not found");
  return entry.data;
}

export type HryPage = Awaited<ReturnType<typeof getHryPage>>;

export async function getQuiz() {
  const entry = await getEntry("quiz", "quiz");
  if (!entry) throw new Error("src/content/quiz.json not found");
  return entry.data;
}

export type Quiz = Awaited<ReturnType<typeof getQuiz>>;

export async function getFilmyPage() {
  const entry = await getEntry("filmy", "filmy");
  if (!entry) throw new Error("src/content/pages/filmy.json not found");
  return entry.data;
}

export type FilmyPage = Awaited<ReturnType<typeof getFilmyPage>>;

export async function getTimelinePage() {
  const entry = await getEntry("timeline", "timeline");
  if (!entry) throw new Error("src/content/pages/timeline.json not found");
  return entry.data;
}

export type TimelinePage = Awaited<ReturnType<typeof getTimelinePage>>;
