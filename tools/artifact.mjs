// Transforme dist-single/index.html en page d'artefact : sans doctype/html/head/body
// (la plateforme ajoute son propre squelette), <title> et <style> en tête.
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync('dist-single/index.html', 'utf8');
const head = /<head>([\s\S]*?)<\/head>/.exec(src)[1];
const body = /<body>([\s\S]*?)<\/body>/.exec(src)[1];
const styles = [...head.matchAll(/<style[\s\S]*?<\/style>/g)].map((m) => m[0]).join('\n');
const scripts = [...head.matchAll(/<script[\s\S]*?<\/script>/g)].map((m) => m[0]).join('\n');
const page = `<title>Dofus version Enzo</title>
<style>:root{color-scheme:dark;background:#2a160c}</style>
${styles}
${body}
${scripts}
`;
writeFileSync('dist-single/dofus.html', page);
console.log('dist-single/dofus.html', (page.length / 1024).toFixed(0), 'Ko');
