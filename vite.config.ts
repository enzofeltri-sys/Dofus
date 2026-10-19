import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build:single` produit un seul fichier HTML autonome (JS, CSS et polices inclus),
// pour la page privée claude.ai où seul un fichier unique est fiable.
// `npm run build:split` : la même chose en deux morceaux (page légère + script du jeu à côté, images incluses dans le script),
// publiés ensemble sur l'artefact (la page seule est limitée à 16 Mo).
export default defineConfig(({ mode }) => ({
  base: './',
  server: { port: 5173 },
  plugins: mode === 'single' ? [viteSingleFile()] : [],
  build: mode === 'single' ? { assetsInlineLimit: 100_000_000, outDir: 'dist-single' }
    : mode === 'split' ? { assetsInlineLimit: 100_000_000, outDir: 'dist-split', cssCodeSplit: false, rollupOptions: { output: { entryFileNames: 'jeu-[hash].js', assetFileNames: '[name]-[hash][extname]', inlineDynamicImports: true } } } : {},
}));
