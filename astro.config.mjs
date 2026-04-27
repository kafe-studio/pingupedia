import { defineConfig, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import remarkReadingTime from "remark-reading-time";

// Locales musí zůstat v sync s src/i18n/ui.ts LOCALES (duplikováno protože
// astro.config.mjs nedokáže importovat TS modul typeof const tuple).
const LOCALES = ["cs", "en", "de", "fr", "es", "it", "pl", "uk"];

export default defineConfig({
  site: "https://pingupedia.cz/",
  output: "server",
  trailingSlash: "always",
  adapter: cloudflare({
    configPath: "./wrangler.jsonc",
    persistState: true,
    prerenderEnvironment: "node",
  }),
  i18n: {
    defaultLocale: "cs",
    locales: LOCALES,
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [sitemap(), icon()],
  markdown: {
    remarkPlugins: [
      remarkReadingTime,
      () => {
        return function (_tree, file) {
          file.data.astro.frontmatter.minutesRead =
            file.data.readingTime.minutes;
        };
      },
    ],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  build: {
    inlineStylesheets: "always",
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
