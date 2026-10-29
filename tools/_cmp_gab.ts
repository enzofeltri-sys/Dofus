// Comparaison à la taille du jeu : original DofusDB, gabarit lissé (~25 Ko), mon dessin (~15 Ko).
import { readFileSync, writeFileSync } from 'node:fs';
import { TRACED_SHAPES } from '../src/art/traced.gen';
import { CRITTER_SVG } from '../src/art/champs-chibi';
const S = process.argv[2];
const GFX: Record<string, number> = { wobot: 102, waWobot: 1006, blackWoWabbit: 1007, wobotKiafin: 1008, blancPaWabbit: 1009, tiwobot: 1018, scordionBleu: 1489, fennex: 1490, boulepique: 1491, leolhyene: 1493, ouroboulos: 1494, mantiscore: 1495 };
const dark = (h: string) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * 0.45).toString(16).padStart(2, '0')).join('');
const gab = (k: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 160">${TRACED_SHAPES[k].map(([f, d]) => `<path d="${d}" fill="${f}" stroke="${dark(f)}" stroke-width="0.5" stroke-linejoin="round"/>`).join('')}</svg>`;
const u = (b: Buffer | string, t: string) => `data:${t};base64,${Buffer.from(b).toString('base64')}`;
const col = (k: string) => `<div class="c"><img class="m" src="${u(readFileSync(`${S}/t80/ref/g${GFX[k]}.png`), 'image/png')}"><img src="${u(gab(k), 'image/svg+xml')}"><img src="${u((CRITTER_SVG as any)[k](), 'image/svg+xml')}"><i>${k}</i></div>`;
writeFileSync(`${S}/cmp_gab.html`, `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:linear-gradient(#5a6a3a,#3e4a26);color:#fff;font:12px sans-serif;padding:10px}
.row{display:flex;gap:6px;flex-wrap:wrap}.c{display:flex;flex-direction:column;align-items:center;background:rgba(0,0,0,.15);border-radius:8px;padding:4px}
img{width:96px;height:110px;object-fit:contain}.m{transform:scaleX(-1)}p{margin:2px 0 8px}</style>
<p>Taille du jeu — de haut en bas : original DofusDB · gabarit lissé (auto) · mon dessin</p><div class="row">${Object.keys(GFX).map(col).join('')}</div>`);
