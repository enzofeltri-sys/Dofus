// Onglet Personnage : « Copier ma sauvegarde » affiche le texte de la sauvegarde (et le copie si possible).
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://localhost:5173' });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
await p.goto('http://localhost:5173/');
await p.evaluate(async () => {
  const pr = await import('/src/game/progression.ts');
  const inv = await import('/src/game/inventory.ts');
  localStorage.setItem('dofus-enzo-save', JSON.stringify({ v: 5, runs: 12, wins: 7, bestRoom: 9, bestWinTime: 200, xp: 0, resources: { 289: 4 }, profile: { ...pr.defaultProfile(), xp: pr.XP_TABLE[20] }, inventory: inv.starterInventory(), done: ['champs', 'crypte'], area: 'cite' }));
});
await p.reload();
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.waitForSelector('.camp:not([hidden]) .play', { timeout: 20000 });
await p.click('.nav-tab[data-sec="perso"]');
await p.waitForTimeout(400);
await p.click('.sheet .s-copy');
await p.waitForTimeout(400);
const txt = await p.$eval('.sheet .s-text', (e) => e.value);
console.log('message :', await p.$eval('.sheet .s-msg', (e) => e.textContent));
console.log('texte :', txt.length, 'caractères, JSON valide :', (() => { try { return !!JSON.parse(txt).profile; } catch { return false; } })());
console.log('presse-papiers identique :', (await p.evaluate(() => navigator.clipboard.readText())) === txt);
await p.$eval('.sheet .s-copy', (e) => e.scrollIntoView());
await p.screenshot({ path: 'shots/copysave.png' });
console.log(errors.join('\n') || 'aucune erreur');
await b.close();
