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

const oProjektu = defineCollection({
  loader: glob({ pattern: "o-projektu.json", base: "./src/content/pages" }),
  schema: z.object({
    meta: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
    hero: z.object({
      titleHtml: z.string().min(1),
      subtitle: z.string().min(1),
    }),
    personalNote: z.object({
      body: z.string().min(1),
    }),
    sources: z.object({
      eyebrow: z.string().min(1),
      items: z.array(z.string().min(1)).min(1),
    }),
    purpose: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      body: z.string().min(1),
    }),
    credits: z.object({
      author: z.string().min(1),
      studio: z.string().min(1),
      email: z.email(),
      portfolioUrl: z.url(),
      portfolioLabel: z.string().min(1),
    }),
  }),
});

const hrySlugRe = /^[a-z0-9-]+$/;
const surfaceEnum = z.enum(["aurora", "ocean", "ice", "sun", "candy", "midnight"]);

const hry = defineCollection({
  loader: glob({ pattern: "hry.json", base: "./src/content/pages" }),
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
    games: z
      .array(
        z.object({
          slug: z.string().regex(hrySlugRe),
          title: z.string().min(1),
          tag: z.string().min(1),
          description: z.string().min(1),
          surface: surfaceEnum,
          emoji: z.string().min(1),
        }),
      )
      .min(1),
    cta: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  }),
});

const quiz = defineCollection({
  loader: glob({ pattern: "quiz.json", base: "./src/content" }),
  schema: z.object({
    questions: z
      .array(
        z.object({
          question: z.string().min(1),
          options: z.array(z.string().min(1)).length(4),
          correct: z.number().int().min(0).max(3),
          explanation: z.string().min(1),
        }),
      )
      .min(1),
  }),
});

const filmTypeEnum = z.enum(["animovany", "hrany", "dokument", "serial"]);
const filmLinkTypeEnum = z.enum([
  "csfd",
  "wikipedia",
  "imdb",
  "youtube",
  "netflix",
  "disneyplus",
  "primevideo",
  "skyshowtime",
  "ivysilani",
  "decko",
  "crunchyroll",
  "appletv",
  "official",
  "other",
]);

const filmy = defineCollection({
  loader: glob({ pattern: "filmy.json", base: "./src/content/pages" }),
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
    sections: z
      .array(
        z.object({
          slug: z.string().regex(slugRe),
          title: z.string().min(1),
          subtitle: z.string().min(1),
          surface: surfaceEnum,
          emoji: z.string().min(1),
          items: z
            .array(
              z.object({
                title: z.string().min(1),
                titleOrig: z.string().optional(),
                year: z.number().int().min(1900).max(2100).optional(),
                yearLabel: z.string().optional(),
                type: filmTypeEnum,
                director: z.string().optional(),
                description: z.string().min(1),
                badge: z.string().optional(),
                links: z
                  .array(
                    z.object({
                      label: z.string().min(1),
                      url: z.url(),
                      type: filmLinkTypeEnum,
                    }),
                  )
                  .min(1),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
    note: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      body: z.string().min(1),
    }),
  }),
});

export const collections = { species, site, home, oProjektu, hry, quiz, filmy };
