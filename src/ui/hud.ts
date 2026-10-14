import './hud.css';
import { SACRIEUR_FACE_BOX, sacrieurSvg } from '../art/sacrieur';
import { COLOR_SLOTS, SACRI_COLORS, type SacriColors } from '../art/sacrieur-chibi';
import { ICONS } from './grimoire-icons';
import type { SheetView } from './sheet-view';
import type { InvView, ItemDetail } from './inv-view';
import type { CraftView } from './craft-view';

/** Une case de sort telle qu'affichée (null = case vide). */
export type SlotView = { icon: string; name: string; pa: number } | null;
/** Une carte de l'écran de choix entre les salles. */
export interface CardView {
  tag: string;
  title: string;
  text: string;
  icon: string;
  kind: 'spell' | 'upgrade' | 'stat' | 'passive';
}

const PA_MAX = 6;

/** Tête du Sacrieur recadrée pour le médaillon (même dessin que le personnage en jeu). */
const portraitSvg = (c?: SacriColors) => sacrieurSvg('head', c).replace(/viewBox="[^"]*" width="\d+" height="\d+"/, `viewBox="${SACRIEUR_FACE_BOX}"`);

const PAUSE_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="5.5" y="4.5" width="4.6" height="15" rx="2" fill="#3b2414"/><rect x="13.9" y="4.5" width="4.6" height="15" rx="2" fill="#3b2414"/></svg>`;

/** Interface de combat (DOM au-dessus du canvas), charte « grimoire d'aventurier ». */
export class Hud {
  readonly root: HTMLElement;
  private paFill!: HTMLElement;
  private paVal!: HTMLElement;
  private spellEls: HTMLElement[] = [];
  readonly joy: HTMLElement;
  readonly knob: HTMLElement;
  readonly hint: HTMLElement;
  readonly bar: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    root.innerHTML = `
      <div class="top">
        <div class="medal">
          <div class="face">${portraitSvg()}</div>
          <div class="level gr-num">10</div>
        </div>
        <div class="plaque gr-panel">
          <div class="dj">Crypte de Kardorim</div>
          <div class="rooms"></div>
        </div>
        <button class="pause gr-wiggle" aria-label="Pause">${PAUSE_SVG}</button>
      </div>
      <div class="hint">Glisse le pouce pour te déplacer</div>
      <div class="joy idle"><div class="base"></div><div class="knob"></div></div>
      <div class="pa-side" aria-label="Points d'action">
        <span class="ico">${ICONS.pa.svg}</span>
        <span class="vtrack"><span class="vfill"></span><span class="ticks"></span></span>
        <span class="val gr-num">6</span>
      </div>
      <div class="bar"><div class="spells"></div></div>
      <div class="bossbar gr-panel" hidden>
        <div class="bname"></div>
        <div class="bres"></div>
        <div class="gr-gauge"><span class="track"><span class="fill" style="--c: var(--magic)"></span></span><span class="val gr-num"></span></div>
      </div>
      <div class="toast-wrap"><div class="gr-toast toast" hidden></div></div>
      <div class="picker" hidden>
        <div class="pk-head"><h2 class="gr-title"></h2><p class="pk-sub"></p></div>
        <div class="pk-cards"></div>
        <div class="pk-book gr-panel"><div class="gr-label pk-booklbl"></div><div class="pk-slots"></div></div>
      </div>
      <div class="camp gr-paper" hidden>
        <h1 class="gr-title">Dofus <span>version Enzo</span></h1>
        <div class="camp-hero">${sacrieurSvg()}</div>
        <div class="camp-name"><b>Sacrieur</b><span class="gr-chip lvl">Niveau 10</span></div>
        <div class="camp-xp xpbar"><span class="track"><span class="fill"></span></span><span class="gr-num txt"></span></div>
        <div class="camp-btns">
          <button type="button" class="gr-btn magic sm sheet-btn">Caractéristiques<span class="badge gr-num" hidden></span></button>
          <button type="button" class="gr-btn turquoise sm inv-btn">Inventaire<span class="badge gr-num" hidden></span></button>
          <button type="button" class="gr-btn sm look-btn">Apparence</button>
          <button type="button" class="gr-btn leaf sm craft-btn">Artisan<span class="badge gr-num" hidden></span></button>
        </div>
        <div class="camp-records"></div>
        <div class="camp-dj gr-panel gold">
          <div class="dj-txt"><span class="gr-label">Donjon · niveau 10</span><b>Crypte de Kardorim</b><span class="dj-sub">9 salles · mini-boss · Kardorim</span></div>
          <button type="button" class="gr-btn enter">Entrer</button>
        </div>
        <div class="camp-soon"><span class="gr-label">Bientôt au camp</span>
          <div><span class="gr-chip">${ICONS.pa.svg}Grimoire</span><span class="gr-chip">${ICONS.carte.svg}Donjons</span></div>
        </div>
      </div>
      <div class="summary" hidden><div class="sum-card gr-panel gold">
        <h2 class="gr-title"></h2><p class="sum-sub"></p>
        <div class="sum-stats"></div>
        <div class="sum-cards"></div>
        <div class="sum-xp"></div>
        <div class="sum-items"></div>
        <p class="sum-loot"></p>
        <button type="button" class="gr-btn turquoise back">Retour au camp</button>
      </div></div>
      <div class="sheet gr-paper" hidden>
        <div class="sh-head">
          <div><h2 class="gr-h2">Caractéristiques</h2><span class="gr-chip lvl"></span></div>
          <button type="button" class="gr-btn ghost sm close">Fermer</button>
        </div>
        <div class="sh-xp xpbar"><span class="track"><span class="fill"></span></span><span class="gr-num txt"></span></div>
        <div class="sh-free"><span class="gr-label">Points à répartir</span><b class="gr-num"></b><button type="button" class="gr-btn ghost sm reset">Tout réinitialiser</button></div>
        <div class="sh-caracs"></div>
        <div class="gr-tabs sh-tabs"></div>
        <div class="sh-rows"></div>
      </div>
      <div class="inv gr-paper" hidden>
        <div class="sh-head"><h2 class="gr-h2">Inventaire</h2><button type="button" class="gr-btn ghost sm close">Fermer</button></div>
        <div class="inv-doll">
          <div class="col left"></div>
          <div class="hero">${sacrieurSvg()}</div>
          <div class="col right"></div>
          <div class="row bottom"></div>
        </div>
        <div class="inv-sets"></div>
        <div class="gr-tabs inv-tabs"><button type="button" class="gr-tab on" data-t="0">Équipements</button><button type="button" class="gr-tab" data-t="1">Ressources</button></div>
        <div class="inv-grid"></div>
        <div class="inv-detail" hidden><div class="det-card gr-panel gold"></div></div>
      </div>
      <div class="atelier gr-paper" hidden>
        <div class="sh-head"><div><h2 class="gr-h2">Artisan</h2><span class="gr-chip lvl"></span></div><button type="button" class="gr-btn ghost sm close">Fermer</button></div>
        <div class="at-xp xpbar"><span class="track"><span class="fill"></span></span><span class="gr-num txt"></span></div>
        <div class="gr-tabs at-tabs"><button type="button" class="gr-tab on" data-t="0">Disponibles</button><button type="button" class="gr-tab" data-t="1">Toutes les recettes</button></div>
        <div class="at-list"></div>
      </div>
      <div class="look gr-paper" hidden>
        <div class="sh-head"><h2 class="gr-h2">Apparence</h2><button type="button" class="gr-btn ghost sm close">Fermer</button></div>
        <div class="look-hero"></div>
        <div class="look-rows"></div>
        <div class="look-btns"><button type="button" class="gr-btn sm magic rnd">Aléatoire</button><button type="button" class="gr-btn sm ghost reset">Couleurs du jeu</button></div>
      </div>
      <div class="overlay" hidden><div class="card gr-panel gold"><h2 class="gr-title"></h2><p></p><button type="button" class="gr-btn btn"></button></div></div>`;
    this.paFill = root.querySelector('.pa-side .vfill')!;
    this.paVal = root.querySelector('.pa-side .val')!;
    root.querySelector('.pa-side .ticks')!.innerHTML = '<i></i>'.repeat(PA_MAX - 1);
    this.joy = root.querySelector('.joy')!;
    this.knob = root.querySelector('.joy .knob')!;
    this.hint = root.querySelector('.hint')!;
    this.bar = root.querySelector('.bar')!;

    this.setRooms(1, 9);
  }

  private slotsKey = '';
  /** Cases de sorts du combat (ordre = priorité). Ne reconstruit que si le contenu change. */
  setSlots(slots: SlotView[]) {
    const key = slots.map((s) => s?.name ?? '-').join('|');
    if (key === this.slotsKey) return;
    this.slotsKey = key;
    const box = this.root.querySelector('.spells')!;
    box.innerHTML = '';
    this.spellEls = slots.map((s, i) => {
      const el = document.createElement('div');
      el.className = s ? 'spell' : 'spell empty';
      el.innerHTML = s
        ? `<div class="art">${s.icon}</div><div class="cd"></div><div class="prio gr-num">${i + 1}</div><div class="cost gr-num">${s.pa}</div>`
        : `<div class="prio gr-num">${i + 1}</div><span class="plus">+</span>`;
      box.appendChild(el);
      return el;
    });
  }

  /**
   * Écran de choix entre deux salles : 3 cartes, et les cases de sorts en dessous
   * (toucher deux sorts les échange : c'est l'ordre de priorité). Résout l'indice de la carte choisie.
   */
  pickCard(cards: CardView[], slots: SlotView[], onSwap: (a: number, b: number) => SlotView[]): Promise<number> {
    const el = this.root.querySelector<HTMLElement>('.picker')!;
    el.querySelector('h2')!.textContent = 'Choisis une carte';
    el.querySelector('.pk-sub')!.textContent = 'Valable jusqu’à la fin du donjon.';
    el.querySelector('.pk-booklbl')!.textContent = 'Tes sorts · touche deux sorts pour changer leur ordre';
    const box = el.querySelector('.pk-cards')!;
    box.innerHTML = cards.map((c, i) => `
      <button type="button" class="pk-card gr-panel k-${c.kind}" data-i="${i}" style="animation-delay:${i * 70}ms">
        <span class="pk-tag gr-chip">${c.tag}</span>
        <span class="pk-ico">${c.icon}</span>
        <span class="pk-title">${c.title}</span>
        <span class="pk-text">${c.text}</span>
      </button>`).join('');
    let sel = -1;
    const drawSlots = (list: SlotView[]) => {
      const sb = el.querySelector('.pk-slots')!;
      sb.innerHTML = list.map((s, i) => `<button type="button" class="pk-slot ${s ? '' : 'empty'} ${i === sel ? 'sel' : ''}" data-s="${i}">
        <span class="prio gr-num">${i + 1}</span>${s ? `<span class="art">${s.icon}</span>` : '<span class="plus">+</span>'}</button>`).join('');
      sb.querySelectorAll<HTMLButtonElement>('.pk-slot').forEach((b) => (b.onclick = () => {
        const i = Number(b.dataset.s);
        if (!list[i]) return;
        if (sel < 0) sel = i;
        else {
          if (sel !== i) list = onSwap(sel, i);
          sel = -1;
        }
        drawSlots(list);
      }));
    };
    drawSlots(slots);
    el.hidden = false;
    return new Promise((resolve) => {
      box.querySelectorAll<HTMLButtonElement>('.pk-card').forEach((b) => (b.onclick = () => {
        el.hidden = true;
        resolve(Number(b.dataset.i));
      }));
    });
  }

  /** Toutes les cases sont prises : quel sort remplacer ? */
  chooseReplace(title: string, slots: SlotView[]): Promise<number> {
    const el = this.root.querySelector<HTMLElement>('.picker')!;
    el.querySelector('h2')!.textContent = title;
    el.querySelector('.pk-sub')!.textContent = 'Toutes tes cases sont prises : touche le sort à remplacer.';
    el.querySelector('.pk-booklbl')!.textContent = 'Tes sorts';
    el.querySelector('.pk-cards')!.innerHTML = '';
    const sb = el.querySelector('.pk-slots')!;
    sb.innerHTML = slots.map((s, i) => `<button type="button" class="pk-slot big" data-s="${i}"><span class="prio gr-num">${i + 1}</span>${s ? `<span class="art">${s.icon}</span><span class="nm">${s.name}</span>` : ''}</button>`).join('');
    el.hidden = false;
    return new Promise((resolve) => {
      sb.querySelectorAll<HTMLButtonElement>('.pk-slot').forEach((b) => (b.onclick = () => {
        el.hidden = true;
        resolve(Number(b.dataset.s));
      }));
    });
  }

  /** Progression dans le donjon : salle courante (1..n), la dernière est celle du boss. */
  setRooms(cur: number, total: number) {
    const el = this.root.querySelector('.rooms')!;
    const pips = [...Array(total)].map((_, i) => {
      const n = i + 1;
      const cls = [i === total - 1 ? 'boss' : '', n < cur ? 'done' : '', n === cur ? 'cur' : ''].filter(Boolean).join(' ');
      return `<i class="${cls}"></i>`;
    });
    el.innerHTML = `<span class="pips">${pips.join('')}</span><span class="lbl gr-num">${cur === total ? 'Boss' : `Salle ${cur}/${total}`}</span>`;
  }

  /** Hauteur occupée par la barre du bas (pour cadrer la caméra au-dessus). */
  bottomInset(): number {
    return window.innerHeight - this.bar.getBoundingClientRect().top;
  }
  topInset(): number {
    return (this.root.querySelector('.top') as HTMLElement).getBoundingClientRect().bottom;
  }

  /** Barre de vie du boss sous la plaque du donjon (null pour la cacher). */
  setBoss(name: string | null, hp = 0, max = 1, res?: string) {
    const el = this.root.querySelector<HTMLElement>('.bossbar')!;
    el.hidden = name === null;
    if (name === null) return;
    el.querySelector('.bname')!.textContent = name;
    if (res !== undefined) {
      const r = el.querySelector<HTMLElement>('.bres')!;
      r.textContent = res;
      r.hidden = !res;
    }
    el.querySelector<HTMLElement>('.fill')!.style.setProperty('--v', `${(100 * Math.max(0, hp)) / max}%`);
    el.querySelector('.val')!.textContent = `${Math.max(0, Math.round(hp))}/${max}`;
  }

  setLevel(level: number) {
    this.root.querySelector('.medal .level')!.textContent = String(level);
  }
  /** Jauge de PA verticale sur le côté de l'écran. */
  setPa(pa: number) {
    this.paFill.style.setProperty('--v', `${(100 * Math.min(pa, PA_MAX)) / PA_MAX}%`);
    this.paVal.textContent = String(Math.floor(pa));
  }
  /** cd : fraction restante du cooldown (0 = prêt) ; noPa : pas assez de PA. */
  setCooldown(i: number, cd: number, noPa = false) {
    const el = this.spellEls[i];
    if (!el) return;
    el.style.setProperty('--cd', String(Math.max(0, Math.min(1, cd))));
    el.classList.toggle('nopa', noPa);
  }
  flashCast(i: number) {
    const el = this.spellEls[i];
    if (!el) return;
    el.classList.remove('cast');
    void el.offsetWidth;
    el.classList.add('cast');
  }
  placeHint(y: number) {
    this.hint.style.top = `${y}px`;
  }

  get pauseButton(): HTMLButtonElement {
    return this.root.querySelector('.pause')!;
  }

  private toastTimer = 0;
  /** Message court au centre de l'écran (« Salle terminée ! »). */
  toast(text: string, ms = 1600) {
    const el = this.root.querySelector<HTMLElement>('.toast')!;
    el.textContent = text;
    el.hidden = false;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => (el.hidden = true), ms);
  }

  /** Écran plein (défaite, pause, fin de démo) avec un bouton. Retourne une promesse résolue au clic. */
  overlay(title: string, text: string, button: string): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.overlay')!;
    el.querySelector('h2')!.textContent = title;
    el.querySelector('p')!.textContent = text;
    const btn = el.querySelector<HTMLButtonElement>('.btn')!;
    btn.textContent = button;
    el.hidden = false;
    return new Promise((resolve) => {
      btn.onclick = () => {
        el.hidden = true;
        resolve();
      };
    });
  }

  get overlayOpen(): boolean {
    return ['.overlay', '.picker', '.camp', '.summary', '.sheet', '.inv', '.look', '.atelier'].some((q) => !this.root.querySelector<HTMLElement>(q)!.hidden);
  }

  /** Écran d'accueil : le Sacrieur, son niveau, ses records, et l'entrée du donjon. Résout quand on entre. */
  camp(
    rec: { runs: number; wins: number; bestRoom: number; bestWinTime: number | null },
    sheet: () => SheetView,
    act: { invest(id: string, n: number): void; reset(): void },
    inv?: InvHooks,
    look?: { get(): SacriColors; set(c: SacriColors): void },
    work?: CraftHooks,
  ): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.camp')!;
    const lookBtn = el.querySelector<HTMLButtonElement>('.look-btn')!;
    lookBtn.hidden = !look;
    lookBtn.onclick = async () => {
      if (!look) return;
      await this.appearance(look);
    };
    if (look) this.setHeroLook(look.get());
    const craftBtn = el.querySelector<HTMLButtonElement>('.craft-btn')!;
    craftBtn.hidden = !work;
    const craftBadge = () => {
      const b = craftBtn.querySelector<HTMLElement>('.badge')!;
      const n = work ? work.get().rows.filter((r) => r.ok).length : 0;
      b.hidden = n <= 0;
      b.textContent = String(n);
    };
    craftBadge();
    craftBtn.onclick = async () => {
      if (!work) return;
      await this.atelier(work);
      craftBadge();
      refresh();
    };
    const refresh = () => {
      const v = sheet();
      el.querySelector('.lvl')!.textContent = `Niveau ${v.level}`;
      setXpBar(el.querySelector('.camp-xp')!, v);
      const badge = el.querySelector<HTMLElement>('.sheet-btn .badge')!;
      badge.hidden = v.free <= 0;
      badge.textContent = String(v.free);
      this.setLevel(v.level);
      const nb = el.querySelector<HTMLElement>('.inv-btn .badge')!;
      const fresh = inv ? inv.get().equipment.filter((e) => e.fresh).length : 0;
      nb.hidden = fresh <= 0;
      nb.textContent = String(fresh);
    };
    const invBtn = el.querySelector<HTMLButtonElement>('.inv-btn')!;
    invBtn.hidden = !inv;
    invBtn.onclick = async () => {
      if (!inv) return;
      await this.inventory(inv);
      refresh();
    };
    refresh();
    el.querySelector<HTMLButtonElement>('.sheet-btn')!.onclick = async () => {
      await this.charSheet(sheet, act);
      refresh();
    };
    const t = rec.bestWinTime;
    el.querySelector('.camp-records')!.innerHTML = [
      ['Parties', String(rec.runs)],
      ['Victoires', String(rec.wins)],
      ['Plus loin', rec.bestRoom ? `Salle ${rec.bestRoom}` : '—'],
      ['Record', t === null ? '—' : `${Math.floor(t / 60)} min ${String(Math.round(t % 60)).padStart(2, '0')}`],
    ].map(([k, v]) => `<div><span class="gr-label">${k}</span><b class="gr-num">${v}</b></div>`).join('');
    el.hidden = false;
    return new Promise((resolve) => {
      el.querySelector<HTMLButtonElement>('.enter')!.onclick = () => {
        el.hidden = true;
        resolve();
      };
    });
  }

  private sheetTab = 0;
  /** Fiche de caractéristiques : répartition des points, remise à zéro, et toute la fiche Dofus. */
  charSheet(get: () => SheetView, act: { invest(id: string, n: number): void; reset(): void }): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.sheet')!;
    const render = () => {
      const v = get();
      el.querySelector('.sh-head .lvl')!.textContent = `Niveau ${v.level}`;
      setXpBar(el.querySelector('.sh-xp')!, v);
      el.querySelector('.sh-free b')!.textContent = String(v.free);
      el.querySelector('.sh-free')!.classList.toggle('has', v.free > 0);
      el.querySelector('.sh-caracs')!.innerHTML = v.caracs.map((c) => `
        <div class="sh-carac" data-id="${c.id}">
          <span class="ico">${c.icon}</span>
          <span class="nm">${c.name}<small>${c.gear ? `${c.invested} + ${c.gear} équipement` : `${c.invested} investis`} · ${c.cost} pt${c.cost > 1 ? 's' : ''} pour +1</small></span>
          <b class="gr-num">${c.total}</b>
          <button type="button" class="add gr-num" data-n="1" ${c.canAdd ? '' : 'disabled'}>+1</button>
          <button type="button" class="add gr-num" data-n="10" ${c.canAdd ? '' : 'disabled'}>+10</button>
        </div>`).join('');
      el.querySelector('.sh-tabs')!.innerHTML = v.tabs.map((t, i) => `<button type="button" class="gr-tab ${i === this.sheetTab ? 'on' : ''}" data-i="${i}">${t.title}</button>`).join('');
      el.querySelector('.sh-rows')!.innerHTML = v.tabs[this.sheetTab].rows.map(([k, x]) => `<div><span>${k}</span><b class="gr-num">${x}</b></div>`).join('');
    };
    el.onclick = (e) => {
      const t = e.target as HTMLElement;
      const add = t.closest<HTMLButtonElement>('.add');
      if (add && !add.disabled) {
        act.invest(add.closest<HTMLElement>('.sh-carac')!.dataset.id!, Number(add.dataset.n));
        render();
      }
      const tab = t.closest<HTMLElement>('.gr-tab');
      if (tab) {
        this.sheetTab = Number(tab.dataset.i);
        render();
      }
    };
    el.querySelector<HTMLButtonElement>('.reset')!.onclick = () => {
      act.reset();
      render();
    };
    render();
    el.hidden = false;
    return new Promise((resolve) => {
      el.querySelector<HTMLButtonElement>('.close')!.onclick = () => {
        el.hidden = true;
        resolve();
      };
    });
  }

  /** Met à jour le Sacrieur affiché (médaillon, camp, inventaire) avec ses couleurs. */
  setHeroLook(c: SacriColors) {
    this.root.querySelector('.medal .face')!.innerHTML = portraitSvg(c);
    this.root.querySelector('.camp-hero')!.innerHTML = sacrieurSvg(undefined, c);
    this.root.querySelector('.inv-doll .hero')!.innerHTML = sacrieurSvg(undefined, c);
  }

  /** Apparence : les 6 couleurs du Sacrieur, aperçu en direct, aléatoire, couleurs du jeu. */
  appearance(h: { get(): SacriColors; set(c: SacriColors): void }): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.look')!;
    const render = () => {
      const c = h.get();
      el.querySelector('.look-hero')!.innerHTML = sacrieurSvg(undefined, c);
      el.querySelector('.look-rows')!.innerHTML = COLOR_SLOTS.map((s) =>
        `<label class="look-row"><span>${s.label}</span><code class="gr-num">${c[s.key].toUpperCase()}</code><input type="color" data-k="${s.key}" value="${c[s.key].toLowerCase()}"></label>`).join('');
      this.setHeroLook(c);
    };
    const preview = () => {
      el.querySelector('.look-hero')!.innerHTML = sacrieurSvg(undefined, h.get());
    };
    el.oninput = (e) => {
      const t = e.target as HTMLInputElement;
      if (!t.dataset.k) return;
      h.set({ ...h.get(), [t.dataset.k]: t.value.toUpperCase() });
      t.previousElementSibling!.textContent = t.value.toUpperCase();
      preview();
    };
    el.onchange = () => render();
    el.querySelector<HTMLButtonElement>('.rnd')!.onclick = () => {
      h.set(randomColors());
      render();
    };
    el.querySelector<HTMLButtonElement>('.reset')!.onclick = () => {
      h.set({ ...SACRI_COLORS });
      render();
    };
    render();
    el.hidden = false;
    return new Promise((resolve) => {
      el.querySelector<HTMLButtonElement>('.close')!.onclick = () => {
        el.hidden = true;
        this.setHeroLook(h.get());
        resolve();
      };
    });
  }

  private atTab = 0;
  private atOpen: number | null = null;
  /** Atelier de l'Artisan : recettes, ingrédients possédés, fabrication. */
  atelier(h: CraftHooks): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.atelier')!;
    const render = () => {
      const v = h.get();
      el.querySelector('.sh-head .lvl')!.textContent = `Niveau ${v.level}`;
      setXpBar(el.querySelector('.at-xp')!, { level: v.level, xpInto: v.into, xpNeed: v.need });
      el.querySelectorAll<HTMLElement>('.at-tabs .gr-tab').forEach((t, i) => t.classList.toggle('on', i === this.atTab));
      const rows = this.atTab === 0 ? v.rows.filter((r) => r.ok) : v.rows;
      el.querySelector('.at-list')!.innerHTML = rows.length ? rows.map((r) => `
        <div class="at-row ${r.ok ? '' : 'off'} ${this.atOpen === r.id ? 'open' : ''}" data-id="${r.id}">
          <div class="at-ico">${r.icon}</div>
          <div class="at-main">
            <b>${r.name}</b><small>${r.sub}</small>
            <div class="at-ings">${r.ingredients.map((g) => `<span class="${g.have >= g.need ? 'ok' : 'no'}" title="${g.name}">${g.icon}<i class="gr-num">${g.have}/${g.need}</i></span>`).join('')}</div>
            ${this.atOpen === r.id ? `<div class="at-detail">${r.lines.map((l) => `<div>${l}</div>`).join('')}${r.set ? `<em>${r.set}</em>` : ''}${r.lines.length ? '' : '<em>Ressource intermédiaire, sert à d’autres recettes.</em>'}</div>` : ''}
          </div>
          <div class="at-btns">${r.ok
            ? `<button type="button" class="gr-btn leaf sm mk" data-n="1">Fabriquer</button>${r.max > 1 ? `<button type="button" class="gr-btn ghost sm mk" data-n="${r.max}">×${r.max}</button>` : ''}`
            : `<span class="at-why">${r.reason}</span>`}</div>
        </div>`).join('')
        : `<p class="inv-empty">${this.atTab === 0 ? 'Rien à fabriquer pour l’instant : il te faut plus de ressources (onglet « Toutes les recettes » pour voir ce qu’il manque).' : 'Aucune recette.'}</p>`;
    };
    el.onclick = (e) => {
      const t = e.target as HTMLElement;
      const tab = t.closest<HTMLElement>('.at-tabs .gr-tab');
      if (tab) {
        this.atTab = Number(tab.dataset.t);
        render();
        return;
      }
      const mk = t.closest<HTMLElement>('.mk');
      const row = t.closest<HTMLElement>('.at-row');
      if (mk && row) {
        const msg = h.craft(Number(row.dataset.id), Number(mk.dataset.n));
        this.toast(msg, 1800);
        render();
        return;
      }
      if (row) {
        const id = Number(row.dataset.id);
        this.atOpen = this.atOpen === id ? null : id;
        render();
      }
    };
    render();
    el.hidden = false;
    return new Promise((resolve) => {
      el.querySelector<HTMLButtonElement>('.sh-head .close')!.onclick = () => {
        el.hidden = true;
        resolve();
      };
    });
  }

  private invTab = 0;
  /** Inventaire : équipement porté autour du Sacrieur, sac (équipements / ressources), fiche d'objet. */
  inventory(h: InvHooks): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.inv')!;
    const detail = el.querySelector<HTMLElement>('.inv-detail')!;
    let open: { kind: 'uid'; uid: number } | { kind: 'res'; id: number } | null = null;
    const slotHtml = (s: InvView['slots'][number]) =>
      `<button type="button" class="inv-slot ${s.uid !== null ? 'full' : ''} ${s.locked ? 'locked' : ''}" data-uid="${s.uid ?? ''}" data-slot="${s.slot}" aria-label="${s.name}">${s.icon || `<span>${s.name}</span>`}</button>`;
    const render = () => {
      const v = h.get();
      const by = new Map(v.slots.map((s) => [s.slot, s]));
      el.querySelector('.inv-doll .left')!.innerHTML = (['chapeau', 'amulette', 'anneau1', 'anneau2'] as const).map((k) => slotHtml(by.get(k)!)).join('');
      el.querySelector('.inv-doll .right')!.innerHTML = (['cape', 'ceinture', 'bottes', 'arme'] as const).map((k) => slotHtml(by.get(k)!)).join('');
      el.querySelector('.inv-doll .bottom')!.innerHTML = (['bouclier', 'familier', 'dofus1', 'dofus2', 'dofus3', 'dofus4', 'dofus5', 'dofus6'] as const).map((k) => slotHtml(by.get(k)!)).join('');
      el.querySelector('.inv-sets')!.innerHTML = v.sets
        .map((st) => `<div class="inv-set"><b>${st.name}</b><span class="gr-num">${st.count}/${st.total}</span>${st.bonus.length ? `<small>${st.bonus.join(' · ')}</small>` : ''}</div>`)
        .join('');
      el.querySelectorAll<HTMLElement>('.inv-tabs .gr-tab').forEach((t, i) => t.classList.toggle('on', i === this.invTab));
      const grid = el.querySelector('.inv-grid')!;
      if (this.invTab === 0) {
        grid.innerHTML = v.equipment.length
          ? v.equipment.map((e) => `<button type="button" class="inv-cell ${e.worn ? 'worn' : ''} ${e.usable ? '' : 'nolvl'} ${e.fresh ? 'fresh' : ''}" data-uid="${e.uid}">
              ${e.icon}<span class="lv gr-num">${e.level}</span>${e.worn ? '<span class="tag">porté</span>' : e.fresh ? '<span class="tag new">nouveau</span>' : ''}</button>`).join('')
          : '<p class="inv-empty">Aucun équipement.</p>';
      } else {
        grid.innerHTML = v.resources.length
          ? v.resources.map((r) => `<button type="button" class="inv-cell" data-res="${r.id}">${r.icon}<span class="qty gr-num">${r.count}</span></button>`).join('')
          : '<p class="inv-empty">Aucune ressource : elles tombent sur les monstres.</p>';
      }
      if (open) showDetail(open.kind === 'uid' ? h.detail(open.uid) : h.resource(open.id));
    };
    const showDetail = (d: ItemDetail | null) => {
      if (!d) {
        detail.hidden = true;
        open = null;
        return;
      }
      detail.querySelector('.det-card')!.innerHTML = `
        <div class="det-head">${d.icon}<div><h3 class="gr-h3">${d.name}</h3><span class="det-sub">${d.sub}</span></div></div>
        ${d.lines.length ? `<div class="det-lines">${d.lines.map((l) => `<div><span>${l.text}</span>${l.range ? `<small>${l.range}</small>` : ''}</div>`).join('')}</div>` : ''}
        ${d.set ? `<div class="det-set"><span class="gr-label">${d.set.name} · ${d.set.count}/${d.set.total} portés</span>${d.set.rows.map((r) => `<div class="${r.on ? 'on' : ''}"><b class="gr-num">${r.n}</b> ${r.text}</div>`).join('')}</div>` : ''}
        ${d.diffTitle ? `<div class="det-diff"><span class="gr-label">${d.diffTitle}</span>${d.diff.length ? d.diff.map((x) => `<span class="${x.up ? 'up' : 'down'}">${x.text}</span>`).join('') : '<span>Aucun changement</span>'}</div>` : ''}
        ${d.note ? `<p class="det-note">${d.note}</p>` : ''}
        <div class="det-btns">
          ${d.action ? `<button type="button" class="gr-btn sm ${d.action.label === 'Retirer' ? 'ghost' : 'leaf'} act" ${d.action.enabled ? '' : 'disabled'}>${d.action.enabled ? d.action.label : d.action.reason}</button>` : ''}
          <button type="button" class="gr-btn ghost sm det-close">Fermer</button>
        </div>`;
      detail.hidden = false;
    };
    el.onclick = (e) => {
      const t = e.target as HTMLElement;
      const tab = t.closest<HTMLElement>('.inv-tabs .gr-tab');
      if (tab) {
        this.invTab = Number(tab.dataset.t);
        render();
        return;
      }
      if (t.closest('.det-close') || t === detail) {
        showDetail(null);
        return;
      }
      if (t.closest('.act') && open?.kind === 'uid') {
        h.toggle(open.uid);
        render();
        return;
      }
      const cell = t.closest<HTMLElement>('[data-uid],[data-res]');
      if (!cell || cell.closest('.inv-detail')) return;
      if (cell.dataset.res) open = { kind: 'res', id: Number(cell.dataset.res) };
      else if (cell.dataset.uid) open = { kind: 'uid', uid: Number(cell.dataset.uid) };
      else return;
      h.seen(open.kind === 'uid' ? open.uid : -1);
      render();
    };
    open = null;
    detail.hidden = true;
    render();
    el.hidden = false;
    return new Promise((resolve) => {
      el.querySelector<HTMLButtonElement>('.sh-head .close')!.onclick = () => {
        el.hidden = true;
        detail.hidden = true;
        resolve();
      };
    });
  }

  /** Bilan de fin de partie (victoire ou défaite). */
  summary(
    won: boolean, rows: [string, string][], cards: string[], loot: string,
    xp?: { gained: number; before: number; view: SheetView },
    items?: { icon: string; name: string; count: number; boss: boolean; lost: boolean }[],
  ): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.summary')!;
    el.querySelector('h2')!.textContent = won ? 'Victoire !' : 'Le Sacrieur est tombé';
    el.querySelector('.sum-sub')!.textContent = won ? 'Kardorim est vaincu, la Crypte est terminée.' : 'Il reviendra plus fort.';
    el.querySelector('.sum-stats')!.innerHTML = rows.map(([k, v]) => `<div><span>${k}</span><b class="gr-num">${v}</b></div>`).join('');
    el.querySelector('.sum-cards')!.innerHTML = cards.length
      ? `<span class="gr-label">Cartes prises</span><div>${cards.map((c) => `<span class="gr-chip">${c}</span>`).join('')}</div>`
      : '';
    el.querySelector('.sum-loot')!.textContent = loot;
    const box2 = el.querySelector<HTMLElement>('.sum-items')!;
    box2.hidden = !items;
    if (items) {
      box2.innerHTML = `<span class="gr-label">Butin</span><div>${items.length
        ? items.map((i) => `<span class="sum-item ${i.boss ? 'boss' : ''} ${i.lost ? 'lost' : ''}" title="${i.name}">${i.icon}${i.count > 1 ? `<b class="gr-num">${i.count}</b>` : ''}</span>`).join('')
        : '<em>Rien cette fois.</em>'}</div>${items.some((i) => i.boss) ? `<small>${items.some((i) => i.lost) ? 'Butin du boss perdu : il faut gagner pour le garder.' : 'Encadré doré : butin du boss.'}</small>` : ''}`;
    }
    const box = el.querySelector<HTMLElement>('.sum-xp')!;
    box.hidden = !xp;
    if (xp) {
      const up = xp.view.level - xp.before;
      box.innerHTML = `<div class="gain"><span class="gr-label">Expérience</span><b class="gr-num">+${fmt(xp.gained)} XP</b></div>
        <div class="xpbar"><span class="track"><span class="fill"></span></span><span class="gr-num txt"></span></div>
        ${up > 0 ? `<div class="lvlup gr-num">Niveau ${xp.view.level} !<small>+${up * 5} points à répartir au camp</small></div>` : ''}`;
      setXpBar(box.querySelector('.xpbar')!, xp.view);
    }
    el.classList.toggle('won', won);
    el.hidden = false;
    return new Promise((resolve) => {
      el.querySelector<HTMLButtonElement>('.back')!.onclick = () => {
        el.hidden = true;
        resolve();
      };
    });
  }
}

const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR');

function setXpBar(el: HTMLElement, v: { level: number; xpInto: number; xpNeed: number }) {
  el.querySelector<HTMLElement>('.fill')!.style.setProperty('--v', v.xpNeed ? `${(100 * v.xpInto) / v.xpNeed}%` : '100%');
  el.querySelector('.txt')!.textContent = v.xpNeed ? `${fmt(v.xpInto)} / ${fmt(v.xpNeed)} XP` : 'Niveau max';
}

/** Ce dont l'inventaire a besoin (fourni par le jeu). */
export interface InvHooks {
  get(): InvView;
  detail(uid: number): ItemDetail;
  resource(id: number): ItemDetail;
  /** Équipe ou retire. */
  toggle(uid: number): void;
  /** L'objet a été regardé (plus « nouveau »). */
  seen(uid: number): void;
}

/** Couleurs aléatoires harmonieuses : peau naturelle, vêtements dans 2 teintes accordées. */
function randomColors(): SacriColors {
  const hsl = (h: number, s: number, l: number) => {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  };
  const r = (a: number, b: number) => a + Math.random() * (b - a);
  const base = r(0, 360), accent = (base + r(120, 220)) % 360;
  return {
    skin: hsl(r(18, 32), r(40, 65), r(42, 78)),
    hair: hsl(r(0, 360), r(40, 90), r(30, 75)),
    c1: hsl(base, r(25, 60), r(25, 45)),
    c2: hsl(accent, r(45, 75), r(25, 40)),
    c3: hsl((accent + r(20, 60)) % 360, r(70, 95), r(50, 62)),
    c4: hsl(r(15, 35), r(30, 55), r(20, 35)),
  };
}

/** Ce dont l'atelier a besoin (fourni par le jeu). */
export interface CraftHooks {
  get(): CraftView;
  /** Fabrique `n` fois ; renvoie le message à afficher. */
  craft(id: number, n: number): string;
}
