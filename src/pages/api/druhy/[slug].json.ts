import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const getStaticPaths = (async () => {
  const species = await getCollection("species");
  return species.map((s) => ({ params: { slug: s.id }, props: { entry: s } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as Awaited<
    ReturnType<typeof getCollection<"species">>
  >[number];

  const payload = {
    slug: entry.id,
    nameCs: entry.data.nameCs,
    nameLat: entry.data.nameLat,
    nameEn: entry.data.nameEn,
    genus: entry.data.genus,
    iucnStatus: entry.data.iucnStatus,
    description: entry.data.description,
    size: entry.data.size,
    distribution: entry.data.distribution,
    habitat: entry.data.habitat,
    diet: entry.data.diet,
    lifespan: entry.data.lifespan,
    diving: entry.data.diving,
    population: entry.data.population,
    historicalNotes: entry.data.historicalNotes,
    sources: entry.data.sources,
    updatedAt: entry.data.updatedAt,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
