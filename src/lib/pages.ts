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
