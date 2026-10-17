import { writeFileSync } from 'node:fs';
import { CRITTER_SVG, CRITTER_H, CRITTER_W } from '../src/art/champs-chibi';
const S = process.argv[2];
const T: [string, string, number, number][] = [
  ['scaraRouge', 'Scarafeuille Rouge', 104, 1], ['scaraBleu', 'Scarafeuille Bleu', 105, 1], ['scaraVert', 'Scarafeuille Vert', 135, 1], ['scaraBlanc', 'Scarafeuille Blanc', 136, 1],
  ['scaraNoir', 'Scarafeuille Noir', 441, 1.05], ['scaraImmature', 'Scarafeuille Immature', 444, 0.85], ['scarabosse', 'Scarabosse Doré (boss)', 443, 1.6], ['bomberfu', 'Bomberfu (Tofus)', 447, 0.7],
];
const uri = (s: string) => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64');
const cell = (k: string, n: string, g: number) => `<div class="c"><img class="ref" src="file://${S}/scara/g${g}.png"><img class="me" src="${uri((CRITTER_SVG as any)[k]())}"><b>${n}</b></div>`;
const line = [...T.map(([k, n, , sc]) => [k, n, sc] as const), ['bouftou', 'Bouftou (repère)', 1.25] as const, ['tofuJaune', 'Tofu (repère)', 0.85] as const, ['tofuVentripotent', 'Tofu Ventripotent (repère)', 1.35] as const]
  .map(([k, n, sc]) => `<div class="l"><img src="${uri((CRITTER_SVG as any)[k]())}" style="width:${CRITTER_W * sc}px;height:${CRITTER_H * sc}px"><i>${n}<br>×${sc}</i></div>`).join('');
writeFileSync(`${S}/plancheS.html`, `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#2a2228;color:#f4ead8;font:14px sans-serif;padding:14px}h2{margin:6px 0 10px}
.row{display:flex;gap:10px;flex-wrap:wrap}.c{background:#3a3234;border-radius:12px;padding:8px;display:flex;flex-direction:column;align-items:center;width:178px}
.ref{width:120px;height:120px;background:#fff;border-radius:8px}.me{width:168px;height:192px;background:radial-gradient(#6b6058,#3a3230);border-radius:8px;margin-top:6px}
.lineup{display:flex;align-items:flex-end;gap:4px;background:linear-gradient(#5a7a4a,#3e5a32);border-radius:12px;padding:10px 10px 4px;margin-top:10px}
.l{display:flex;flex-direction:column;align-items:center}.l i{font-size:11px;text-align:center}
</style><h2>Donjon des Scarafeuilles (+ Bomberfu) — en haut : illustration DofusDB (référence) ; en bas : mon dessin</h2><div class="row">${T.map(([k, n, g]) => cell(k, n, g)).join('')}</div>
<h2>Tailles en jeu</h2><div class="lineup">${line}</div>`);
