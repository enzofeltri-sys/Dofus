// Menus simplifiés (points 4 à 10 d'Enzo) : camp, JOUER → zones → cartes / donjon → partie ; 4 onglets ; tout tient sans défiler.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
await p.goto('http://localhost:5173/');
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 9, wins: 9, bestRoom: 9, bestWinTime: 200, xp: 0, resources: {}, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[22] }, inventory: inv.starterInventory(), done: ['champs', 'paturages', 'foret', 'cimetiere', 'crypte', 'cite', 'souterrains', 'champsAstrub', 'prairies'], area: 'cite' }));
});
await p.reload();
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
await p.waitForTimeout(400);
await p.screenshot({ path: 'shots/menus_camp.png' });
const fits = async (sel) => p.evaluate((s) => { const e = document.querySelector(s); return `${e.scrollHeight} / ${e.clientHeight}`; }, sel);
console.log('camp (contenu / écran) :', await fits('.camp'));
console.log('onglets :', await p.$$eval('.nav-tab:not([hidden])', (e) => e.map((x) => x.querySelector('span').textContent).join(', ')));
await p.click('.camp .play', { force: true });
await p.waitForTimeout(400);
await p.screenshot({ path: 'shots/menus_zone_astrub.png' });
console.log('ouvre sur :', await p.textContent('.atlas .sh-head .gr-h2'));
await p.click('.atlas .back');
await p.waitForTimeout(300);
await p.screenshot({ path: 'shots/menus_zones.png' });
console.log('zones :', await p.$$eval('.zone-card', (e) => e.map((x) => x.querySelector('b').textContent + (x.disabled ? ' (fermée)' : '')).join(', ')));
await p.click('.zone-card[data-zone="astrub"]');
await p.waitForTimeout(300);
console.log('Astrub : les Champs (contenu / écran) :', await fits('.atlas'));
await p.evaluate(() => document.querySelector('.atlas').scrollTo(0, 99999));
await p.waitForTimeout(300);
await p.screenshot({ path: 'shots/menus_donjon.png' });
await p.evaluate(() => document.querySelector('.atlas').scrollTo(0, 0));
await p.click('.map-row[data-id="champsAstrub"] .go');
await p.waitForTimeout(1500);
console.log('partie lancée sur :', await p.evaluate(() => window.__game.area.name), '| camp caché :', await p.evaluate(() => document.querySelector('.camp').hidden));
await p.screenshot({ path: 'shots/menus_partie.png' });
// hauteur des panneaux (contenu / écran)
await p.goto('http://localhost:5173/');
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
for (const [sec, sel] of [['perso', '.sheet'], ['equip', '.inv'], ['grimoire', '.grimoire'], ['bestiaire', '.bestiary']]) {
  await p.click(`.nav-tab[data-sec="${sec}"]`);
  await p.waitForTimeout(400);
  console.log(sel, '(contenu / écran) :', await fits(sel));
  await p.screenshot({ path: `shots/menus_${sec}.png` });
  await p.click(`.nav-tab[data-sec="${sec}"]`);
  await p.waitForTimeout(200);
}
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
