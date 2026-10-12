import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build:single` produit un seul fichier HTML autonome (JS, CSS et polices inclus),
// pour la page privée claude.ai où seul un fichier unique est fiable.
export default defineConfig(({ mode }) => ({
  base: './',
  server: { port: 5173 },
  plugins: mode === 'single' ? [viteSingleFile()] : [],
  build: mode === 'single' ? { assetsInlineLimit: 100_000_000, outDir: 'dist-single' } : {},
}));
