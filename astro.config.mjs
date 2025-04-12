// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';


// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: import.meta.env.PROD && {
        'react-dom/server': 'react-dom/server.edge',
      },
    },
    define: {
      'process.env.UPSTASH_REDIS_REST_URL': JSON.stringify(process.env.UPSTASH_REDIS_REST_URL),
      'process.env.UPSTASH_REDIS_REST_TOKEN': JSON.stringify(process.env.UPSTASH_REDIS_REST_TOKEN)
    }
  },
  output: 'static',

  integrations: [react()],
  adapter: cloudflare()
});
