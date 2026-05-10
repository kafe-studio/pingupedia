import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import {
  siteSchema,
  homeSchema,
  oProjektuSchema,
  hrySchema,
  quizSchema,
  filmySchema,
  timelineSchema,
  chovySchema,
} from "./lib/content-schemas";

const iucnStatus = z.enum(["LC", "NT", "VU", "EN", "CR", "DD", "EX"]);

const sourceType = z.enum([
  "Wikipedia",
  "IUCN",
  "BirdLife",
  "Science",
  "Museum",
  "Other",
]);

const rangeTuple = z
  .tuple([z.number().positive(), z.number().positive()])
  .refine(([min, max]) => min <= max, { message: "Range tuple musí splňovat min ≤ max." });

const httpsUrl = z.url().refine((u) => u.startsWith("https://"), {
  message: "URL musí začínat https://",
});

const source = z.object({
  url: httpsUrl,
  title: z.string().min(1),
  type: sourceType,
  note: z.string().optional(),
});

const species = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/species" }),
  schema: ({ image }) =>
    z.object({
      nameCs: z.string().min(1),
      nameLat: z.string().min(1),
      nameEn: z.string().optional(),
      genus: z.string().min(1),
      iucnStatus,
      description: z.string().max(240),
      size: z.object({
        heightCm: rangeTuple,
        weightKg: rangeTuple,
      }),
      distribution: z.array(z.string()).min(1),
      colonies: z
        .array(
          z.object({
            name: z.string().min(1),
            lat: z.number().min(-90).max(90),
            lon: z.number().min(-180).max(180),
            type: z.enum(["breeding", "wintering", "vagrant"]).optional(),
            description: z.string().optional(),
          }),
        )
        .optional(),
      habitat: z.string().min(1),
      diet: z.array(z.string()).min(1),
      lifespan: z.object({
        wildYears: z.number().positive(),
        captivityYears: z.number().positive().optional(),
      }),
      diving: z
        .object({
          typicalDepthM: z.number().positive().optional(),
          maxDepthM: z.number().positive().optional(),
          typicalDurationSec: z.number().positive().optional(),
          maxDurationSec: z.number().positive().optional(),
          note: z.string().optional(),
        })
        .optional(),
      population: z.string().optional(),
      historicalNotes: z.string().optional(),
      hero: z.object({
        src: image(),
        alt: z.string().min(1),
        author: z.string().min(1),
        license: z.string().min(1),
        sourceUrl: httpsUrl,
      }),
      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string().min(1),
            author: z.string().min(1),
            license: z.string().min(1),
            sourceUrl: httpsUrl,
          }),
        )
        .optional(),
      audio: z
        .object({
          mediaUrl: httpsUrl,
          mimeType: z.string().min(1),
          caption: z.string().min(1),
          author: z.string().min(1),
          license: z.string().min(1),
          sourceUrl: httpsUrl,
          durationSec: z.number().positive().optional(),
        })
        .optional(),
      video: z
        .object({
          mediaUrl: httpsUrl,
          mimeType: z.string().min(1),
          caption: z.string().min(1),
          author: z.string().min(1),
          license: z.string().min(1),
          sourceUrl: httpsUrl,
          durationSec: z.number().positive().optional(),
          posterUrl: httpsUrl.optional(),
        })
        .optional(),
      sources: z.array(source).min(2),
      updatedAt: z.coerce.date(),
    }),
});

const site = defineCollection({
  loader: glob({ pattern: "config.json", base: "./src/content/site" }),
  schema: siteSchema,
});

const home = defineCollection({
  loader: glob({ pattern: "home.json", base: "./src/content/pages" }),
  schema: homeSchema,
});

const oProjektu = defineCollection({
  loader: glob({ pattern: "o-projektu.json", base: "./src/content/pages" }),
  schema: oProjektuSchema,
});

const hry = defineCollection({
  loader: glob({ pattern: "hry.json", base: "./src/content/pages" }),
  schema: hrySchema,
});

const quiz = defineCollection({
  loader: glob({ pattern: "quiz.json", base: "./src/content" }),
  schema: quizSchema,
});

const filmy = defineCollection({
  loader: glob({ pattern: "filmy.json", base: "./src/content/pages" }),
  schema: filmySchema,
});

const timeline = defineCollection({
  loader: glob({ pattern: "timeline.json", base: "./src/content/pages" }),
  schema: timelineSchema,
});

const chovy = defineCollection({
  loader: glob({ pattern: "chovy.json", base: "./src/content/pages" }),
  schema: chovySchema,
});

export const collections = { species, site, home, oProjektu, hry, quiz, filmy, timeline, chovy };
