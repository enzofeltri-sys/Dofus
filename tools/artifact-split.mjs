// Transforme dist-split/index.html en page d'artefact légère (sans doctype/html/head/body) :
// le script du jeu (jeu-<empreinte>.js, images incluses) et la feuille de style sont publiés à côté, en fichiers.
// L'empreinte change à chaque version : le téléphone ne peut pas garder l'ancien jeu en cache.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
const src = readFileSync('dist-split/index.html', 'utf8');
const head = /<head>([\s\S]*?)<\/head>/.exec(src)[1];
const body = /<body>([\s\S]*?)<\/body>/.exec(src)[1];
const keep = [...head.matchAll(/<(?:style|script)[\s\S]*?<\/(?:style|script)>|<link[^>]*>/g)].map((m) => m[0]).filter((t) => !/rel="(?:icon|manifest|apple-touch-icon)"/.test(t));
const page = `<title>Dofus version Enzo</title>
<style>:root{color-scheme:dark;background:#2a160c}</style>
${keep.join('\n')}
${body}
`;
writeFileSync('dist-split/dofus.html', page);
for (const f of readdirSync('dist-split')) console.log(f, (statSync(`dist-split/${f}`).size / 1024).toFixed(0), 'Ko');
const files = Object.fromEntries(readdirSync('dist-split').filter((f) => /^(jeu|style)-.*\.(js|css)$/.test(f)).map((f) => [f, `dist-split/${f}`]));
writeFileSync('dist-split/files.json', JSON.stringify(files));
console.log('files', JSON.stringify(files));
