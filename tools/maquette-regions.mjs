// Maquette (proposition à Enzo, validée sur le principe) : après le niveau 50, une carte du monde par régions,
// chacune avec son propre arbre. Vrais donjons et sous-zones DofusDB ; rien n'est branché.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1250, height: 900 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:5173/');
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.evaluate(() => {
  const phone = (title, body) => `<div class="mq-phone"><div class="mq-cap">${title}</div><div class="mq-screen">${body}</div></div>`;
  const head = (t, back) => `<div class="mq-head">${back ? `<span class="mq-x">‹ ${back}</span>` : ''}<h2>${t}</h2><span class="mq-lv">Niveau 64</span></div>`;
  // [nom, couleur, niveaux, donjons faits / total, état]
  const R = [
    ['Le continent', '#8a7a5a', '1-50', 'Incarnam → Bworks', 'done'],
    ['Île des Wabbits', '#e89a3a', '52-80', '1 / 2 donjons', 'open'],
    ['Plaines de Cania', '#5aa82a', '55-160', '1 / 5 donjons', 'open'],
    ['Amakna (suite)', '#a8945a', '63-150', '0 / 5 donjons', 'open'],
    ['Île d’Otomaï', '#2f9a8a', '40-180', '1 / 6 donjons', 'open'],
    ['Landes de Sidimote', '#7a4e8a', '70-200', 'à venir', 'soon'],
    ['Saharach', '#d8b04a', '80-200', 'S’ouvre au niveau 70', 'lock'],
    ['Forêt des Abraknydes', '#4a6a2a', '90-140', 'S’ouvre au niveau 80', 'lock'],
    ['Île de Pandala', '#c8504a', '110-140', 'S’ouvre au niveau 100', 'lock'],
    ['Île de Frigost', '#6ab0e0', '120-200', 'S’ouvre au niveau 110', 'lock'],
  ];
  const card = ([n, c, lv, sub, st]) => `<div class="rg ${st}" style="--c:${c}"><i class="rg-band"></i><div class="rg-t"><b>${n}</b><small>${sub}</small></div>
    <span class="rg-lv">niv. ${lv}</span>${st === 'done' ? '<span class="rg-ok">✓</span>' : st === 'lock' ? '<span class="rg-lock">🔒</span>' : st === 'soon' ? '<span class="rg-soon">bientôt</span>' : '<span class="rg-go">›</span>'}</div>`;
  const s1 = `${head('Carte du monde')}<p class="mq-note">Chaque région s’ouvre au niveau de ton personnage (son premier donjon − 10) et a son propre arbre.</p>${R.map(card).join('')}`;

  // arbre d'Otomaï : étapes (cartes → donjon), vraies sous-zones et vrais boss
  const step = (lv, maps, dj, boss, st, need) => `<div class="st ${st}">
    <div class="st-lv">${lv}</div>
    <div class="st-body">
      ${maps.map(([m, l, w]) => `<div class="nd map ${st}"><span class="k">Carte · ${l}</span><b>${m}</b>${w ? `<em class="w">${w}</em>` : ''}</div>`).join('<div class="or">ou</div>')}
      <div class="arrow">↓</div>
      <div class="nd dj ${st}"><span class="k">Donjon · ${dj[1]}</span><b>${dj[0]}</b><small>Boss : ${boss}</small>${st === 'done' ? '<em class="w ok">Terminé</em>' : ''}</div>
      ${need ? `<div class="need">🔒 ${need}</div>` : ''}
    </div></div>`;
  const s2 = `${head('Île d’Otomaï', 'Monde')}
    <div class="rg-sets">Panoplies de la région : <b>Hichète</b> · Corailleur · Rasboul… (une par donjon, comme aujourd’hui)</div>
    <div class="tree">
      ${step('40-50', [['Plage de Corail', 40]], ['Grotte Hesque', 50], 'Corailleur Magistral', 'soon', 'À venir')}
      ${step('60-70', [['Arche d’Otomaï', 65, '3/3 victoires']], ['Cale de l’Arche d’Otomaï', 70], 'Gourlo le Terrible', 'done')}
      ${step('100-110', [['Plaines herbeuses', 100], ['Tourbière sans fond', 100]], ['Goulet du Rasboul', 110], 'Silf le Rasboul Majeur', 'lock', 'Niveau 100')}
      ${step('130-140', [['Jungle obscure', 130]], ['Laboratoire du Tynril', 140], '4 Tynril (un au hasard ?)', 'lock', 'Niveau 120')}
      ${step('150-160', [['Arbre Hakam', 150]], ['Canopée du Kimbo', 160], 'Kimbo', 'lock', 'Niveau 140')}
    </div>`;

  // région fermée : ce qu'on voit en la touchant
  const s3 = `${head('Carte du monde')}${R.slice(6).map(card).join('')}<div class="mq-dim"></div>
    <div class="mq-sheet"><div class="mq-grab"></div>
      <div class="sh-h"><i class="ico" style="--c:#6ab0e0"></i><div><h3>Île de Frigost</h3><small>Niveaux 120 à 200 · 17 donjons</small></div></div>
      <div class="lock-big">🔒 S’ouvre au niveau <b>110</b><br><span>Tu es niveau 64 : encore 46 niveaux</span></div>
      <div class="lbl">Premières étapes</div>
      <div class="src">Serre du Royalmouth · 120</div><div class="src">Excavation du Mansot Royal · 140</div><div class="src">Épave du Grolandais violent · 150</div>
      <div class="lbl">Comment ça s’ouvre</div>
      <p class="rule">Le niveau suffit : pas besoin de finir une autre région. Dans la région, chaque étape s’ouvre quand la précédente est finie <b>et</b> que tu as son niveau − 10.</p>
    </div>`;

  document.body.innerHTML = `<style>
    body{margin:0;background:#3a2414;font-family:var(--f-body);color:#3b2414}
    .mq-wrap{display:flex;gap:22px;padding:22px;align-items:flex-start}
    .mq-phone{width:375px}.mq-cap{color:#f3e6c8;font-family:var(--f-display);font-size:19px;margin:0 0 8px 4px}
    .mq-screen{position:relative;height:800px;overflow:hidden;border-radius:26px;background:#f1e4c6;padding:14px;box-sizing:border-box;box-shadow:0 0 0 4px #1d120a}
    .mq-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}.mq-head h2{font-family:var(--f-display);font-size:24px;margin:0;flex:1}
    .mq-x{border-radius:12px;padding:5px 10px;font-family:var(--f-display);box-shadow:inset 0 0 0 2.5px #3b2414;background:#fbf3e0;font-size:14px}
    .mq-lv{background:#bfe3a0;border-radius:20px;padding:3px 10px;font-weight:800;box-shadow:inset 0 0 0 2px #3b2414;font-size:12px}
    .mq-note{font-size:12px;color:#6b5236;margin:0 2px 8px}
    .rg{position:relative;display:flex;align-items:center;gap:8px;background:#fbf3e0;border-radius:14px;padding:9px 10px 9px 16px;margin-bottom:7px;box-shadow:inset 0 0 0 2px rgba(59,36,20,.22);overflow:hidden}
    .rg-band{position:absolute;left:0;top:0;bottom:0;width:7px;background:var(--c)}
    .rg-t{flex:1;display:flex;flex-direction:column;min-width:0}.rg-t b{font-family:var(--f-display);font-weight:400;font-size:16px}.rg-t small{font-size:11.5px;color:#6b5236}
    .rg-lv{font-size:11px;font-weight:800;background:#efe2c4;border-radius:9px;padding:2px 7px;white-space:nowrap}
    .rg-go{font-family:var(--f-display);font-size:22px;color:var(--c)}.rg-ok{color:#2c7a1a;font-weight:900;font-size:18px}.rg-soon{font-size:10px;font-weight:800;color:#8a7458;background:#e6d5b0;border-radius:8px;padding:2px 6px}
    .rg.lock{background:#e6d5b0;opacity:.8}.rg.lock .rg-band{filter:grayscale(.6)}.rg.done{background:#eef6e4}
    .rg-sets{font-size:11.5px;background:#fff4cf;border-radius:10px;padding:6px 9px;margin-bottom:8px;box-shadow:inset 0 0 0 1.5px #d9a93a}
    .tree{display:flex;flex-direction:column;gap:6px}
    .st{display:flex;gap:7px}.st-lv{width:42px;flex:none;font-size:10.5px;font-weight:800;color:#6b5236;text-align:center;padding-top:6px;border-right:3px solid #c9b48c}
    .st.done .st-lv{border-color:#5d8c3a;color:#2c7a1a}
    .st-body{flex:1;display:flex;flex-direction:column;align-items:stretch;gap:2px}
    .nd{position:relative;background:#fbf3e0;border-radius:11px;padding:5px 9px;box-shadow:inset 0 0 0 2px rgba(59,36,20,.25);display:flex;flex-direction:column}
    .nd .k{font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#8a7458}.nd b{font-size:13.5px}.nd small{font-size:10.5px;color:#6b5236}
    .nd.dj{background:#f6e7c0;box-shadow:inset 0 0 0 2px #b8862a}.nd.done{background:#e6f3d8;box-shadow:inset 0 0 0 2px #5d8c3a}
    .nd.lock,.nd.soon{opacity:.62}
    .w{position:absolute;right:8px;top:7px;font-style:normal;font-size:10px;font-weight:800;background:#d5efc0;color:#2c7a1a;border-radius:7px;padding:1px 6px}
    .arrow{text-align:center;font-size:12px;line-height:1;color:#8a7458}.or{text-align:center;font-size:9.5px;color:#8a7458;line-height:1.1}
    .need{font-size:10.5px;font-weight:800;color:#8a5a2a;margin-top:1px}
    .mq-dim{position:absolute;inset:0;background:rgba(30,18,8,.45)}
    .mq-sheet{position:absolute;left:0;right:0;bottom:0;top:230px;background:#fbf3e0;border-radius:24px 24px 0 0;padding:10px 16px 18px;box-shadow:0 -4px 0 #6ab0e0}
    .mq-grab{width:46px;height:5px;border-radius:3px;background:#c9b48c;margin:0 auto 10px}
    .sh-h{display:flex;align-items:center;gap:10px}.sh-h h3{margin:0;font-family:var(--f-display);font-weight:400;font-size:21px}.sh-h small{color:#6b5236}
    .ico{width:44px;height:44px;border-radius:12px;background:var(--c);box-shadow:inset 0 0 0 2.5px #3b2414}
    .lock-big{margin:12px 0 4px;background:#e6d5b0;border-radius:12px;padding:10px;text-align:center;font-size:15px}.lock-big span{font-size:12px;color:#6b5236}
    .lbl{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#8a7458;margin:12px 0 4px}
    .src{background:#f3e6c8;border-radius:9px;padding:6px 9px;margin-bottom:4px;font-size:13px;font-weight:700}
    .rule{font-size:12.5px;line-height:1.45;margin:0}
  </style><div class="mq-wrap">${phone('1 · Carte du monde (dès le Nid du Kwakwa ou les Bworks)', s1)}${phone('2 · Arbre d’une région : Otomaï', s2)}${phone('3 · Région encore fermée', s3)}</div>`;
});
await p.waitForTimeout(900);
await p.screenshot({ path: 'docs/maquette-regions.png', clip: { x: 0, y: 0, width: 1250, height: 880 } });
await b.close();
