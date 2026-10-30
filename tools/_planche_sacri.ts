// Planche d'essai du Sacrieur sur gabarit : actuel, nouveau (poses du jeu), couleurs Apparence. Sortie HTML (à capturer).
// Usage : npx vite-node tools/_planche_sacri.ts <sacri.json> <sortie.html>
import { readFileSync, writeFileSync } from 'node:fs';
import { sacriChibi as sacrieurSvg } from '../src/art/sacrieur-chibi';
import { SACRI_COLORS, type SacriColors } from '../src/art/sacrieur-chibi';

const [src, out] = process.argv.slice(2);
const d = JSON.parse(readFileSync(src, 'utf8')) as {
  parts: Record<string, [string, string, number, number][]>; pivots: Record<string, [number, number]>; hand: [number, number]; slots: Record<string, string | null>;
};
const FIXED: Record<string, string> = { rouge: '#D8401A', blanc: '#E6DCC4' };
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const lum = (c: number[]) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
/** Nuance p de la couleur de base `base`, rapportée à la nouvelle couleur `nb` (même nuance, même écart). */
function recolor(p: string, base: string, nb: string) {
  const P = rgb(p), B = rgb(base), N = rgb(nb);
  const t = lum(P) / Math.max(1, lum(B));
  return hex(P.map((v, i) => v + t * (N[i] - B[i])));
}
const ink = (h: string) => hex(rgb(h).map((v) => v * 0.45));
function partSvg(part: string, col: SacriColors) {
  return d.parts[part].map(([f, path]) => {
    const slot = d.slots[f];
    const fill = slot && slot in col ? recolor(f, SACRI_COLORS[slot as keyof SacriColors], col[slot as keyof SacriColors]) : f;
    return `<path d="${path}" fill="${fill}" stroke="${ink(fill)}" stroke-width="0.5" stroke-linejoin="round"/>`;
  }).join('');
}
const ORDER = ['cape', 'legB', 'legF', 'armB', 'torso', 'armF', 'head'];
type Pose = Partial<Record<string, number>> & { sword?: number; bob?: number; torsoDy?: number };
const deg = (r: number) => (r * 180) / Math.PI;
function hero(col: SacriColors, pose: Pose = {}, size = 280) {
  const g = ORDER.map((p) => {
    const [px, py] = d.pivots[p];
    const rot = pose[p] ?? 0;
    const dy = p === 'torso' || p === 'cape' ? pose.torsoDy ?? 0 : p === 'head' ? (pose.torsoDy ?? 0) * 1.3 : 0;
    let inner = partSvg(p, col);
    if (p === 'armF' && pose.sword !== undefined) {
      const [hx, hy] = d.hand;
      inner += `<g transform="rotate(${deg(-pose.sword)} ${hx} ${hy})"><rect x="${hx - 2}" y="${hy - 46}" width="4" height="42" rx="1.5" fill="#cfd6dc" stroke="#4a5058" stroke-width="0.8"/><rect x="${hx - 7}" y="${hy - 5}" width="14" height="3.5" fill="#7a5a2a"/><rect x="${hx - 1.8}" y="${hy - 2}" width="3.6" height="9" fill="#5a3a1a"/></g>`;
    }
    return `<g transform="translate(0 ${dy}) rotate(${deg(rot)} ${px} ${py})">${inner}</g>`;
  }).join('');
  return `<svg viewBox="0 0 140 170" width="${(size * 140) / 170}" height="${size}" style="overflow:visible"><ellipse cx="71" cy="163" rx="26" ry="5" fill="#000" opacity=".25"/><g transform="translate(0 ${-(pose.bob ?? 0)})">${g}</g></svg>`;
}
const poses: [string, Pose][] = [
  ['Repos', { armF: 0.15, sword: 0.9 }],
  ['Marche 1', { legB: 0.5, legF: -0.5, armB: -0.38, armF: 0.45, torso: 0.03, head: 0.024, sword: 0.9, bob: 3 }],
  ['Marche 2', { legB: -0.5, legF: 0.5, armB: 0.38, armF: -0.15, torso: 0.03, head: 0.024, sword: 0.9, bob: 3 }],
  ['Coup : bras levé', { armF: -1.9, armB: -0.45, sword: 2.7, torso: 0.09, cape: 0.09, head: 0.07 }],
  ['Coup : frappe', { armF: 1.55, armB: -0.45, sword: 2.7, torso: 0.09, cape: 0.09, head: 0.07 }],
];
const alt1: SacriColors = { skin: '#F3C9A0', hair: '#2B2B33', c1: '#2E4C8C', c2: '#1F2B45', c3: '#D9D9E0', c4: '#4A3A2A' };
const alt2: SacriColors = { skin: '#8A5A3C', hair: '#E8E0D0', c1: '#7A2A80', c2: '#3C6A3A', c3: '#E0C040', c4: '#2A2A2A' };
const card = (label: string, body: string) => `<div class="c"><div class="b">${body}</div><div class="l">${label}</div></div>`;
const sizeKb = Math.round(JSON.stringify(d.parts).length / 1024);
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#3b4a2c;font:14px system-ui;color:#f2ead8;padding:14px}
h2{font-size:16px;margin:10px 0 6px}.row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
.c{background:#4d5e38;border-radius:10px;padding:8px;text-align:center}.l{margin-top:4px;font-size:12px;opacity:.9}
.b{display:flex;align-items:flex-end;justify-content:center;gap:6px}
</style>
<h2>Sacrieur actuel → sur gabarit (rendu officiel Dofus 3, ${sizeKb} Ko)</h2>
<div class="row">${card('Actuel', sacrieurSvg().replace(/width="\d+" height="\d+"/, 'width="231" height="280"'))}${card('Nouveau', hero(SACRI_COLORS, { armF: 0.15 }))}${card('Taille en jeu', hero(SACRI_COLORS, { armF: 0.15, sword: 0.9 }, 92) + sacrieurSvg().replace(/width="\d+" height="\d+"/, 'width="76" height="92"'))}</div>
<h2>Poses du jeu (bras, jambes, cape, tête animés séparément)</h2>
<div class="row">${poses.map(([l, p]) => card(l, hero(SACRI_COLORS, p, 200))).join('')}</div>
<h2>Couleurs Apparence (peau, cheveux, vêtements 1-4)</h2>
<div class="row">${card('Couleurs Dofus 3', hero(SACRI_COLORS, { armF: 0.15 }, 200))}${card('Essai 1', hero(alt1, { armF: 0.15 }, 200))}${card('Essai 2', hero(alt2, { armF: 0.15 }, 200))}</div>`;
writeFileSync(out, html);
console.log(out);
