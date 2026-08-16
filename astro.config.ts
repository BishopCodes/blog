import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';
import tailwindcss from '@tailwindcss/vite';
import { remarkModified } from "@/plugins/remark-modified.mjs"
import { remarkReadingTime } from '@/plugins/remark-reading-time.mjs';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  site: 'https://bishopcodes.github.io',

  markdown: {
    processor: unified({
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            content: { type: 'text', value: ' 🔗' }
          }
        ]
      ],
      remarkPlugins: [remarkModified, remarkReadingTime]
    })
  },

  integrations: [sitemap()]
});
