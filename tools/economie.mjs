// Fusion simplifiée (même emplacement), Épurer + brisage auto, kamas de la forgemagie (choix d'Enzo).
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
p.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errors.push('[console] ' + m.text()));
const ready = async () => {
  await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
  await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
};
const shot = (name) => p.screenshot({ path: `shots/${name}.png` });
const toast = async () => { await p.waitForTimeout(150); return p.evaluate(() => document.querySelector('.toast').textContent); };
const save = () => p.evaluate(() => JSON.parse(localStorage.getItem('dofus-enzo-save')));
await p.goto('http://localhost:5173/');
await p.evaluate(() => localStorage.clear());
await p.reload();
await ready();
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  const f = await import('/src/game/forge.ts');
  const { ITEMS } = await import('/src/game/data/items.ts');
  let i = inv.starterInventory();
  const all = Object.values(ITEMS).filter((d) => d.slot === 'anneau' && d.level >= 20 && d.level <= 30 && d.effects.length);
  const lv = all.find((d) => all.filter((x) => x.level === d.level).length >= 3).level;
  const one = all.find((d) => d.level === lv);
  const rings = [one, one, one, all.find((d) => d.id !== one.id)]; // 3 anneaux identiques + 1 autre (fusion : identiques seulement)
  for (const d of rings) i = f.addNew(i, d.id, 0, Math.random);
  const low = Object.values(ITEMS).filter((d) => d.slot && d.slot !== 'familier' && d.slot !== 'dofus' && d.level <= 12 && d.effects.length).slice(0, 14);
  for (const d of low) i = f.addNew(i, d.id, 0, Math.random);
  localStorage.setItem('dofus-enzo-save', JSON.stringify({
    v: 5, runs: 30, wins: 25, bestRoom: 9, bestWinTime: 220, xp: 0, jobXp: 3000, profile: { xp: pr.XP_TABLE[40], carac: {} }, inventory: i,
    resources: { 16525: 5, 1519: 20, 1545: 10, 1557: 2 }, kamas: 2500,
    done: ['champs', 'paturages', 'foret', 'cimetiere', 'crypte'], area: 'crypte',
  }));
});
await p.reload();
await ready();
console.log('camp :', await p.textContent('.camp-name'));
await shot('eco_camp');

// 1) fusion : 3 anneaux différents de même rang
await p.click('.nav-tab[data-sec="equip"]');
await p.waitForTimeout(500);
const ringUid = await p.evaluate(async () => {
  const { item } = await import('/src/game/data/items.ts');
  const s = JSON.parse(localStorage.getItem('dofus-enzo-save'));
  return s.inventory.items.filter((x) => item(x.id).slot === 'anneau' && item(x.id).level >= 20).map((x) => x.uid)[0];
});
await p.click(`.inv-grid [data-uid="${ringUid}"]`);
await p.waitForTimeout(400);
console.log('fiche :', await p.textContent('.inv-detail:not(.inv-modal) .det-forge'));
await p.click('.d-fuse');
await p.waitForTimeout(400);
console.log('fenêtre fusion :', (await p.textContent('.inv-modal .det-src')).trim(), '| proposés :', await p.$$eval('.inv-modal .fz-partners [data-p]', (e) => e.length), '| choisis :', await p.$$eval('.inv-modal .fz-partners .sel', (e) => e.length));
await shot('eco_fusion');
await p.click('.inv-modal .fz-ok');
console.log('fusion :', await toast());
await p.click('.inv-detail:not(.inv-modal) .det-close').catch(() => {});
await p.waitForTimeout(300);

// 2) Épurer
const before = (await save()).inventory.items.length;
await p.click('.ia-purge');
await p.waitForTimeout(300);
console.log('épurer :', (await p.textContent('.inv-modal .det-card')).replace(/\s+/g, ' ').trim());
await shot('eco_epurer');
await p.click('.inv-modal .pg-check');
await p.waitForTimeout(200);
console.log('réglage brisage auto :', (await save()).autoBreak);
await p.click('.inv-modal .pg-go');
await p.waitForTimeout(300);
await shot('eco_epurer_runes');
await p.click('.inv-modal .br-ok');
console.log('brisage :', await toast());
console.log('objets :', before, '→', (await save()).inventory.items.length);

// 3) forgemagie payée en kamas
await p.click('.inv .sec-tab[data-panel="atelier"]');
await p.click('.at-tabs .gr-tab[data-t="3"]');
await p.waitForTimeout(300);
await p.click('.at-row.fm');
await p.waitForTimeout(300);
await shot('eco_fm');
console.log('kamas FM :', await p.textContent('.fm-kamas'), '| prix :', await p.$$eval('.fm-cost', (e) => [...new Set(e.map((x) => x.textContent))].join(', ')));
const k0 = (await save()).kamas;
await p.click('.fm-rune:not([disabled])').catch(() => {});
await p.waitForTimeout(200);
console.log('après une rune (simple) :', await p.textContent('.fm-last'), '| kamas', k0, '→', (await save()).kamas);
await shot('eco_fm_after');
console.log('version simple, puits caché :', await p.$eval('.fm-puits', (e) => e.hidden), '| chances :', await p.$eval('.fm-rune small', (e) => e.textContent));
await p.click('[data-fmmode="avancee"]');
await p.waitForTimeout(200);
console.log('version avancée, puits visible :', await p.$eval('.fm-puits', (e) => !e.hidden), '| chances :', await p.$eval('.fm-rune small', (e) => e.textContent), '| sauvegardé :', (await save()).fmMode);
await shot('eco_fm_avancee');
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
