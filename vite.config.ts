import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  base: './',
  plugins: [tailwindcss(), svelte()],
  // Pre-bundle the lazy-loaded OCR engine; discovering it at runtime makes
  // the dev server full-reload mid-scan.
  optimizeDeps: { include: ['tesseract.js'] },
  resolve: {
    alias: {
      $lib: path.resolve(import.meta.dirname, './src/lib'),
    },
  },
})
