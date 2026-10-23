// Maquette (proposition à Enzo) : refonte drop / craft — collection de panoplies de zone, Atelier par niveau avec recherche,
// forgemagie simplifiée. Vraies données (panoplie du Bouftou, vraies recettes) ; rien n'est branché.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1640, height: 900 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:5173/');
await p.waitForFunction(() => document.getElementById('loading')?.classList.contains('done'), null, { timeout: 60000 });
await p.evaluate(async () => {
  const { ITEMS, SETS, fmtLine } = await import('/src/game/data/items.ts');
  const { RECIPE_DATA } = await import('/src/game/data/items.gen.ts');
  const { itemIconUrl } = await import('/src/ui/item-icons.ts');
  const ic = (id, s = 40, cls = '') => `<img class="${cls}" src="${itemIconUrl(id)}" style="width:${s}px;height:${s}px;object-fit:contain">`;
  const setBy = (name) => Object.values(SETS).find((s) => s.name === name);
  const bouf = setBy('Panoplie du Bouftou'), royal = setBy('Panoplie du Bouftou Royal');
  const pieces = bouf.items.filter((i) => ITEMS[i]?.slot);
  const owned = new Set(pieces.slice(0, 5));
  const dup = { [pieces[0]]: 3, [pieces[2]]: 2 };
  const missing = pieces.find((i) => !owned.has(i) && RECIPE_DATA.some((r) => r.id === i)) ?? pieces[6];
  const rec = RECIPE_DATA.find((r) => r.id === missing);
  const bonusTxt = (s, n) => (s.bonus[n - 1] ?? []).slice(0, 2).map(([pp, v]) => fmtLine(pp, v)).join(' · ');
  const RAR = ['#8a7a5a', '#2f9a8a', '#7a4ec0'];
  const strip = ['chapeau', 'cape', 'amulette', 'anneau', 'anneau', 'ceinture', 'bottes', 'arme', 'bouclier', 'familier'].map((s, i) => {
    const id = i === 0 ? pieces[0] : i === 1 ? pieces[1] : i === 5 ? pieces[3] : null;
    return `<div class="mq-slot ${id ? 'full' : ''}">${id ? ic(id, 30) : `<span>${s}</span>`}</div>`;
  }).join('');
  const cell = (i) => {
    const has = owned.has(i), n = dup[i] ?? 1;
    return `<div class="pc ${has ? 'has' : 'miss'} ${i === missing ? 'sel' : ''}">${ic(i, 40, has ? '' : 'sil')}${has && n > 1 ? `<i class="cnt">×${n}</i>` : ''}${has && n >= 3 ? '<i class="mq-upb">▲</i>' : ''}</div>`;
  };
  const phone = (title, body) => `<div class="mq-phone"><div class="mq-cap">${title}</div><div class="mq-screen">${body}</div></div>`;
  const head = (t, k = true) => `<div class="mq-head"><h2>${t}</h2>${k ? '<span class="mq-k">2 500 K</span>' : ''}<span class="mq-x">Fermer</span></div>`;
  const tabs = (on) => `<div class="mq-tabs">${['Panoplies', 'Atelier', 'Ressources'].map((t) => `<span class="${t === on ? 'on' : ''}">${t}</span>`).join('')}</div>`;

  const s1 = `${head('Équipement')}${tabs('Panoplies')}
    <div class="mq-strip">${strip}</div>
    <div class="mq-zone">Zone : <b>Astrub · les Bouftous</b> ▾</div>
    <div class="set">
      <div class="set-h"><b>${bouf.name}</b><span class="prog">5 / ${pieces.length}</span></div>
      <div class="mq-bar"><i style="width:${(500 / pieces.length).toFixed(0)}%"></i></div>
      <div class="pcs">${pieces.map(cell).join('')}</div>
      <div class="set-b">Porté 3 : ${bonusTxt(bouf, 3)}<br><span class="dim">Complète : ${bonusTxt(bouf, pieces.length)}</span></div>
      <div class="mq-hint">▲ ${ITEMS[pieces[0]].name} : 3 exemplaires → <b>Améliorer en Rare</b></div>
    </div>
    <div class="set lock">
      <div class="set-h"><b>${royal.name}</b><span class="prog">0 / 8</span></div>
      <div class="pcs">${royal.items.filter((i) => ITEMS[i]?.slot).slice(0, 8).map((i) => `<div class="pc miss">${ic(i, 34, 'sil')}</div>`).join('')}</div>
      <div class="set-b dim">Objectif niveau 32 · Boss du Donjon des Bouftous</div>
    </div>
    <div class="mq-more">Objets fabriqués · 7 ›</div>`;

  const d = ITEMS[missing];
  const ing = rec ? rec.ingredients.map(([id, n], k) => `<div class="ing">${ic(id, 28)}<span>${ITEMS[id]?.name ?? id}</span><b class="${k === 0 ? 'no' : 'ok'}">${k === 0 ? Math.max(0, n - 3) : n}/${n}</b></div>`).join('') : '';
  const s2 = `${head('Équipement')}${tabs('Panoplies')}<div class="mq-strip">${strip}</div><div class="mq-dim"></div>
    <div class="mq-sheet">
      <div class="mq-grab"></div>
      <div class="sh-h"><span class="big">${ic(missing, 56, 'sil')}</span><div><h3>${d.name}</h3><small>Pas encore obtenue · niveau ${d.level}</small></div></div>
      <div class="lbl">Où la trouver</div>
      <div class="src">⚔ Élites de la zone (Bouftou d’élite) · 20 %</div>
      <div class="src">♛ Boss : Bouftou Royal · 50 %</div>
      <div class="lbl">Ou la fabriquer</div>
      ${ing}
      <div class="mq-big dis">Fabriquer · il manque 3 ressources</div>
      <div class="lines">${d.effects.slice(0, 3).map(([pp, a, bb]) => `<span>${fmtLine(pp, bb)}</span>`).join('')}</div>
    </div>`;

  const lv = 22;
  const recs = RECIPE_DATA.filter((r) => ITEMS[r.id]?.slot && !ITEMS[r.id].set && ITEMS[r.id].slot !== 'dofus' && ITEMS[r.id].level >= lv - 5 && ITEMS[r.id].level <= lv + 5);
  const rows = recs.slice(0, 6).map((r, k) => {
    const it = ITEMS[r.id];
    const tag = k === 0 ? '<span class="tg ok">Fabricable</span>' : k === 1 ? '<span class="tg ok">Fabricable</span>' : `<span class="tg no">Il manque ${k}</span>`;
    const cmp = k % 3 === 0 ? '<span class="tg mup">▲ Mieux</span>' : '';
    return `<div class="row">${ic(r.id, 36)}<div class="rt"><b>${it.name}</b><small>niv. ${it.level} · ${it.effects.filter(([, , bb]) => bb > 0).slice(0, 2).map(([pp, , bb]) => fmtLine(pp, bb)).join(' · ')}</small></div><div class="tags">${tag}${cmp}</div></div>`;
  }).join('');
  const s3 = `${head('Équipement')}${tabs('Atelier')}
    <div class="search">🔍 <span>Chercher n’importe quel objet, tous niveaux…</span></div>
    <div class="chips">${['Tout', 'Chapeau', 'Cape', 'Amulette', 'Anneau', 'Ceinture', 'Bottes', 'Arme'].map((c) => `<span class="${c === 'Tout' ? 'on' : ''}">${c}</span>`).join('')}</div>
    <div class="range">Autour de ton niveau : <b>${lv - 5} à ${lv + 5}</b> · ${recs.length} recettes</div>
    <div class="sub">Fabricables d’abord · plus de niveau d’Artisan</div>
    ${rows}`;

  const fmItem = pieces[0];
  const fl = ITEMS[fmItem].effects.slice(0, 3);
  const s4 = `${head('Forgemagie')}
    <div class="sh-h" style="margin:6px 0 10px">${ic(fmItem, 54)}<div><h3>${ITEMS[fmItem].name}</h3><small>Commun · niveau ${ITEMS[fmItem].level}</small></div></div>
    <div class="last ok">Réussi : ${fmtLine(fl[0][0], fl[0][2] + 1)} · −21 K</div>
    ${fl.map(([pp, a, bb], k) => `<div class="fm"><div><b>${fmtLine(pp, bb + (k === 0 ? 1 : 0))}</b><small>jet max ${bb} · plafond ${bb + 5}</small></div><span class="rune">+1 <small>${k === 0 ? 70 : 90} % · ${21 * (k + 1)} K</small></span></div>`).join('')}
    <div class="fm add"><div><b>+ Nouvelle ligne</b><small>rare : 10 % · une seule par objet</small></div><span class="rune">rune</span></div>
    <div class="rules"><b>Règles simplifiées</b><br>• Réussi : la stat monte.<br>• Raté : la rune est perdue, <b>rien d’autre</b> (plus de puits, plus de pertes sur les autres lignes).<br>• Plus la ligne dépasse son jet max, plus c’est dur.<br>• Chaque rune se paie en kamas.</div>`;

  document.body.innerHTML = `<style>
    body{margin:0;background:#3a2414;font-family:var(--f-body);color:#3b2414}
    .mq-wrap{display:flex;gap:22px;padding:22px;align-items:flex-start}
    .mq-phone{width:375px}.mq-cap{color:#f3e6c8;font-family:var(--f-display);font-size:19px;margin:0 0 8px 4px}
    .mq-screen{position:relative;height:780px;overflow:hidden;border-radius:26px;background:#f1e4c6;padding:14px;box-sizing:border-box;box-shadow:0 0 0 4px #1d120a}
    .mq-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}.mq-head h2{font-family:var(--f-display);font-size:25px;margin:0;flex:1}
    .mq-k{background:#f6dc8c;border-radius:20px;padding:3px 10px;font-weight:800;box-shadow:inset 0 0 0 2px #3b2414;font-size:13px}
    .mq-x{border-radius:12px;padding:5px 12px;font-family:var(--f-display);box-shadow:inset 0 0 0 2.5px #3b2414;background:#fbf3e0}
    .mq-tabs{display:flex;background:#d9c8a2;border-radius:14px;padding:3px;margin-bottom:10px}.mq-tabs span{flex:1;text-align:center;padding:7px 0;font-family:var(--f-display);font-size:15px;color:#6b5236}.mq-tabs .on{background:#fbf3e0;border-radius:11px;color:#3b2414;box-shadow:inset 0 0 0 2px #3b2414}
    .mq-strip{display:grid;grid-template-columns:repeat(10,1fr);gap:3px}.mq-slot{height:34px;border-radius:8px;background:#e6d5b0;display:grid;place-items:center;box-shadow:inset 0 0 0 1.5px rgba(59,36,20,.25)}.mq-slot span{font-size:6.5px;color:#8a7458}.mq-slot.full{background:#fbf3e0}
    .mq-zone{margin:10px 2px 8px;font-size:13px}
    .set{background:#fbf3e0;border-radius:14px;padding:10px;margin-bottom:9px;box-shadow:inset 0 0 0 2px rgba(59,36,20,.2)}.set.lock{opacity:.8}
    .set-h{display:flex;justify-content:space-between;align-items:center}.set-h b{font-family:var(--f-display);font-weight:400;font-size:16px}.prog{font-weight:800;background:#3b2414;color:#fbf3e0;border-radius:9px;padding:1px 8px;font-size:12px}
    .mq-bar{height:7px;border-radius:4px;background:#e6d5b0;margin:6px 0 8px;overflow:hidden}.mq-bar i{display:block;height:100%;background:#5d8c3a}
    .pcs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.pc{position:relative;height:56px;border-radius:11px;display:grid;place-items:center;background:#f3e6c8}.pc.has{box-shadow:inset 0 0 0 2px #8a7a5a}.pc.miss{background:#e6d5b0}.pc.sel{box-shadow:inset 0 0 0 3px #3a8ac0}
    .sil{filter:brightness(0) opacity(.28)}.cnt{position:absolute;right:3px;bottom:2px;font-style:normal;font-size:11px;font-weight:800}.mq-upb{position:absolute;top:-6px;right:-5px;font-style:normal;background:#7a4ec0;color:#fff;border-radius:9px;font-size:10px;padding:1px 5px}
    .set-b{font-size:11.5px;margin-top:8px;line-height:1.4}.dim{color:#8a7458}
    .mq-hint{margin-top:7px;font-size:12px;border-radius:9px;padding:5px 8px}.mq-hint{background:#efe4fb;color:#5a3a96}
    .mq-more{font-weight:800;font-size:13px;padding:8px 4px}
    .mq-dim{position:absolute;inset:0;background:rgba(30,18,8,.45)}
    .mq-sheet{position:absolute;left:0;right:0;bottom:0;top:160px;background:#fbf3e0;border-radius:24px 24px 0 0;padding:10px 16px 18px;box-shadow:0 -4px 0 #3a8ac0}
    .mq-grab{width:46px;height:5px;border-radius:3px;background:#c9b48c;margin:0 auto 10px}
    .sh-h{display:flex;align-items:center;gap:10px}.sh-h h3{margin:0;font-family:var(--f-display);font-weight:400;font-size:20px}.sh-h small{color:#6b5236}.big{width:66px;height:66px;border-radius:12px;background:#e6d5b0;display:grid;place-items:center}
    .lbl{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#8a7458;margin:12px 0 4px}
    .src{background:#f3e6c8;border-radius:9px;padding:6px 9px;margin-bottom:4px;font-size:13px;font-weight:700}
    .ing{display:flex;align-items:center;gap:8px;padding:3px 0;font-size:13px}.ing span{flex:1}.ing .ok{color:#2c7a1a}.ing .no{color:#c0402a}
    .mq-big{background:#2f9a8a;color:#fff;text-align:center;font-family:var(--f-display);font-size:18px;border-radius:14px;padding:10px;box-shadow:inset 0 0 0 2.5px #3b2414;margin:10px 0 6px}.mq-big.dis{background:#b9a68a}
    .lines{display:flex;flex-wrap:wrap;gap:6px;font-size:12px}.lines span{background:#f3e6c8;border-radius:8px;padding:3px 7px}
    .search{background:#fbf3e0;border-radius:12px;padding:9px 11px;box-shadow:inset 0 0 0 2px #3b2414;font-size:13px;color:#8a7458;margin-bottom:8px}
    .chips{display:flex;gap:5px;overflow:hidden;margin-bottom:7px}.chips span{white-space:nowrap;padding:5px 9px;border-radius:14px;background:#e6d5b0;font-size:12px;font-weight:700}.chips .on{background:#3b2414;color:#fbf3e0}
    .range{font-size:13px;margin:2px}.sub{font-size:11px;color:#8a7458;margin:0 2px 6px}
    .row{display:flex;align-items:center;gap:8px;background:#fbf3e0;border-radius:12px;padding:6px 8px;margin-bottom:5px}.rt{flex:1;min-width:0;display:flex;flex-direction:column}.rt b{font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rt small{font-size:11px;color:#6b5236;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .tags{display:flex;flex-direction:column;gap:3px;align-items:flex-end}.tg{font-size:10.5px;font-weight:800;border-radius:8px;padding:2px 6px;white-space:nowrap}.tg.ok{background:#d5efc0;color:#2c7a1a}.tg.no{background:#eadfca;color:#8a7458}.tg.mup{background:#2c7a1a;color:#fff}
    .last{border-radius:10px;padding:7px 10px;font-weight:800;margin-bottom:8px}.last.ok{background:#d5efc0;color:#2c7a1a}
    .fm{display:flex;align-items:center;justify-content:space-between;background:#fbf3e0;border-radius:12px;padding:8px 10px;margin-bottom:6px}.fm div{display:flex;flex-direction:column}.fm b{font-size:15px}.fm small{font-size:11px;color:#8a7458}
    .rune{background:#7a4ec0;color:#fff;border-radius:10px;padding:5px 9px;font-family:var(--f-display);font-size:15px;display:flex;flex-direction:column;align-items:center}.rune small{font-family:var(--f-body);font-size:10px;color:#eadcff!important}
    .fm.add{background:#efe4fb}
    .rules{font-size:12.5px;line-height:1.5;background:#fff4cf;border-radius:12px;padding:9px 11px;margin-top:8px;box-shadow:inset 0 0 0 2px #d9a93a}
  </style><div class="mq-wrap">${phone('1 · Panoplies de la zone', s1)}${phone('2 · Pièce manquante', s2)}${phone('3 · Atelier (le reste du stuff)', s3)}${phone('4 · Forgemagie simplifiée', s4)}</div>`;
});
await p.waitForTimeout(900);
await p.screenshot({ path: 'docs/maquette-panoplies.png', clip: { x: 0, y: 0, width: 1640, height: 860 } });
await b.close();
