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

const site = defineCollection({
  loader: glob({ pattern: "config.json", base: "./src/content/site" }),
  schema: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    url: z.url(),
    lang: z.string().min(2),
    locale: z.string().min(2),
    author: z.string(),
    twitter: z.string(),
    ogImage: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string(),
    socialLinks: z.object({
      instagram: z.string(),
      facebook: z.string(),
    }),
    navLinks: z
      .array(z.object({ text: z.string().min(1), href: z.string().min(1) }))
      .min(1),
  }),
});

const slugRe = /^[a-z0-9-]+$/;

const home = defineCollection({
  loader: glob({ pattern: "home.json", base: "./src/content/pages" }),
  schema: z.object({
    hero: z.object({
      eyebrow: z.string().min(1),
      titleHtml: z.string().min(1),
      subtitle: z.string().min(1),
    }),
    featured: z.object({
      badge: z.string().min(1),
      slug: z.string().regex(slugRe),
      titleHtml: z.string().min(1),
      description: z.string().min(1),
      imageAlt: z.string().min(1),
    }),
    stats: z.object({
      eyebrow: z.string().min(1),
      subtitle: z.string().min(1),
    }),
    catalogCta: z.object({
      eyebrow: z.string().min(1),
      titleHtml: z.string().min(1),
      subtitle: z.string().min(1),
    }),
    speciesCards: z
      .array(
        z.object({
          slug: z.string().regex(slugRe),
          genus: z.string().min(1),
          name: z.string().min(1),
          alt: z.string().min(1),
        }),
      )
      .min(1),
    howSection: z.object({
      eyebrow: z.string().min(1),
      titleHtml: z.string().min(1),
      items: z.array(z.string().min(1)).min(1),
    }),
    aboutCta: z.object({
      eyebrow: z.string().min(1),
      titleHtml: z.string().min(1),
      description: z.string().min(1),
    }),
  }),
});

const statItem = z.union([
  z.object({ label: z.string().min(1), dynamic: z.enum(["species", "genus"]) }),
  z.object({ label: z.string().min(1), value: z.string().min(1) }),
]);

const oProjektu = defineCollection({
  loader: glob({ pattern: "o-projektu.json", base: "./src/content/pages" }),
  schema: z.object({
    meta: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
    hero: z.object({
      eyebrow: z.string().min(1),
      titleHtml: z.string().min(1),
      subtitle: z.string().min(1),
    }),
    purpose: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      body: z.string().min(1),
    }),
    audience: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      subtitle: z.string().min(1),
    }),
    sources: z.object({
      eyebrow: z.string().min(1),
      items: z.array(z.string().min(1)).min(1),
    }),
    imageRules: z.object({
      eyebrow: z.string().min(1),
      itemsHtml: z.array(z.string().min(1)).min(1),
    }),
    stats: z.object({
      eyebrow: z.string().min(1),
      items: z.array(statItem).min(1),
    }),
    tech: z.object({
      eyebrow: z.string().min(1),
      body: z.string().min(1),
      badges: z.array(z.string().min(1)).min(1),
    }),
    catalogCta: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
    }),
    gamesCta: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
    }),
  }),
});

export const collections = { species, site, home, oProjektu };
