import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async () => {
  const species = await getCollection("species");

  const payload = {
    schema: "https://pingupedia.kafe.studio/api/druhy.json",
    generated: new Date().toISOString(),
    count: species.length,
    species: species
      .map((s) => ({
        slug: s.id,
        nameCs: s.data.nameCs,
        nameLat: s.data.nameLat,
        nameEn: s.data.nameEn,
        genus: s.data.genus,
        iucnStatus: s.data.iucnStatus,
        description: s.data.description,
        size: s.data.size,
        distribution: s.data.distribution,
        habitat: s.data.habitat,
        diet: s.data.diet,
        lifespan: s.data.lifespan,
        diving: s.data.diving,
        population: s.data.population,
        historicalNotes: s.data.historicalNotes,
        sources: s.data.sources,
        updatedAt: s.data.updatedAt,
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug)),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
