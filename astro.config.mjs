// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import robotsTxt from 'astro-robots-txt';
import { astroImageTools } from 'astro-imagetools';
import AstroPWA from '@vite-pwa/astro';
import { readdirSync } from 'node:fs';

import react from '@astrojs/react';

const edition = process.env.EDITION || 'global';
const siteUrl = 'https://your-site.com';

// Generate custom sitemap pages from content/posts (SSR routes not auto-discovered)
const postFiles = readdirSync(new URL('./src/content/posts', import.meta.url));
const postPages = postFiles
  .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
  .map(f => `${siteUrl}/${f.replace(/\.mdx?$/, '')}`);

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: false,
    },
    sessionKVBindingName: undefined,
  }),
  site: siteUrl,
  compressHTML: false, // Skip compression for faster builds
  build: {
    concurrency: 4, // Parallel page builds
  },
  integrations: [
    mdx(),
    sitemap({ customPages: postPages }),
    robotsTxt(),
    astroImageTools,
    react(),
    AstroPWA({
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'favicon.svg', 'favicon.ico'],
      manifest: {
        name: 'The Feed',
        short_name: 'Feed',
        description: 'Content pipeline, automated',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{css,js,svg,png,ico,woff2,html}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Uncomment and replace with your media CDN URL
          // {
          //   urlPattern: /^https:\/\/YOUR_MEDIA_CDN\/.*/i,
          //   handler: 'CacheFirst',
          //   options: {
          //     cacheName: 'media-cache',
          //     expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          //     cacheableResponse: { statuses: [0, 200] },
          //   },
          // },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.EDITION': JSON.stringify(edition),
    },
  },
});