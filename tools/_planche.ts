// Planche de validation : illustration DofusDB (référence) au-dessus de chaque dessin, puis tailles en jeu.
import { writeFileSync } from 'node:fs';
import { CRITTER_SVG, CRITTER_H, CRITTER_W } from '../src/art/champs-chibi';
import { CHAFER_H, CHAFER_W, type ChaferKind } from '../src/art/chafer';
import { chaferChibiSvg } from '../src/art/monsters-chibi';
const S = process.argv[2];
const CHAFERS = ['debutant', 'furtif', 'fantassin', 'primitif', 'ronin', 'vampire', 'maitreVampire', 'bwork', 'bworkMage', 'bworkArcher', 'bworkette'];
const art = (k: string) => (CHAFERS.includes(k) ? chaferChibiSvg(k as ChaferKind) : (CRITTER_SVG as any)[k]());
const size = (k: string): [number, number] => (CHAFERS.includes(k) ? [CHAFER_W, CHAFER_H] : [CRITTER_W, CRITTER_H]);
// [dessin, nom, gfx DofusDB, taille proposée]
const T: [string, string, number, number][] = [
  ['wabbit', 'Wabbit', 25, 1.1], ['blackWabbit', 'Black Wabbit', 26, 1.1], ['tiwabbit', 'Tiwabbit', 48, 0.85], ['blackTiwabbit', 'Black Tiwabbit', 27, 0.85],
  ['tiwabbitKiafin', 'Tiwabbit Kiafin', 28, 0.85], ['woWabbit', 'Wo Wabbit', 49, 1.3], ['grandPaWabbit', 'Grand Pa Wabbit', 50, 1.15], ['waWabbit', 'Wa Wabbit (boss)', 101, 1.6],
];
const uri = (s: string) => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64');
const cell = ([k, n, g]: (typeof T)[number]) => `<div class="c"><img class="ref" src="file://${S}/wab/g${g}.png"><img class="me" src="${uri(art(k))}"><b>${n}</b></div>`;
const line = [...T.map(([k, n, , sc]) => [k, n, sc] as const), ['bouftou', 'Bouftou (repère)', 1.25] as const]
  .map(([k, n, sc]) => { const [w, h] = size(k); return `<div class="l"><img src="${uri(art(k))}" style="width:${w * sc * 0.8}px;height:${h * sc * 0.8}px"><i>${n}<br>×${sc}</i></div>`; }).join('');
writeFileSync(`${S}/plancheW.html`, `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#2a2228;color:#f4ead8;font:14px sans-serif;padding:14px}h2{margin:6px 0 10px}
.row{display:flex;gap:8px;flex-wrap:wrap}.c{background:#3a3234;border-radius:12px;padding:8px;display:flex;flex-direction:column;align-items:center;width:160px}
.ref{width:110px;height:110px;background:#fff;border-radius:8px}.me{width:150px;height:174px;background:radial-gradient(#6b6058,#3a3230);border-radius:8px;margin-top:6px;object-fit:contain}
.lineup{display:flex;align-items:flex-end;gap:2px;background:linear-gradient(#4a5a3a,#2e3a24);border-radius:12px;padding:10px 10px 4px;margin-top:10px}
.l{display:flex;flex-direction:column;align-items:center}.l i{font-size:11px;text-align:center}
</style><h2>Wabbits — en haut : illustration DofusDB (référence) ; en bas : mon dessin</h2><div class="row">${T.map(cell).join('')}</div>
<h2>Tailles en jeu</h2><div class="lineup">${line}</div>`);
