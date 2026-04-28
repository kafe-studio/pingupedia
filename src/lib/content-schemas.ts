// Sdílené zod schémata pro JSON content collections (site, home, o-projektu, hry, filmy, quiz).
// Importuje content.config.ts (defineCollection) i admin texty PUT (validate před commitem do GitHubu).
// Species má v content.config.ts vlastní inline schéma s image() callbackem (mimo tento soubor).

import { z } from "astro/zod";

const slugRe = /^[a-z0-9-]+$/;
const httpsUrl = z.url().refine((u) => u.startsWith("https://"), {
  message: "URL musí začínat https://",
});
const surfaceEnum = z.enum(["aurora", "ocean", "ice", "sun", "candy", "midnight"]);
const mascotPoseEnum = z.enum([
  "ahoj", "plave", "detektiv", "cte", "radost",
  "otazka", "palec", "wow", "srdce", "vajicko",
]);
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

export const siteSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: httpsUrl,
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
});

export const homeSchema = z.object({
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
});

export const oProjektuSchema = z.object({
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
    portfolioUrl: httpsUrl,
    portfolioLabel: z.string().min(1),
  }),
});

export const hrySchema = z.object({
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
        slug: z.string().regex(slugRe),
        title: z.string().min(1),
        tag: z.string().min(1),
        description: z.string().min(1),
        surface: surfaceEnum,
        mascotPose: mascotPoseEnum,
      }),
    )
    .min(1),
  cta: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

export const quizSchema = z.object({
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
});

export const filmySchema = z.object({
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
                    url: httpsUrl,
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
});
