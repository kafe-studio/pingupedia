import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const iucnStatus = z.enum(["LC", "NT", "VU", "EN", "CR", "DD", "EX"]);

const sourceType = z.enum([
  "Wikipedia",
  "IUCN",
  "BirdLife",
  "Science",
  "Museum",
  "Other",
]);

const rangeTuple = z.tuple([z.number().positive(), z.number().positive()]);

const source = z.object({
  url: z.url(),
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
      habitat: z.string().min(1),
      diet: z.array(z.string()).min(1),
      lifespan: z.object({
        wildYears: z.number().positive(),
        captivityYears: z.number().positive().optional(),
      }),
      population: z.string().optional(),
      historicalNotes: z.string().optional(),
      hero: z.object({
        src: image(),
        alt: z.string().min(1),
        author: z.string().min(1),
        license: z.string().min(1),
        sourceUrl: z.url(),
      }),
      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string().min(1),
            author: z.string().min(1),
            license: z.string().min(1),
            sourceUrl: z.url(),
          }),
        )
        .optional(),
      audio: z
        .object({
          mediaUrl: z.url(),
          mimeType: z.string().min(1),
          caption: z.string().min(1),
          author: z.string().min(1),
          license: z.string().min(1),
          sourceUrl: z.url(),
          durationSec: z.number().positive().optional(),
        })
        .optional(),
      video: z
        .object({
          mediaUrl: z.url(),
          mimeType: z.string().min(1),
          caption: z.string().min(1),
          author: z.string().min(1),
          license: z.string().min(1),
          sourceUrl: z.url(),
          durationSec: z.number().positive().optional(),
          posterUrl: z.url().optional(),
        })
        .optional(),
      sources: z.array(source).min(2),
      updatedAt: z.coerce.date(),
    }),
});

export const collections = { species };
