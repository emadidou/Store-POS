import { copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    async closeBundle() {
      const indexPath = resolve(__dirname, 'dist/index.html');
      const fallbackPath = resolve(__dirname, 'dist/404.html');
      await copyFile(indexPath, fallbackPath);
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/pos/' : '/',
  plugins: [react(), githubPagesSpaFallback()],
  build: {
    emptyOutDir: true,
  },
}));
