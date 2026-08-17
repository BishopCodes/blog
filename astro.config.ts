import { remarkModified } from "@/plugins/remark-modified.mjs";
import { remarkReadingTime } from "@/plugins/remark-reading-time.mjs";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import umami from "@yeskunall/astro-umami";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
import imagekit from "@imagekit/astro/integration";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  site: "https://bishopcodes.github.io",

  markdown: {
    processor: unified({
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            content: { type: "text", value: " 🔗" },
          },
        ],
      ],
      remarkPlugins: [remarkModified, remarkReadingTime],
    }),
  },
  integrations: [
    sitemap(),
    umami({ id: "a3d374e3-89d8-4950-bd77-49ee88887ab7" }),
    imagekit({
      urlEndpoint: "https://ik.imagekit.io/dl8mble2sh",
    }),
  ],
});
