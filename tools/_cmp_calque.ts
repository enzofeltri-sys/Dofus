// Comparaison pour Enzo : mon dessin vectoriel, le calque automatique (vtracer), l'illustration DofusDB.
import { readFileSync, writeFileSync } from 'node:fs';
import { CRITTER_SVG } from '../src/art/champs-chibi';
const S = process.argv[2];
const T: [string, string, number][] = [['fennex', 'Fennex', 1490], ['waWobot', 'Wa Wobot', 1006], ['mantiscore', 'Mantiscore', 1495], ['blancPaWabbit', 'Blanc Pa Wabbit', 1009]];
const uri = (b: Buffer | string, t: string) => `data:${t};base64,${Buffer.from(b).toString('base64')}`;
const row = ([k, n, g]: (typeof T)[number]) => `<div class="r"><b>${n}</b>
  <figure><img src="${uri((CRITTER_SVG as any)[k](), 'image/svg+xml')}"><figcaption>Mon dessin</figcaption></figure>
  <figure><img src="${uri(readFileSync(`${S}/trace/g${g}.svg`), 'image/svg+xml')}"><figcaption>Calque (${Math.round(readFileSync(`${S}/trace/g${g}.svg`).length / 1024)} Ko)</figcaption></figure>
  <figure><img class="m" src="${uri(readFileSync(`${S}/t80/ref/g${g}.png`), 'image/png')}"><figcaption>Original DofusDB</figcaption></figure></div>`;
writeFileSync(`${S}/cmp_calque.html`, `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#2a2228;color:#f4ead8;font:14px sans-serif;padding:12px}
.g{display:grid;grid-template-columns:1fr 1fr;gap:10px}.r{background:#3a3234;border-radius:12px;padding:8px;display:flex;gap:6px;align-items:center}.r b{writing-mode:vertical-rl;transform:rotate(180deg);font-size:16px}
figure{margin:0;text-align:center}img{width:190px;height:200px;object-fit:contain;background:radial-gradient(#cfc4a8,#9a8c70);border-radius:8px}.m{transform:scaleX(-1)}figcaption{font-size:12px;margin-top:3px}</style>
<h2 style="margin:4px 0 10px">Calque automatique : comparaison</h2><div class="g">${T.map(row).join('')}</div>`);
