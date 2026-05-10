import { defineConfig, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import remarkReadingTime from "remark-reading-time";

export default defineConfig({
  site: "https://pingupedia.cz/",
  output: "server",
  trailingSlash: "always",
  adapter: cloudflare({
    configPath: "./wrangler.jsonc",
    persistState: true,
    prerenderEnvironment: "node",
  }),
  integrations: [
    sitemap({
      filter: (page) => !/\/admin(\/|$)/.test(page),
    }),
    icon(),
  ],
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
  image: {
    // Sharp pre-renderuje všechny varianty při buildu → statické /_astro/*.webp
    // soubory servírované přes ASSETS binding. Vyhýbáme se CF Images binding
    // runtime transformacím, které opakovaně způsobovaly cache poisoning 500ek.
    service: { entrypoint: "astro/assets/services/sharp" },
    endpoint: { entrypoint: "./src/lib/image-endpoint.ts" },
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
