import type { SpellId } from '../game/data/spells';
import type { GrimoireRow } from './grimoire-view';
import type { TestPreset } from '../game/testmode';
import './hud.css';
import { SACRIEUR_FACE_BOX, sacrieurSvg } from '../art/sacrieur';
import { COLOR_SLOTS, SACRI_COLORS, type SacriColors } from '../art/sacrieur-chibi';
import { ICONS } from './grimoire-icons';
import type { SheetView } from './sheet-view';
import type { InvView, ItemDetail, Mark } from './inv-view';
import { activeCount, applyFilters, emptyFilters, focusStat, focusValue, STAT_OPTIONS, type Filters, type SortKey } from '../game/search';
import { item, SETS, type ItemSlot } from '../game/data/items';
import type { BreakView, CraftView, FmRuneBtn, FmView, ForgeRow, FusionView } from './craft-view';
import type { BeastCard } from './bestiary-view';
import type { BeastKind } from '../game/bestiary';
import type { AtlasView } from './atlas-view';
import { RARITIES } from '../game/forge';

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
    root.addEventListener('click', (e) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('.sec-tab[data-panel]');
      if (t && !t.classList.contains('on')) this.secGo?.(t.dataset.panel!);
    });
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
        <div class="camp-top gr-panel">
          <div class="camp-name"><b>Sacrieur</b><span class="gr-chip lvl">Niveau 10</span><span class="camp-brand">Dofus · version Enzo</span></div>
          <div class="camp-xp xpbar"><span class="track"><span class="fill"></span></span><span class="gr-num txt"></span></div>
        </div>
        <div class="camp-hero">${sacrieurSvg()}</div>
        <button type="button" class="gr-btn play">Jouer</button>
        <div class="camp-dj gr-panel">
          <div class="dj-txt"><span class="gr-label dj-kind">Carte · niveau 3</span><b class="dj-name">Champs d’Incarnam</b><span class="dj-sub" hidden></span><span class="dj-key" hidden></span></div>
          <button type="button" class="gr-btn sm turquoise enter">Rejouer</button>
        </div>
      </div>
      <nav class="camp-nav" hidden>
        <button type="button" class="nav-tab" data-sec="perso">${ICONS.force.svg}<span>Personnage</span><b class="badge gr-num" hidden></b></button>
        <button type="button" class="nav-tab" data-sec="equip">${ICONS.sac.svg}<span>Équipement</span><b class="badge gr-num" hidden></b></button>
        <button type="button" class="nav-tab" data-sec="grimoire">${ICONS.pa.svg}<span>Grimoire</span><b class="badge gr-num" hidden></b></button>
        <button type="button" class="nav-tab" data-sec="bestiaire">${ICONS.os.svg}<span>Bestiaire</span><b class="badge gr-num" hidden></b></button>
      </nav>
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
        <div class="sec-tabs"><button type="button" class="sec-tab" data-panel="sheet">Caractéristiques</button><button type="button" class="sec-tab" data-panel="look">Apparence</button></div>
        <div class="sh-head">
          <div><h2 class="gr-h2">Caractéristiques</h2><span class="gr-chip lvl"></span></div>
          <button type="button" class="gr-btn ghost sm close">Fermer</button>
        </div>
        <div class="sh-xp xpbar"><span class="track"><span class="fill"></span></span><span class="gr-num txt"></span></div>
        <div class="sh-records"></div>
        <div class="sh-free"><span class="gr-label">Points à répartir</span><b class="gr-num"></b><button type="button" class="gr-btn ghost sm reset">Tout réinitialiser</button></div>
        <div class="sh-caracs"></div>
        <div class="gr-tabs sh-tabs"></div>
        <div class="sh-rows"></div>
        <details class="sh-test">
          <summary class="gr-label">Mode test</summary>
          <div class="row"><label>Niveau <input type="number" inputmode="numeric" min="1" max="200" class="t-lvl"></label><button type="button" class="gr-btn ghost sm t-go">Appliquer</button></div>
          <div class="row"><button type="button" class="gr-btn ghost sm t-zones">Débloquer toutes les zones</button><button type="button" class="gr-btn sm magic t-bouftous">Prêt pour le Donjon des Bouftous</button></div>
          <small>Modifie la vraie sauvegarde (niveau, zones, objets).</small>
        </details>
      </div>
      <div class="inv gr-paper" hidden>
        <div class="sec-tabs"><button type="button" class="sec-tab" data-panel="inv">Inventaire</button><button type="button" class="sec-tab" data-panel="atelier">Artisanat</button></div>
        <div class="sh-head"><h2 class="gr-h2">Inventaire</h2><button type="button" class="gr-btn ghost sm close">Fermer</button></div>
        <div class="inv-doll">
          <div class="col left"></div>
          <div class="mid"><div class="hero">${sacrieurSvg()}</div><div class="row pair"></div></div>
          <div class="col right"></div>
          <div class="row bottom"></div>
        </div>
        <button type="button" class="gr-btn ghost sm inv-sets-btn">Panoplies</button>
        <div class="inv-sets" hidden></div>
        <div class="flt inv-flt"></div>
        <div class="gr-tabs inv-tabs"><button type="button" class="gr-tab on" data-t="0">Équipements</button><button type="button" class="gr-tab" data-t="1">Ressources</button></div>
        <div class="inv-acts" hidden></div>
        <div class="inv-grid"></div>
        <div class="inv-detail" hidden><div class="det-card gr-panel gold"></div></div>
        <div class="inv-detail inv-modal" hidden><div class="det-card gr-panel gold"></div></div>
      </div>
      <div class="atelier gr-paper" hidden>
        <div class="sec-tabs"><button type="button" class="sec-tab" data-panel="inv">Inventaire</button><button type="button" class="sec-tab" data-panel="atelier">Artisanat</button></div>
        <div class="sh-head"><div><h2 class="gr-h2">Artisan</h2><span class="gr-chip lvl"></span></div><button type="button" class="gr-btn ghost sm close">Fermer</button></div>
        <div class="at-xp xpbar"><span class="track"><span class="fill"></span></span><span class="gr-num txt"></span></div>
        <div class="gr-tabs at-tabs at-modes"><button type="button" class="gr-tab on" data-t="0">Fabrication</button><button type="button" class="gr-tab" data-t="3">Forge&shy;magie</button></div>
        <div class="flt at-flt"></div>
        <div class="at-list"></div>
        <div class="inv-detail at-modal" hidden><div class="det-card gr-panel gold"></div></div>
      </div>
      <div class="atlas gr-paper" hidden>
        <div class="sh-head"><button type="button" class="gr-btn ghost sm back" hidden>‹ Zones</button><h2 class="gr-h2">Où aller ?</h2><button type="button" class="gr-btn ghost sm close">Fermer</button></div>
        <div class="atlas-zones"></div>
      </div>
      <div class="grimoire gr-paper" hidden>
        <div class="sh-head"><h2 class="gr-h2">Grimoire</h2><span class="gr-chip lvl gm-count"></span><button type="button" class="gr-btn ghost sm close">Fermer</button></div>
        <p class="det-note">Les sorts débloqués par ton niveau sortent dans les cartes entre les salles. Touche ★ pour un favori : il sort plus souvent.</p>
        <div class="gm-list"></div>
      </div>
      <div class="encyclo gr-paper" hidden>
        <div class="sec-tabs"><button type="button" class="sec-tab" data-panel="bestiary">Bestiaire</button><button type="button" class="sec-tab" data-panel="encyclo">Encyclopédie</button></div>
        <div class="sh-head"><h2 class="gr-h2">Encyclopédie</h2><button type="button" class="gr-btn ghost sm close">Fermer</button></div>
        <div class="flt inv-flt"></div>
        <div class="inv-acts" hidden></div>
        <div class="inv-grid"></div>
        <div class="inv-detail" hidden><div class="det-card gr-panel gold"></div></div>
        <div class="inv-detail inv-modal" hidden><div class="det-card gr-panel gold"></div></div>
      </div>
      <div class="bestiary gr-paper" hidden>
        <div class="sec-tabs"><button type="button" class="sec-tab" data-panel="bestiary">Bestiaire</button><button type="button" class="sec-tab" data-panel="encyclo">Encyclopédie</button></div>
        <div class="sh-head"><h2 class="gr-h2">Bestiaire</h2><span class="gr-chip lvl bs-count"></span><button type="button" class="gr-btn ghost sm close">Fermer</button></div>
        <div class="bs-kinds"></div>
        <div class="bs-grid"></div>
      </div>
      <div class="look gr-paper" hidden>
        <div class="sec-tabs"><button type="button" class="sec-tab" data-panel="sheet">Caractéristiques</button><button type="button" class="sec-tab" data-panel="look">Apparence</button></div>
        <div class="sh-head"><h2 class="gr-h2">Apparence</h2><button type="button" class="gr-btn ghost sm close">Fermer</button></div>
        <div class="look-hero"></div>
        <div class="look-rows"></div>
        <div class="look-btns"><button type="button" class="gr-btn sm magic rnd">Aléatoire</button><button type="button" class="gr-btn sm ghost reset">Couleurs du jeu</button></div>
      </div>
      <div class="pausemenu" hidden><div class="pm-card gr-panel gold">
        <h2 class="gr-title">Pause</h2>
        <div class="gr-label pm-lbl">Tes sorts · touche deux sorts pour changer leur ordre</div>
        <div class="pk-slots pm-slots"></div>
        <div class="gr-label pm-lbl">Butin de la partie</div>
        <div class="pm-loot"></div>
        <button type="button" class="gr-btn turquoise resume">Reprendre</button>
        <button type="button" class="gr-btn ghost sm quit">Quitter le combat</button>
        <p class="pm-note"></p>
      </div></div>
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
  /** Nom de la carte ou du donjon en cours (plaque du haut) ; `last` : libellé de la dernière salle. */
  private lastLabel = 'Boss';
  private areaName = 'Crypte de Kardorim';
  setArea(name: string, last: string) {
    this.areaName = name;
    this.root.querySelector('.plaque .dj')!.textContent = name;
    this.lastLabel = last;
  }

  setRooms(cur: number, total: number) {
    const el = this.root.querySelector('.rooms')!;
    const pips = [...Array(total)].map((_, i) => {
      const n = i + 1;
      const cls = [i === total - 1 ? 'boss' : '', n < cur ? 'done' : '', n === cur ? 'cur' : ''].filter(Boolean).join(' ');
      return `<i class="${cls}"></i>`;
    });
    el.innerHTML = `<span class="pips">${pips.join('')}</span><span class="lbl gr-num">${cur === total ? this.lastLabel : `Salle ${cur}/${total}`}</span>`;
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

  /**
   * Pause : changer l'ordre des sorts (toucher deux sorts), voir le butin déjà ramassé, reprendre ou quitter le combat
   * (quitter = comme une défaite : on garde l'XP et le butin des monstres ; il faut toucher deux fois).
   */
  pauseMenu(slots: SlotView[], onSwap: (a: number, b: number) => SlotView[], loot: { icon: string; name: string; count: number; boss: boolean }[], xp: number): Promise<'resume' | 'quit'> {
    const el = this.root.querySelector<HTMLElement>('.pausemenu')!;
    let sel = -1;
    const drawSlots = (list: SlotView[]) => {
      const sb = el.querySelector('.pm-slots')!;
      sb.innerHTML = list.map((s, i) => `<button type="button" class="pk-slot ${s ? '' : 'empty'} ${i === sel ? 'sel' : ''}" data-s="${i}">
        <span class="prio gr-num">${i + 1}</span>${s ? `<span class="art">${s.icon}</span>` : '<span class="plus">+</span>'}</button>`).join('');
      sb.querySelectorAll<HTMLButtonElement>('.pk-slot').forEach((b) => (b.onclick = () => {
        const i = Number(b.dataset.s);
        if (!list[i] && sel < 0) return;
        if (sel < 0) sel = i;
        else {
          if (sel !== i) list = onSwap(sel, i);
          sel = -1;
        }
        drawSlots(list);
      }));
    };
    drawSlots(slots);
    el.querySelector('.pm-loot')!.innerHTML = (loot.length
      ? loot.map((l) => `<span class="pm-item ${l.boss ? 'boss' : ''}" title="${l.name}">${l.icon}<i class="gr-num">${l.count}</i></span>`).join('')
      : '<em>Rien pour l’instant.</em>') + `<span class="gr-chip pm-xp">+${xp} XP</span>`;
    const quit = el.querySelector<HTMLButtonElement>('.quit')!;
    const note = el.querySelector<HTMLElement>('.pm-note')!;
    quit.textContent = 'Quitter le combat';
    note.textContent = '';
    el.hidden = false;
    return new Promise((resolve) => {
      const done = (r: 'resume' | 'quit') => { el.hidden = true; resolve(r); };
      el.querySelector<HTMLButtonElement>('.resume')!.onclick = () => done('resume');
      quit.onclick = () => {
        if (quit.dataset.armed === '1') { quit.dataset.armed = ''; done('quit'); return; }
        quit.dataset.armed = '1';
        quit.textContent = 'Touche encore pour quitter';
        note.textContent = 'Comme une défaite : tu gardes l’XP et le butin des monstres, pas celui du boss.';
      };
    });
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
    return ['.overlay', '.pausemenu', '.picker', '.camp', '.summary', '.sheet', '.inv', '.encyclo', '.look', '.atelier', '.atlas', '.grimoire'].some((q) => !this.root.querySelector<HTMLElement>(q)!.hidden);
  }

  /** Écran d'accueil : le Sacrieur, son niveau, ses records, et l'entrée du donjon. Résout quand on entre. */
  camp(
    rec: { runs: number; wins: number; bestRoom: number; bestWinTime: number | null },
    sheet: () => SheetView,
    act: { invest(id: string, n: number): void; reset(): void; test?(p: TestPreset): void },
    inv?: InvHooks,
    look?: { get(): SacriColors; set(c: SacriColors): void },
    work?: CraftHooks,
    zones?: ZoneHooks,
    beasts?: { get(): BeastCard[]; fresh(): number; seen(): void; claim?(id: string): boolean },
    spells?: { get(): GrimoireRow[]; fav(id: SpellId): void },
  ): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.camp')!;
    const nav = this.root.querySelector<HTMLElement>('.camp-nav')!;
    this.work = work ?? null;
    if (look) this.setHeroLook(look.get());
    type Panel = 'sheet' | 'look' | 'inv' | 'atelier' | 'atlas' | 'bestiary' | 'encyclo' | 'grimoire';
    const SECTION: Record<Panel, 'perso' | 'equip' | 'donjons' | 'bestiaire' | 'grimoire'> = { sheet: 'perso', look: 'perso', inv: 'equip', atelier: 'equip', atlas: 'donjons', bestiary: 'bestiaire', encyclo: 'bestiaire', grimoire: 'grimoire' };
    let current: Panel | null = null;
    const open: Record<Panel, () => Promise<void>> = {
      sheet: () => this.charSheet(sheet, act),
      look: () => (look ? this.appearance(look) : Promise.resolve()),
      inv: () => (inv ? this.inventory(inv) : Promise.resolve()),
      atelier: () => (work ? this.atelier(work) : Promise.resolve()),
      atlas: () => (zones ? this.atlas(zones, () => el.querySelector<HTMLButtonElement>('.enter')!.click()) : Promise.resolve()),
      bestiary: () => (beasts ? this.bestiary(beasts) : Promise.resolve()),
      encyclo: () => (inv ? this.inventory(inv, true) : Promise.resolve()),
      grimoire: () => (spells ? this.grimoire(spells) : Promise.resolve()),
    };
    /** Carte « Entrer » : l'étape choisie dans l'écran Donjons. */
    const card = () => {
      if (!zones) return;
      const c = zones.current();
      el.querySelector('.dj-kind')!.textContent = `Dernière partie · ${c.kind === 'map' ? 'carte' : 'donjon'} · niveau ${c.level}`;
      el.querySelector('.dj-name')!.textContent = c.name;
      el.querySelector('.dj-sub')!.textContent = c.sub;
      const k = el.querySelector<HTMLElement>('.dj-key')!;
      k.hidden = !c.key;
      k.textContent = c.key?.text ?? '';
      k.classList.toggle('none', c.key?.ok === false);
      el.querySelector<HTMLButtonElement>('.enter')!.disabled = c.key?.ok === false;
    };
    const badge = (b: HTMLElement | null, n: number) => {
      if (!b) return;
      b.hidden = n <= 0;
      b.textContent = String(n);
    };
    const refresh = () => {
      const v = sheet();
      el.querySelector('.lvl')!.textContent = `Niveau ${v.level}`;
      setXpBar(el.querySelector('.camp-xp')!, v);
      this.setLevel(v.level);
      const fresh = inv ? inv.get().equipment.filter((e) => e.fresh).length : 0;
      const craftable = work ? work.get().rows.filter((r) => r.ok).length : 0;
      badge(nav.querySelector('[data-sec="perso"] .badge'), v.free);
      badge(nav.querySelector('[data-sec="equip"] .badge'), fresh || craftable);
      this.root.querySelectorAll<HTMLElement>('.sec-tab[data-panel="inv"]').forEach((t) => t.dataset.n = fresh ? String(fresh) : '');
      this.root.querySelectorAll<HTMLElement>('.sec-tab[data-panel="atelier"]').forEach((t) => t.dataset.n = craftable ? String(craftable) : '');
      this.root.querySelectorAll<HTMLElement>('.sec-tab[data-panel="sheet"]').forEach((t) => t.dataset.n = v.free ? String(v.free) : '');
      const play = el.querySelector<HTMLElement>('.play')!;
      play.dataset.n = zones && zones.fresh() > 0 ? String(zones.fresh()) : '';
      badge(nav.querySelector('[data-sec="bestiaire"] .badge'), beasts ? beasts.fresh() : 0);
      card();
      nav.querySelectorAll<HTMLElement>('.nav-tab[data-sec]').forEach((t) => t.classList.toggle('on', !!current && SECTION[current] === t.dataset.sec));
      this.root.querySelectorAll<HTMLElement>('.sec-tab').forEach((t) => t.classList.toggle('on', t.dataset.panel === current));
    };
    /** Ouvre un panneau (ferme proprement celui qui est ouvert). Un panneau se ferme avec « Fermer » ou en touchant son onglet. */
    const show = async (p: Panel) => {
      const prev = current;
      current = p;
      if (prev) this.root.querySelector<HTMLButtonElement>(`.${prev} .sh-head .close`)?.click();
      refresh();
      await open[p]();
      if (current === p) current = null;
      refresh();
    };
    this.secGo = (k) => void show(k as Panel);
    nav.onclick = (e) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('.nav-tab[data-sec]');
      if (!t) return;
      const sec = t.dataset.sec;
      if (current && SECTION[current] === sec) {
        this.root.querySelector<HTMLButtonElement>(`.${current} .sh-head .close`)?.click();
        return;
      }
      void show(sec === 'perso' ? 'sheet' : sec === 'donjons' ? 'atlas' : sec === 'bestiaire' ? 'bestiary' : sec === 'grimoire' ? 'grimoire' : 'inv');
    };
    nav.querySelector<HTMLElement>('[data-sec="equip"]')!.hidden = !inv;
    nav.querySelector<HTMLElement>('[data-sec="bestiaire"]')!.hidden = !beasts;
    nav.querySelector<HTMLElement>('[data-sec="grimoire"]')!.hidden = !spells;
    refresh();
    const t = rec.bestWinTime;
    this.root.querySelector('.sh-records')!.innerHTML = [
      ['Parties', String(rec.runs)],
      ['Victoires', String(rec.wins)],
      ['Plus loin', rec.bestRoom ? `Salle ${rec.bestRoom}` : '—'],
      ['Record', t === null ? '—' : `${Math.floor(t / 60)} min ${String(Math.round(t % 60)).padStart(2, '0')}`],
    ].map(([k, v]) => `<div><span class="gr-label">${k}</span><b class="gr-num">${v}</b></div>`).join('');
    el.querySelector<HTMLButtonElement>('.play')!.onclick = () => void show('atlas');
    el.hidden = false;
    nav.hidden = false;
    return new Promise((resolve) => {
      el.querySelector<HTMLButtonElement>('.enter')!.onclick = () => {
        // donjon : la clé est dépensée en entrant
        if (zones && !zones.enter()) {
          refresh();
          return;
        }
        if (current) this.root.querySelector<HTMLButtonElement>(`.${current} .sh-head .close`)?.click();
        el.hidden = true;
        nav.hidden = true;
        this.secGo = null;
        resolve();
      };
    });
  }
  /** Sous-onglets des panneaux du camp (Caractéristiques / Apparence, Inventaire / Artisanat). */
  private secGo: ((k: string) => void) | null = null;

  private sheetTab = 0;
  /** Fiche de caractéristiques : répartition des points, remise à zéro, et toute la fiche Dofus. */
  charSheet(get: () => SheetView, act: { invest(id: string, n: number): void; reset(): void; test?(p: TestPreset): void }): Promise<void> {
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
          <span class="nm">${c.name}<small>${c.gear || c.parcho ? `${c.invested}${c.parcho ? ` + ${c.parcho} parcho` : ''}${c.gear ? ` + ${c.gear} équipement` : ''}` : `${c.invested} investis`} · ${c.cost} pt${c.cost > 1 ? 's' : ''} pour +1</small></span>
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
    // mode test : chaque bouton demande confirmation (la sauvegarde est modifiée)
    const test = (p: TestPreset, what: string) => act.test && confirm(`Mode test : ${what} ?`) && act.test(p);
    const lvIn = el.querySelector<HTMLInputElement>('.t-lvl')!;
    lvIn.value = String(get().level);
    el.querySelector<HTMLButtonElement>('.t-go')!.onclick = () => test({ kind: 'niveau', level: Number(lvIn.value) || 1 }, `passer niveau ${Number(lvIn.value) || 1}`);
    el.querySelector<HTMLButtonElement>('.t-zones')!.onclick = () => test({ kind: 'zones' }, 'débloquer toutes les zones');
    el.querySelector<HTMLButtonElement>('.t-bouftous')!.onclick = () => test({ kind: 'bouftous' }, 'niveau 30, tout débloqué jusqu’au Donjon des Bouftous, Panoplie du Bouftou et Épée de Boisaille portées');
    el.querySelector<HTMLElement>('.sh-test')!.hidden = !act.test;
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

  /* ---------- Recherche et filtres (inventaire, Encyclopédie, Atelier) ---------- */

  /** Filtres gardés pendant la session, par liste. */
  private flt: Record<string, Filters> = {};
  private fltOpen: Record<string, boolean> = {};
  private filters(key: string, init: () => Filters = emptyFilters): Filters {
    return (this.flt[key] ??= init());
  }

  /**
   * Barre de recherche + filtres repliables. N'est redessinée qu'à l'ouverture ou au changement d'onglet
   * (pour garder le clavier ouvert pendant la frappe) ; `apply` redessine la liste et renvoie le nombre de résultats.
   */
  private filterBar(box: HTMLElement, key: string, cfg: BarCfg, apply: () => number, init: () => Filters = emptyFilters) {
    const f = this.filters(key, init);
    const opt = (v: string | number, label: string, cur: string | number) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${label}</option>`;
    const special = f.only.filter((o) => o.includes(':'));
    box.innerHTML = `
      <div class="flt-row">
        <label class="flt-q">${SEARCH_SVG}<input type="search" enterkeyhint="search" autocomplete="off" placeholder="${cfg.placeholder}" value="${f.q.replace(/"/g, '&quot;')}"></label>
        <button type="button" class="gr-btn ghost sm flt-toggle ${this.fltOpen[key] ? 'on' : ''}">Filtres<b class="n gr-num"></b></button>
      </div>
      ${special.length ? `<div class="flt-special">${special.map((o) => `<button type="button" class="gr-chip flt-x" data-o="${o}">${cfg.label?.(o) ?? o} ✕</button>`).join('')}</div>` : ''}
      <div class="flt-more" ${this.fltOpen[key] ? '' : 'hidden'}>
        ${cfg.slot ? `<label><span class="gr-label">Emplacement</span><select data-f="slot">${opt('', 'Tous', f.slot)}${SLOT_OPTIONS.map(([v, l]) => opt(v, l, f.slot)).join('')}</select></label>` : ''}
        ${cfg.stat ? `<label><span class="gr-label">Stat</span><select data-f="stat">${opt('', 'Toutes', f.stat)}${STAT_OPTIONS.map((s) => opt(s.path, s.label, f.stat)).join('')}</select></label>` : ''}
        ${cfg.set ? `<label><span class="gr-label">Panoplie</span><select data-f="set">${opt(0, 'Toutes', f.set)}${SET_OPTIONS().map(([v, l]) => opt(v, l, f.set)).join('')}</select></label>` : ''}
        ${cfg.rarity ? `<label><span class="gr-label">Rareté</span><select data-f="rarity">${opt('', 'Toutes', f.rarity ?? '')}${RARITIES.map((n, i) => opt(i, n, f.rarity ?? '')).join('')}</select></label>` : ''}
        <label><span class="gr-label">Trier par</span><select data-f="sort">${cfg.sorts.map(([v, l]) => opt(v, l, f.sort)).join('')}</select></label>
        <label><span class="gr-label">Niveau min</span><input type="number" inputmode="numeric" min="1" max="200" data-f="min" value="${f.min ?? ''}" placeholder="1"></label>
        <label><span class="gr-label">Niveau max</span><input type="number" inputmode="numeric" min="1" max="200" data-f="max" value="${f.max ?? ''}" placeholder="200"></label>
        ${cfg.toggles.length ? `<div class="flt-chips">${cfg.toggles.map(([k, l]) => `<button type="button" class="flt-chip ${f.only.includes(k) ? 'on' : ''}" data-o="${k}">${l}</button>`).join('')}</div>` : ''}
        <p class="flt-help">Astuce : « fo », « do feu », « ré terre », « agi>10 », « <20 », « 10-30 ».</p>
      </div>
      <div class="flt-foot"><span class="flt-count"></span><button type="button" class="flt-clear">Effacer les filtres</button></div>`;
    const update = () => {
      const n = apply();
      const active = activeCount(f) + Number(!!f.q.trim());
      const badge = box.querySelector<HTMLElement>('.flt-toggle .n')!;
      badge.textContent = activeCount(f) ? String(activeCount(f)) : '';
      box.querySelector('.flt-count')!.textContent = `${n} résultat${n > 1 ? 's' : ''}`;
      box.querySelector<HTMLElement>('.flt-clear')!.hidden = !active;
    };
    box.querySelector<HTMLInputElement>('.flt-q input')!.oninput = (e) => {
      f.q = (e.target as HTMLInputElement).value;
      update();
    };
    box.onchange = (e) => {
      const t = e.target as HTMLInputElement | HTMLSelectElement;
      const k = t.dataset.f;
      if (!k) return;
      if (k === 'slot') f.slot = t.value as Filters['slot'];
      else if (k === 'stat') {
        f.stat = t.value;
        // choisir une stat trie par sa valeur
        if (f.stat && cfg.sorts.some(([s]) => s === 'stat')) {
          f.sort = 'stat';
          box.querySelector<HTMLSelectElement>('[data-f="sort"]')!.value = 'stat';
        }
      } else if (k === 'set') f.set = Number(t.value);
      else if (k === 'rarity') f.rarity = t.value === '' ? null : Number(t.value);
      else if (k === 'sort') f.sort = t.value as SortKey;
      else if (k === 'min' || k === 'max') f[k] = t.value === '' ? null : Math.max(1, Math.min(200, Number(t.value)));
      update();
    };
    box.querySelectorAll<HTMLInputElement>('input[type=number]').forEach((i) => (i.oninput = () => box.onchange?.({ target: i } as unknown as Event)));
    box.onclick = (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('.flt-toggle')) {
        this.fltOpen[key] = !this.fltOpen[key];
        box.querySelector<HTMLElement>('.flt-more')!.hidden = !this.fltOpen[key];
        t.closest('.flt-toggle')!.classList.toggle('on', this.fltOpen[key]);
        return;
      }
      if (t.closest('.flt-clear')) {
        this.flt[key] = init();
        this.filterBar(box, key, cfg, apply, init);
        return;
      }
      const chip = t.closest<HTMLElement>('[data-o]');
      if (chip) {
        const o = chip.dataset.o!;
        f.only = f.only.includes(o) ? f.only.filter((x) => x !== o) : [...f.only, o];
        if (chip.classList.contains('flt-x')) this.filterBar(box, key, cfg, apply, init);
        else {
          chip.classList.toggle('on', f.only.includes(o));
          update();
        }
      }
    };
    update();
  }

  /** Fenêtre de fusion d'un équipement (choix des 2 objets sacrifiés). */
  private fusionModal(modal: HTMLElement, h: CraftHooks, uid: number, done: () => void) {
    let picked: number[] = [];
    const close = () => {
      modal.hidden = true;
      modal.onclick = null;
    };
    const draw = () => {
      const v = h.fusion(uid);
      if (!v) return close();
      const costOk = !v.cost || (!v.cost.locked && v.cost.have >= v.cost.need);
      const ready = picked.length === 2 && costOk;
      const chosen = v.partners.filter((p) => picked.includes(p.uid));
      modal.querySelector('.det-card')!.innerHTML = `
        <div class="det-head"><span class="det-ico r${v.toRank - 1}">${v.icon}</span><div><h3 class="gr-h3 rar-${v.toRank - 1}">${v.name}</h3><span class="det-sub">${v.from} → <b class="rar-${v.toRank}">${v.to}</b></span></div></div>
        <div class="det-lines">${v.lines.map((l) => `<div><span>${l}</span></div>`).join('')}</div>
        ${v.bonusNote ? `<p class="det-note">${v.bonusNote}</p>` : ''}
        <div class="det-src"><span class="gr-label">À sacrifier : ${v.rule} (${picked.length}/2)</span></div>
        <div class="fz-partners">${v.partners.map((p) => `<button type="button" class="inv-cell r${p.rarity} ${picked.includes(p.uid) ? 'sel' : ''}" data-p="${p.uid}" title="${p.name}">${p.icon}</button>`).join('')}</div>
        ${chosen.length ? `<div class="fz-chosen">${chosen.map((p) => `<div><b>${p.name}</b> <small>${p.lines}</small></div>`).join('')}</div>` : ''}
        ${v.cost ? `<div class="fz-cost ${costOk ? 'ok' : 'no'}">${v.cost.icon}<span>${v.cost.name} <b class="gr-num">${v.cost.have}/${v.cost.need}</b>${v.cost.locked ? ' · verrouillé' : ''}</span></div>` : ''}
        <p class="det-note warn">Les 2 objets choisis seront détruits. ${v.name} garde ses jets (même qualité) et reste équipé s’il l’était.</p>
        <div class="det-btns">
          <button type="button" class="gr-btn magic sm fz-ok" ${ready ? '' : 'disabled'}>Fusionner</button>
          <button type="button" class="gr-btn ghost sm md-close">Annuler</button>
        </div>`;
    };
    const v0 = h.fusion(uid);
    picked = v0 ? v0.partners.slice(0, 2).map((p) => p.uid) : [];
    draw();
    modal.hidden = false;
    modal.onclick = (e) => {
      const t = e.target as HTMLElement;
      if (t === modal || t.closest('.md-close')) return close();
      const p = t.closest<HTMLElement>('[data-p]');
      if (p) {
        const id = Number(p.dataset.p);
        picked = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id].slice(-2);
        draw();
        return;
      }
      if (t.closest('.fz-ok')) {
        const msg = h.fuse(uid, picked);
        close();
        this.toast(msg, 2200);
        done();
      }
    };
  }

  /** Fenêtre de brisage d'un ou plusieurs équipements (runes obtenues, confirmation). */
  private breakModal(modal: HTMLElement, h: CraftHooks, uids: number[], done: () => void) {
    const views = uids.map((u) => h.breakInfo(u)).filter((v): v is BreakView => !!v);
    if (!views.length) return;
    const close = () => {
      modal.hidden = true;
      modal.onclick = null;
    };
    const runes = new Map<string, { icon: string; name: string; min: number; max: number }>();
    for (const v of views) for (const r of v.runes) {
      const x = runes.get(r.name) ?? { ...r, min: 0, max: 0 };
      x.min += r.min;
      x.max += r.max;
      runes.set(r.name, x);
    }
    const one = views.length === 1 ? views[0] : null;
    const why = views.find((v) => v.why)?.why ?? '';
    modal.querySelector('.det-card')!.innerHTML = `
      ${one
        ? `<div class="det-head"><span class="det-ico r${one.rarity}">${one.icon}</span><div><h3 class="gr-h3 rar-${one.rarity}">${one.name}</h3><span class="det-sub">${one.sub}</span></div></div>`
        : `<div class="det-head"><div><h3 class="gr-h3">Briser ${views.length} objets</h3></div></div><div class="fz-partners">${views.map((v) => `<span class="inv-cell r${v.rarity}" title="${v.name}">${v.icon}</span>`).join('')}</div>`}
      <div class="det-src"><span class="gr-label">Runes obtenues</span></div>
      <div class="br-runes">${runes.size ? [...runes.values()].map((r) => `<div class="br-rune">${r.icon}<span>${r.name}</span><b class="gr-num">${r.min === r.max ? r.max : `${r.min}–${r.max}`}</b></div>`).join('') : '<em>Aucune rune : pas de stat brisable.</em>'}</div>
      <p class="det-note warn">${why || (one ? 'L’objet sera détruit définitivement.' : 'Ces objets seront détruits définitivement.')}</p>
      <div class="det-btns">
        <button type="button" class="gr-btn coral sm br-ok" ${why ? 'disabled' : ''}>Briser</button>
        <button type="button" class="gr-btn ghost sm md-close">Annuler</button>
      </div>`;
    modal.hidden = false;
    modal.onclick = (e) => {
      const t = e.target as HTMLElement;
      if (t === modal || t.closest('.md-close')) return close();
      if (t.closest('.br-ok')) {
        const msgs = views.map((v) => h.breakIt(v.uid));
        close();
        this.toast(msgs.length === 1 ? msgs[0] : `${msgs.length} objets brisés · ${msgs.map((m) => m.split(' · ')[0]).join(' · ')}`, 2600);
        done();
      }
    };
  }

  private atTab = 0;
  /** Onglet de l'Atelier : 0 Fabrication, 3 Forgemagie (Fusion et Brisage sont dans l'inventaire, choix d'Enzo). */
  private atMode = 0;
  private atOpen: number | null = null;
  private work: CraftHooks | null = null;
  /** Atelier de l'Artisan : fabrication et forgemagie. `only` : filtre posé depuis un autre panneau. */
  atelier(h: CraftHooks, only?: string): Promise<void> {
    if (this.atMode !== 0) this.atMode = 3;
    const el = this.root.querySelector<HTMLElement>('.atelier')!;
    const fbox = el.querySelector<HTMLElement>('.at-flt')!;
    const modal = el.querySelector<HTMLElement>('.at-modal')!;
    const init = (): Filters => ({ ...emptyFilters(), sort: 'levelAsc' });
    if (only) {
      this.flt.craft = { ...init(), only: [only] };
      this.atMode = 0;
      this.atTab = 1;
    }
    const list = el.querySelector<HTMLElement>('.at-list')!;
    const head = () => {
      const v = h.get();
      el.querySelector('.sh-head .lvl')!.textContent = `Niveau ${v.level}`;
      setXpBar(el.querySelector('.at-xp')!, { level: v.level, xpInto: v.into, xpNeed: v.need });
      el.querySelectorAll<HTMLElement>('.at-tabs .gr-tab').forEach((t) => t.classList.toggle('on', Number(t.dataset.t) === this.atMode));
      return v;
    };
    const renderCraft = (): number => {
      const v = head();
      const f = this.filters('craft', init);
      const rows = applyFilters(this.atTab === 0 ? v.rows.filter((r) => r.ok) : v.rows, f).sort((a, b) => Number(b.ok) - Number(a.ok));
      const focus = focusStat(f);
      const sub = `<div class="cat-mode"><button type="button" class="flt-chip ${this.atTab === 0 ? 'on' : ''}" data-sub="0">Disponibles</button><button type="button" class="flt-chip ${this.atTab === 1 ? 'on' : ''}" data-sub="1">Toutes les recettes</button></div>`;
      list.innerHTML = sub + (rows.length ? rows.map((r) => {
        const fv = focusValue(r.facets, focus);
        return `
        <div class="at-row ${r.ok ? '' : 'off'} ${this.atOpen === r.id ? 'open' : ''}" data-id="${r.id}">
          <div class="at-ico">${r.icon}</div>
          <div class="at-main">
            <b>${r.name}${fv !== null ? ` <span class="fv gr-num">${fv > 0 ? '+' : ''}${fv}</span>` : ''}</b><small>${r.sub}</small>
            <div class="at-ings">${r.ingredients.map((g) => `<span class="${g.locked ? 'lk' : g.have >= g.need ? 'ok' : 'no'}" title="${g.name}">${g.icon}<i class="gr-num">${g.locked ? LOCK_SVG : ''}${g.have}/${g.need}</i></span>`).join('')}</div>
            ${this.atOpen === r.id ? `<div class="at-detail">${r.lines.map((l) => `<div>${l}</div>`).join('')}${r.set ? `<em>${r.set}</em>` : ''}${r.lines.length ? '' : '<em>Ressource intermédiaire, sert à d’autres recettes.</em>'}</div>` : ''}
          </div>
          <div class="at-btns">${r.ok
            ? `<button type="button" class="gr-btn leaf sm mk" data-n="1">Fabriquer</button>${r.max > 1 ? `<button type="button" class="gr-btn ghost sm mk" data-n="${r.max}">×${r.max}</button>` : ''}`
            : `<span class="at-why">${r.reason}</span>`}</div>
        </div>`;
      }).join('')
        : `<p class="inv-empty">${this.atTab === 0 && !v.rows.some((r) => r.ok) ? 'Rien à fabriquer pour l’instant : il te faut plus de ressources (« Toutes les recettes » pour voir ce qu’il manque).' : 'Aucune recette ne correspond.'}</p>`);
      return rows.length;
    };
    const renderFm = (): number => {
      head();
      const f = this.filters('fm');
      const all = h.forge();
      const rows = applyFilters(all, f);
      const focus = focusStat(f);
      const intro = '<p class="at-intro">Pose des runes sur un objet. Succès critique : la stat monte. Succès neutre : elle monte, mais d’autres lignes perdent du poids. Échec critique : rien ne monte, des lignes perdent du poids qui va dans le <b>puits</b> (il protège des pertes suivantes ; plus l’objet est rare, plus il est grand). Overmax possible un peu au-delà du jet max ; une seule ligne exo (PA, PM, Portée : très rare).</p>';
      list.innerHTML = intro + (rows.length ? rows.map((r) => {
        const fv = focusValue(r.facets, focus);
        return `
        <div class="at-row fm" data-uid="${r.uid}">
          <div class="at-ico r${r.rarity}">${r.icon}</div>
          <div class="at-main"><b class="rar-${r.rarity}">${r.name}${fv !== null ? ` <span class="fv gr-num">${fv > 0 ? '+' : ''}${fv}</span>` : ''}</b><small>${r.sub}${r.worn ? ' · porté' : ''}</small></div>
          <div class="at-btns"><button type="button" class="gr-btn magic sm fm-go">Forger</button></div>
        </div>`;
      }).join('') : `<p class="inv-empty">${all.length ? 'Aucun objet ne correspond.' : 'Aucun équipement.'}</p>`);
      return rows.length;
    };
    const fmCfg: BarCfg = {
      placeholder: 'Nom, rareté, stat, niveau…', slot: true, stat: true, set: true, rarity: true,
      toggles: [['fav', 'Favoris'], ['worn', 'Portés']],
      sorts: [['level', 'Niveau ↓'], ['levelAsc', 'Niveau ↑'], ['rarity', 'Rareté'], ['name', 'Nom'], ['stat', 'Valeur de la stat']],
    };
    const bar = () => {
      fbox.hidden = false;
      if (this.atMode === 0) {
        this.filterBar(fbox, 'craft', {
          placeholder: 'Nom, ingrédient, stat, niveau…', slot: true, stat: true, set: true,
          toggles: this.atTab === 0 ? [] : [['craftable', 'Fabricable'], ['missing1', 'Il manque 1 ingrédient']],
          sorts: [['levelAsc', 'Niveau ↑'], ['level', 'Niveau ↓'], ['name', 'Nom'], ['stat', 'Valeur de la stat']],
          label: specialLabel,
        }, renderCraft, init);
      } else this.filterBar(fbox, 'fm', fmCfg, renderFm);
    };

    const closeModal = () => {
      modal.hidden = true;
      modal.onclick = null;
    };

    /* fenêtre de forgemagie : une rune à la fois, le résultat s'affiche en haut */
    const openFm = (uid: number) => {
      let last: { text: string; outcome: string | null } | null = null;
      const btn = (b: FmRuneBtn) => `<button type="button" class="fm-rune ${b.ok ? '' : 'off'}" data-rune="${b.id}" ${b.ok ? '' : 'disabled'} title="${b.name}">${b.icon}<span><b>+${b.value}</b> <i class="gr-num">×${b.count}</i></span><small>${b.odds}</small></button>`;
      const draw = () => {
        const v = h.fm(uid);
        if (!v) return closeModal();
        modal.querySelector('.det-card')!.innerHTML = `
          <div class="det-head"><span class="det-ico r${v.rarity}">${v.icon}</span><div><h3 class="gr-h3 rar-${v.rarity}">${v.name}</h3><span class="det-sub">${v.sub}</span></div></div>
          ${last ? `<div class="fm-last ${last.outcome ?? ''}">${last.text}</div>` : ''}
          <div class="fm-puits"><span class="gr-label">Puits</span><span class="track"><span class="fill" style="--v:${Math.min(100, (100 * v.puits) / v.puitsMax)}%"></span></span><b class="gr-num">${v.puits}/${v.puitsMax}</b></div>
          <div class="fm-lines">${v.lines.map((l) => `
            <div class="fm-line ${l.kind} ${l.over ? 'over' : ''}"><div><b>${l.text}</b><small>${l.range}</small></div>
              <div class="fm-runes">${l.runes.length ? l.runes.map(btn).join('') : l.kind === 'bonus' ? '' : '<em>Pas de rune</em>'}</div></div>`).join('')}</div>
          <div class="det-src"><span class="gr-label">Nouvelle ligne (exo)</span></div>
          ${v.exoWhy ? `<p class="det-note">${v.exoWhy}</p>` : ''}
          <div class="fm-lines">${v.exo.length ? v.exo.map((x) => `<div class="fm-line exo"><div><b>${x.label}</b></div><div class="fm-runes">${x.runes.map(btn).join('')}</div></div>`).join('') : '<p class="det-note">Aucune autre rune en stock (le Brisage en donne).</p>'}</div>
          <p class="det-note">Chances : succès critique / succès neutre / échec critique.</p>
          <div class="det-btns"><button type="button" class="gr-btn ghost sm md-close">Fermer</button></div>`;
      };
      draw();
      modal.hidden = false;
      modal.onclick = (e) => {
        const t = e.target as HTMLElement;
        if (t === modal || t.closest('.md-close')) {
          closeModal();
          bar();
          return;
        }
        const r = t.closest<HTMLElement>('[data-rune]');
        if (r && !r.hasAttribute('disabled')) {
          last = h.fmApply(uid, Number(r.dataset.rune));
          draw();
        }
      };
    };

    el.onclick = (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('.at-modal')) return;
      const fmRow = t.closest<HTMLElement>('.at-row.fm');
      if (fmRow) {
        openFm(Number(fmRow.dataset.uid));
        return;
      }
      const tab = t.closest<HTMLElement>('.at-tabs .gr-tab');
      if (tab) {
        this.atMode = Number(tab.dataset.t);
        bar();
        return;
      }
      const sub = t.closest<HTMLElement>('[data-sub]');
      if (sub) {
        this.atTab = Number(sub.dataset.sub);
        bar();
        return;
      }
      if (t.closest('.at-flt')) return;
      const mk = t.closest<HTMLElement>('.mk');
      const row = t.closest<HTMLElement>('.at-row');
      if (mk && row) {
        const msg = h.craft(Number(row.dataset.id), Number(mk.dataset.n));
        this.toast(msg, 1800);
        bar();
        return;
      }
      if (row) {
        const id = Number(row.dataset.id);
        this.atOpen = this.atOpen === id ? null : id;
        renderCraft();
      }
    };
    closeModal();
    bar();
    el.hidden = false;
    return new Promise((resolve) => {
      el.querySelector<HTMLButtonElement>('.sh-head .close')!.onclick = () => {
        el.hidden = true;
        closeModal();
        resolve();
      };
    });
  }

  private atlasZone: string | null = null;
  /**
   * « Où aller ? » (bouton Jouer) : d'abord les zones (débloquées ou non, progression), puis, dans une zone,
   * ses cartes de farm (terminée, disponible, verrouillée) et son donjon (niveau, boss, clés, Entrer).
   * Toucher « Jouer » ou « Entrer » lance directement la partie (`start`).
   */
  atlas(h: ZoneHooks, start: () => void): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.atlas')!;
    const back = el.querySelector<HTMLButtonElement>('.sh-head .back')!;
    const title = el.querySelector<HTMLElement>('.sh-head .gr-h2')!;
    const bossOf = (sub: string) => sub.split('·').map((x) => x.trim()).filter((x) => !/salles|mini-boss|victoires/.test(x)).pop() ?? '';
    const render = () => {
      const v = h.view();
      const zone = v.zones.find((z) => z.id === this.atlasZone);
      back.hidden = !zone;
      title.textContent = zone ? zone.name : 'Où aller ?';
      const box = el.querySelector('.atlas-zones')!;
      if (!zone) {
        box.innerHTML = v.zones.map((z) => {
          const open = z.nodes.some((n) => n.state === 'open' || n.state === 'done');
          const done = z.nodes.filter((n) => n.state === 'done').length;
          const lv = z.nodes.map((n) => n.level);
          const here = z.nodes.some((n) => n.selected);
          return `<button type="button" class="zone-card gr-panel ${open ? '' : 'locked'} ${here ? 'here' : ''}" data-zone="${z.id}" ${open ? '' : 'disabled'}>
            <span class="zc-txt"><b>${z.name}</b><small>Niveaux ${Math.min(...lv)} à ${Math.max(...lv)}${here ? ' · tu y es' : ''}</small>
            ${open ? `<span class="zc-bar"><i style="width:${Math.round((100 * done) / z.nodes.length)}%"></i></span><small class="gr-num">${done}/${z.nodes.length} terminées</small>` : `<em>${LOCK_SVG} ${z.nodes[0].need}</em>`}</span>
            ${open ? '<span class="zc-go">›</span>' : ''}</button>`;
        }).join('');
        return;
      }
      box.innerHTML = zone.nodes.map((n) => {
        const playable = n.state === 'open' || n.state === 'done';
        const wins = n.wins ? `<span class="gr-chip mw">${n.wins[0]}/${n.wins[1]} victoires</span>` : '';
        if (n.kind === 'map') return `<div class="map-row ${n.state}" data-id="${n.id}">
          <span class="an-dot">${n.state === 'done' ? '✓' : n.state === 'locked' ? LOCK_SVG : ''}</span>
          <span class="an-txt"><b>${n.name}</b><small>Carte · niveau ${n.level}</small>${wins}${n.state === 'locked' ? `<em>${n.need}</em>` : ''}</span>
          ${playable ? `<button type="button" class="gr-btn sm turquoise go">Jouer</button>` : ''}</div>`;
        const key = playable ? h.info(n.id).key : undefined;
        return `<div class="dj-card gr-panel gold ${n.state}" data-id="${n.id}">
          <span class="gr-label">Donjon · niveau ${n.level}${n.state === 'done' ? ' · vaincu ✓' : ''}</span>
          <b class="djc-name">${n.name}</b>
          <span class="djc-boss">Boss : ${bossOf(n.sub)}</span>
          ${n.state === 'locked' ? `<em>${LOCK_SVG} ${n.need}</em>` : `<span class="dj-key ${key?.ok === false ? 'none' : ''}">${key?.text ?? ''}</span>
          <button type="button" class="gr-btn go" ${key?.ok === false ? 'disabled' : ''}>Entrer${key && /gratuite|clé|Clef/.test(key.text) && key.ok ? ' — 1 clé' : ''}</button>`}
        </div>`;
      }).join('');
    };
    el.onclick = (e) => {
      const t = e.target as HTMLElement;
      const z = t.closest<HTMLElement>('.zone-card[data-zone]');
      if (z) { this.atlasZone = z.dataset.zone!; render(); el.scrollTop = 0; return; }
      if (t.closest('.sh-head .back')) { this.atlasZone = null; render(); return; }
      const go = t.closest<HTMLElement>('.go');
      const row = go?.closest<HTMLElement>('[data-id]');
      if (!go || !row || (go as HTMLButtonElement).disabled) return;
      h.choose(row.dataset.id!);
      el.hidden = true;
      start();
    };
    h.seen();
    // on ouvre directement la zone où l'on joue
    if (this.atlasZone === null) this.atlasZone = h.view().zones.find((z) => z.nodes.some((n) => n.selected))?.id ?? null;
    render();
    el.hidden = false;
    return new Promise((resolve) => {
      const close = el.querySelector<HTMLButtonElement>('.sh-head .close')!;
      const obs = new MutationObserver(() => { if (el.hidden) { obs.disconnect(); resolve(); } });
      obs.observe(el, { attributes: true, attributeFilter: ['hidden'] });
      close.onclick = () => { el.hidden = true; };
    });
  }

  private bsKind: BeastKind | 'all' = 'all';
  private bsOpen: string | null = null;
  /** Bestiaire : tous les monstres (silhouette tant qu'on ne les a pas croisés), filtrés par catégorie ; fiche au toucher. */
  /** Grimoire : les 22 sorts du Sacrieur, débloqués selon le niveau ; favoris (plus souvent dans les cartes). */
  grimoire(h: { get(): GrimoireRow[]; fav(id: SpellId): void }): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.grimoire')!;
    const render = () => {
      const rows = h.get();
      el.querySelector('.gm-count')!.textContent = `${rows.filter((r) => r.state === 'ok').length}/${rows.length}`;
      el.querySelector('.gm-list')!.innerHTML = rows.map((r) => `
        <div class="gm-row ${r.state}">
          <span class="gm-ico">${r.icon}</span>
          <div class="gm-txt"><b>${r.name}</b><small>Niveau ${r.level} · ${r.pa} PA${r.state === 'later' ? ' · pas encore dans le jeu' : ''}</small><p>${r.text}</p></div>
          ${r.id && r.state !== 'later' ? `<button type="button" class="gm-fav ${r.fav ? 'on' : ''}" data-id="${r.id}" aria-label="Favori">★</button>` : ''}
        </div>`).join('');
    };
    el.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('.gm-fav');
      if (!b) return;
      h.fav(b.dataset.id as SpellId);
      render();
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

  bestiary(h: { get(): BeastCard[]; seen(): void; claim?(id: string): boolean }): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.bestiary')!;
    const render = () => {
      const all = h.get();
      const known = all.filter((c) => c.known).length;
      el.querySelector('.bs-count')!.textContent = `${known}/${all.length}`;
      const kinds: (BeastKind | 'all')[] = ['all', 'normal', 'elite', 'archi', 'boss'];
      const label = (k: BeastKind | 'all') => (k === 'all' ? 'Tous' : k === 'normal' ? 'Normaux' : k === 'elite' ? 'Élites' : k === 'archi' ? 'Archimonstres' : 'Boss');
      el.querySelector('.bs-kinds')!.innerHTML = kinds.map((k) => {
        const n = all.filter((c) => k === 'all' || c.kind === k);
        return `<button type="button" class="flt-chip ${this.bsKind === k ? 'on' : ''}" data-k="${k}">${label(k)} <i class="gr-num">${n.filter((c) => c.known).length}/${n.length}</i></button>`;
      }).join('');
      const list = all.filter((c) => this.bsKind === 'all' || c.kind === this.bsKind);
      el.querySelector('.bs-grid')!.innerHTML = list.length ? list.map((c) => `
        <button type="button" class="bs-card ${c.kind} ${c.known ? '' : 'unknown'} ${this.bsOpen === c.id ? 'open' : ''}" data-id="${c.id}">
          <img src="${c.art}" alt="" draggable="false">
          <b>${c.known ? c.name : '???'}${c.star ? ' <span class="bs-star">★</span>' : ''}</b>
          <small>${c.kindLabel} · ${c.levels}</small>
          ${c.tiers.some((t) => t.state === 'ready') ? '<span class="bs-ready">!</span>' : ''}
          ${c.known ? `<i class="gr-num">${c.slain} vaincu${c.slain > 1 ? 's' : ''}</i>` : ''}
        </button>
        ${this.bsOpen === c.id ? `<div class="bs-detail gr-panel">
          <h3 class="gr-h3">${c.known ? c.name : '???'} <span class="bs-kind ${c.kind}">${c.kindLabel}</span></h3>
          <p class="bs-where">${c.places.join(' · ')}</p>
          ${c.known ? `<div class="bs-sheet">${c.sheet.map((s) => `<div><span class="gr-label">${s.label}</span><span>${s.value}</span></div>`).join('')}</div>
          <div class="bs-drops">${c.drops.map((d) => `<span title="${d.name}">${d.icon}<i class="gr-num">${d.pct}</i></span>`).join('') || '<em>Aucun butin</em>'}</div>
          <div class="bs-tiers"><span class="gr-label">Paliers</span>${c.tiers.map((t, i) => `<div class="bs-tier ${t.state}">
            <b class="gr-num">${Math.min(c.slain, t.goal)}/${t.goal}</b><span>${t.text}</span>
            ${t.state === 'claimed' ? '<i>✓</i>' : t.state === 'ready' && c.tiers.findIndex((x) => x.state === 'ready') === i ? `<button type="button" class="gr-btn sm claim" data-claim="${c.id}">Récupérer</button>` : ''}</div>`).join('')}</div>
          <p class="det-note">Vu ${c.seen} fois · vaincu ${c.slain} fois · chances de butin par monstre vaincu (sans Prospection ni paliers).</p>`
            : '<p class="det-note">Pas encore croisé : sa fiche se remplit à la première rencontre.</p>'}
        </div>` : ''}`).join('') : '<p class="inv-empty">Aucun monstre dans cette catégorie pour l’instant.</p>';
    };
    el.onclick = (e) => {
      const t = e.target as HTMLElement;
      const k = t.closest<HTMLElement>('[data-k]');
      if (k) {
        this.bsKind = k.dataset.k as BeastKind | 'all';
        render();
        return;
      }
      const cl = t.closest<HTMLElement>('[data-claim]');
      if (cl) {
        if (h.claim?.(cl.dataset.claim!)) this.toast('Palier récupéré !', 1200);
        render();
        return;
      }
      const c = t.closest<HTMLElement>('.bs-card');
      if (c) {
        this.bsOpen = this.bsOpen === c.dataset.id ? null : c.dataset.id!;
        render();
      }
    };
    h.seen();
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
  /** Encyclopédie : 0 = objets, 1 = panoplies. */
  private catMode = 0;
  /** Inventaire : équipement porté autour du Sacrieur, sac (équipements / ressources), Encyclopédie, fiche d'objet. */
  inventory(h: InvHooks, encyclo = false): Promise<void> {
    const el = this.root.querySelector<HTMLElement>(encyclo ? '.encyclo' : '.inv')!;
    if (!encyclo && this.invTab > 1) this.invTab = 0;
    /** Onglet affiché : l'Encyclopédie est son propre panneau, rangé avec le Bestiaire (demandé par Enzo). */
    const tab = () => (encyclo ? 2 : this.invTab);
    const detail = el.querySelector<HTMLElement>('.inv-detail')!;
    const fbox = el.querySelector<HTMLElement>('.inv-flt')!;
    type Open = { kind: 'uid'; uid: number } | { kind: 'res'; id: number } | { kind: 'cat'; id: number };
    let open: Open | null = null;
    const modal = el.querySelector<HTMLElement>('.inv-modal')!;
    const acts = el.querySelector<HTMLElement>('.inv-acts')!;
    /** Fusion et Brisage directement dans l'inventaire (choix d'Enzo) : mode de sélection et objets choisis. */
    let pick: 'fuse' | 'break' | null = null;
    let chosen: number[] = [];
    const forgeOf = () => new Map((this.work?.forge() ?? []).map((r) => [r.uid, r]));
    const renderActs = (any: boolean) => {
      acts.hidden = tab() !== 0 || !this.work || !any;
      acts.innerHTML = !pick
        ? '<button type="button" class="gr-btn magic sm ia-fuse">Fusion</button><button type="button" class="gr-btn coral sm ia-break">Briser</button>'
        : `<span class="ia-hint">${pick === 'fuse' ? 'Touche l’objet à faire monter de rareté' : `Touche les objets à briser · ${chosen.length} choisi${chosen.length > 1 ? 's' : ''}`}</span>
          ${pick === 'break' ? `<button type="button" class="gr-btn coral sm ia-ok" ${chosen.length ? '' : 'disabled'}>Briser${chosen.length ? ` (${chosen.length})` : ''}</button>` : ''}
          <button type="button" class="gr-btn ghost sm ia-cancel">Annuler</button>`;
    };
    const endPick = () => {
      pick = null;
      chosen = [];
    };
    const slotHtml = (s: InvView['slots'][number]) =>
      `<button type="button" class="inv-slot ${s.uid !== null ? `full r${s.rarity}` : ''} ${s.locked ? 'locked' : ''} ${s.uid !== null && hit.has(s.uid) ? 'hit' : ''}" data-uid="${s.uid ?? ''}" data-slot="${s.slot}" aria-label="${s.name}">${s.icon || `<span>${s.name}</span>`}</button>`;
    const marks = (fav: boolean, lock: boolean) => (fav || lock ? `<span class="mks">${lock ? LOCK_SVG : ''}${fav ? STAR_SVG : ''}</span>` : '');
    const fvTag = (v: number | null) => (v !== null ? `<span class="fv gr-num">${v > 0 ? '+' : ''}${v}</span>` : '');
    /** Objets portés qui correspondent à la recherche (allumés sur le Sacrieur). */
    let hit = new Set<number>();
    const listKey = () => (tab() === 0 ? 'eq' : tab() === 1 ? 'res' : this.catMode === 0 ? 'cat' : 'sets');
    const setsBtn = el.querySelector<HTMLButtonElement>('.inv-sets-btn');
    if (setsBtn) setsBtn.onclick = () => {
      const box = el.querySelector<HTMLElement>('.inv-sets')!;
      box.hidden = !box.hidden;
      const b = el.querySelector<HTMLButtonElement>('.inv-sets-btn')!;
      b.textContent = b.textContent!.replace(' ▲', '') + (box.hidden ? '' : ' ▲');
    };
    const renderDoll = (v: InvView) => {
      if (!el.querySelector('.inv-doll')) return;
      const by = new Map(v.slots.map((s) => [s.slot, s]));
      el.querySelector('.inv-doll .left')!.innerHTML = (['chapeau', 'amulette', 'anneau1', 'anneau2'] as const).map((k) => slotHtml(by.get(k)!)).join('');
      el.querySelector('.inv-doll .right')!.innerHTML = (['cape', 'ceinture', 'bottes', 'arme'] as const).map((k) => slotHtml(by.get(k)!)).join('');
      // bouclier à droite du 2e anneau, familier à gauche de l'arme (demandé par Enzo)
      el.querySelector('.inv-doll .pair')!.innerHTML = (['bouclier', 'familier'] as const).map((k) => slotHtml(by.get(k)!)).join('');
      el.querySelector('.inv-doll .bottom')!.innerHTML = (['dofus1', 'dofus2', 'dofus3', 'dofus4', 'dofus5', 'dofus6'] as const).map((k) => slotHtml(by.get(k)!)).join('');
      // panoplies et leurs bonus cachés derrière un bouton « Panoplies (n) » (demandé par Enzo)
      const sb = el.querySelector<HTMLButtonElement>('.inv-sets-btn')!;
      sb.hidden = !v.sets.length;
      sb.textContent = `Panoplies (${v.sets.length})${el.querySelector('.inv-sets')!.hasAttribute('hidden') ? '' : ' ▲'}`;
      el.querySelector('.inv-sets')!.innerHTML = v.sets
        .map((st) => `<div class="inv-set"><b>${st.name}</b><span class="gr-num">${st.count}/${st.total}</span>${st.bonus.length ? `<small>${st.bonus.join(' · ')}</small>` : ''}</div>`)
        .join('');
    };
    const renderList = (): number => {
      const v = h.get();
      const f = this.filters(listKey(), listKey() === 'eq' ? emptyFilters : () => ({ ...emptyFilters(), sort: 'levelAsc' }));
      const focus = focusStat(f);
      const searching = !!f.q.trim() || activeCount(f) > 0;
      el.querySelectorAll<HTMLElement>('.inv-tabs .gr-tab').forEach((t, i) => t.classList.toggle('on', i === tab()));
      const grid = el.querySelector<HTMLElement>('.inv-grid')!;
      grid.classList.toggle('sets', tab() === 2 && this.catMode === 1);
      const mode = tab() === 2
        ? `<div class="cat-mode gr-tabs"><button type="button" class="flt-chip ${this.catMode === 0 ? 'on' : ''}" data-mode="0">Objets</button><button type="button" class="flt-chip ${this.catMode === 1 ? 'on' : ''}" data-mode="1">Panoplies</button></div>`
        : '';
      let n = 0;
      if (tab() === 0) {
        const rows = applyFilters(v.equipment, f);
        hit = new Set(searching ? rows.filter((r) => r.worn).map((r) => r.uid) : []);
        n = rows.length;
        const fr = pick ? forgeOf() : null;
        const can = (uid: number) => !fr || (pick === 'fuse' ? fr.get(uid)?.fusable : fr.get(uid)?.breakable);
        grid.innerHTML = rows.length
          ? rows.map((e) => `<button type="button" class="inv-cell r${e.rarity} ${e.worn ? 'worn' : ''} ${e.usable ? '' : 'nolvl'} ${e.fresh ? 'fresh' : ''} ${can(e.uid) ? '' : 'off'} ${chosen.includes(e.uid) ? 'sel' : ''}" data-uid="${e.uid}">
              ${e.icon}<span class="lv gr-num">${e.level}</span>${marks(e.fav, e.lock)}${fvTag(focusValue(e.facets, focus))}${e.worn ? '<span class="tag">porté</span>' : e.fresh ? '<span class="tag new">nouveau</span>' : ''}</button>`).join('')
          : `<p class="inv-empty">${v.equipment.length ? 'Aucun équipement ne correspond.' : 'Aucun équipement.'}</p>`;
      } else if (tab() === 1) {
        hit = new Set();
        const rows = applyFilters(v.resources, f);
        n = rows.length;
        grid.innerHTML = rows.length
          ? rows.map((r) => `<button type="button" class="inv-cell" data-res="${r.id}">${r.icon}${marks(r.fav, r.lock)}<span class="qty gr-num">${r.count}</span></button>`).join('')
          : `<p class="inv-empty">${v.resources.length ? 'Aucune ressource ne correspond.' : 'Aucune ressource : elles tombent sur les monstres.'}</p>`;
      } else if (this.catMode === 0) {
        hit = new Set();
        const rows = applyFilters(v.catalog, f);
        n = rows.length;
        grid.innerHTML = mode + (rows.length
          ? rows.map((c) => `<button type="button" class="inv-cell ${c.owned ? '' : 'unowned'}" data-cat="${c.id}">
              ${c.icon}<span class="lv gr-num">${c.level}</span>${fvTag(focusValue(c.facets, focus))}${c.owned ? `<span class="tag">×${c.owned}</span>` : ''}</button>`).join('')
          : '<p class="inv-empty">Aucun objet ne correspond.</p>');
      } else {
        hit = new Set();
        const rows = applyFilters(v.allSets, f);
        n = rows.length;
        grid.innerHTML = mode + (rows.length
          ? rows.map((s) => {
            const fv = focusValue(s.facets, focus);
            return `<div class="set-row ${s.owned === s.total ? 'complete' : ''}">
              <div class="set-head"><b>${s.name}</b><span class="gr-chip">niv ${s.level}</span><span class="gr-num own">${s.owned}/${s.total}</span>${fv !== null ? `<span class="fv gr-num">${fv > 0 ? '+' : ''}${fv} au total</span>` : ''}</div>
              <div class="set-pieces">${s.pieces.map((p) => `<button type="button" class="inv-cell ${p.owned ? '' : 'unowned'}" data-cat="${p.id}">${p.icon}</button>`).join('')}</div>
              ${s.bonus ? `<small>Panoplie complète : ${s.bonus}</small>` : ''}
            </div>`;
          }).join('')
          : '<p class="inv-empty">Aucune panoplie ne correspond.</p>');
      }
      renderDoll(v);
      renderActs(v.equipment.length > 0);
      if (open) showDetail(open.kind === 'uid' ? h.detail(open.uid) : open.kind === 'res' ? h.resource(open.id) : h.catalog(open.id));
      return n;
    };
    const bar = () => {
      const k = listKey();
      const cfg: BarCfg =
        k === 'eq' ? {
          placeholder: 'Nom, stat (fo, agi…), niveau…', slot: true, stat: true, set: true, rarity: true,
          toggles: [['fav', 'Favoris'], ['lock', 'Verrouillés'], ['usable', 'Équipable maintenant'], ['new', 'Nouveaux'], ['worn', 'Portés']],
          sorts: [['level', 'Niveau ↓'], ['levelAsc', 'Niveau ↑'], ['rarity', 'Rareté'], ['name', 'Nom'], ['new', 'Récents'], ['stat', 'Valeur de la stat']],
        } : k === 'res' ? {
          placeholder: 'Nom, type, monstre, recette…',
          toggles: [['fav', 'Favoris'], ['lock', 'Verrouillées'], ['used', 'Sert à une recette']],
          sorts: [['levelAsc', 'Niveau ↑'], ['level', 'Niveau ↓'], ['name', 'Nom']],
        } : k === 'cat' ? {
          placeholder: 'Nom, stat, panoplie, monstre…', slot: true, stat: true, set: true,
          toggles: [['owned', 'Possédés'], ['usable', 'Équipable maintenant'], ['craftable', 'Fabricable'], ['drop', 'Sur les monstres']],
          sorts: [['level', 'Niveau ↓'], ['levelAsc', 'Niveau ↑'], ['name', 'Nom'], ['stat', 'Valeur de la stat']],
        } : {
          placeholder: 'Panoplie, pièce, stat…', stat: true, set: true,
          toggles: [['owned', 'Commencées'], ['complete', 'Complètes'], ['usable', 'Équipable maintenant']],
          sorts: [['level', 'Niveau ↓'], ['levelAsc', 'Niveau ↑'], ['name', 'Nom'], ['stat', 'Valeur de la stat']],
        };
      // ressources et Encyclopédie : du plus bas niveau au plus haut (les pièces de panoplie au-delà du niveau 40 en dernier)
      this.filterBar(fbox, k, cfg, renderList, k === 'eq' ? emptyFilters : () => ({ ...emptyFilters(), sort: 'levelAsc' }));
    };
    const showDetail = (d: ItemDetail | null) => {
      if (!d) {
        detail.hidden = true;
        open = null;
        return;
      }
      // panoplie : une seule ligne cliquable, les bonus se lisent dans la vue panoplie (demandé par Enzo)
      const setGo = d.links.find((l) => l.go.startsWith('set:'))?.go;
      const links = d.links.filter((l) => !l.go.startsWith('set:') && (!(l.go.startsWith('uses:') || l.go.startsWith('recipe:')) || this.work));
      const fg = open?.kind === 'uid' && !d.special ? forgeOf().get(open.uid) : undefined;
      detail.querySelector('.det-card')!.innerHTML = `
        <div class="det-head"><span class="det-ico r${d.rarity}">${d.icon}</span><div><h3 class="gr-h3 rar-${d.rarity}">${d.name}</h3><span class="det-sub">${d.sub}</span></div>
          ${d.marks ? `<div class="det-marks"><button type="button" class="mark fav ${d.marks.fav ? 'on' : ''}" data-mark="fav" aria-label="Favori">${STAR_SVG}</button><button type="button" class="mark lock ${d.marks.lock ? 'on' : ''}" data-mark="lock" aria-label="Verrouiller">${LOCK_SVG}</button></div>` : ''}</div>
        ${d.weapon ? `<div class="det-weapon"><span class="gr-label">Dommages de l’arme</span>${d.weapon.lines.map((l) => `<div class="wl el-${l.el}"><i></i><span>${l.text}</span><small>${l.range}</small></div>`).join('')}<small class="wi">${d.weapon.info}</small></div>` : ''}
        ${d.lines.length ? `<div class="det-lines">${d.lines.map((l) => `<div><span>${l.text}</span>${l.range ? `<small>${l.range}</small>` : ''}</div>`).join('')}</div>` : ''}
        ${d.set && setGo ? `<button type="button" class="det-setlink" data-go="${setGo}"><span>${d.set.name.split(" · ")[0]}</span><b class="gr-num">${d.set.count}/${d.set.total}</b><i>›</i></button>` : ''}
        ${d.diffTitle ? `<div class="det-diff"><span class="gr-label">${d.diffTitle}</span>${d.diff.length ? d.diff.map((x) => `<span class="${x.up ? 'up' : 'down'}">${x.text}</span>`).join('') : '<span>Aucun changement</span>'}</div>` : ''}
        ${d.sources.length ? `<div class="det-src"><span class="gr-label">Où l’obtenir</span>${d.sources.map((s) => `<div>${s}</div>`).join('')}</div>` : ''}
        ${d.note ? `<p class="det-note">${d.note}</p>` : ''}
        ${links.length ? `<div class="det-links">${links.map((l) => `<button type="button" class="gr-btn sm turquoise link" data-go="${l.go}">${l.label}</button>`).join('')}</div>` : ''}
        ${d.pet ? `<div class="det-pet"><span class="gr-label">Croissance</span><span class="track"><span class="fill" style="--v:${d.pet.pct}%"></span></span><b class="gr-num">${d.pet.pct} %</b></div>
        <div class="det-forge">${d.pet.pct >= 100 ? '<small>Ton familier est à son maximum.</small>' : `
          <button type="button" class="gr-btn leaf sm d-feed" ${d.pet.food ? '' : 'disabled'}>Nourrir</button>
          <button type="button" class="gr-btn ghost sm d-feedall" ${d.pet.food > 1 ? '' : 'disabled'}>Tout donner</button>
          <small>${d.pet.food} Super Croquette${d.pet.food > 1 ? 's' : ''} · +4 % chacune (elles tombent sur tous les monstres, 3 %)</small>`}
        </div>` : ''}
        ${fg ? `<div class="det-forge">
          <button type="button" class="gr-btn magic sm d-fuse" ${fg.fusable ? '' : 'disabled'}>Fusionner${fg.fusable ? ` → ${fg.next}` : ''}</button>
          <button type="button" class="gr-btn coral sm d-break" ${fg.breakable ? '' : 'disabled'}>Briser</button>
          ${!fg.fusable || !fg.breakable ? `<small>${[!fg.fusable ? `Fusion : ${fg.fuseWhy}` : '', !fg.breakable ? `Brisage : ${fg.breakWhy}` : ''].filter(Boolean).join(' · ')}</small>` : ''}
        </div>` : ''}
        <div class="det-btns">
          ${d.action ? `<button type="button" class="gr-btn sm ${d.action.label === 'Retirer' ? 'ghost' : 'leaf'} act" ${d.action.enabled ? '' : 'disabled'}>${d.action.enabled ? d.action.label : d.action.reason}</button>` : ''}
          <button type="button" class="gr-btn ghost sm det-close">Fermer</button>
        </div>`;
      detail.hidden = false;
    };
    const go = async (target: string) => {
      const [kind, id] = target.split(':');
      showDetail(null);
      if (kind === 'set') {
        this.catMode = 1;
        this.flt.sets = { ...emptyFilters(), set: Number(id) };
        if (!encyclo) {
          this.secGo?.('encyclo');
          return;
        }
        bar();
        el.querySelector('.inv-grid')!.scrollIntoView({ block: 'start', behavior: 'smooth' });
      } else if (this.work) {
        await this.atelier(this.work, kind === 'uses' ? `ing:${id}` : `id:${id}`);
        bar();
      }
    };
    el.onclick = (e) => {
      const t = e.target as HTMLElement;
      const tab = t.closest<HTMLElement>('.inv-tabs .gr-tab');
      if (tab) {
        this.invTab = Number(tab.dataset.t);
        endPick();
        bar();
        return;
      }
      const mode = t.closest<HTMLElement>('[data-mode]');
      if (mode) {
        this.catMode = Number(mode.dataset.mode);
        bar();
        return;
      }
      if (t.closest('.inv-flt') || t.closest('.inv-modal')) return;
      const w = this.work;
      if (w && t.closest('.ia-fuse, .ia-break')) {
        pick = t.closest('.ia-fuse') ? 'fuse' : 'break';
        chosen = [];
        showDetail(null);
        renderList();
        return;
      }
      if (t.closest('.ia-cancel')) {
        endPick();
        renderList();
        return;
      }
      if (w && t.closest('.ia-ok') && chosen.length) {
        this.breakModal(modal, w, chosen, () => {
          endPick();
          renderList();
        });
        return;
      }
      if (open?.kind === 'uid' && t.closest('.d-feed, .d-feedall')) {
        this.toast(h.feed(open.uid, !!t.closest('.d-feedall')), 1800);
        renderList();
        return;
      }
      if (w && open?.kind === 'uid' && t.closest('.d-fuse, .d-break')) {
        const uid = open.uid;
        if (t.closest('.d-fuse')) this.fusionModal(modal, w, uid, () => renderList());
        else this.breakModal(modal, w, [uid], () => {
          showDetail(null);
          renderList();
        });
        return;
      }
      if (pick && w) {
        const c = t.closest<HTMLElement>('.inv-grid [data-uid]');
        if (!c) return;
        const uid = Number(c.dataset.uid), r = forgeOf().get(uid);
        if (!r) return;
        if (pick === 'fuse') {
          if (!r.fusable) this.toast(r.fuseWhy, 1800);
          else this.fusionModal(modal, w, uid, () => {
            endPick();
            renderList();
          });
        } else if (!r.breakable) this.toast(r.breakWhy, 1800);
        else {
          chosen = chosen.includes(uid) ? chosen.filter((x) => x !== uid) : [...chosen, uid];
          renderList();
        }
        return;
      }
      if (t.closest('.det-close') || t === detail) {
        showDetail(null);
        return;
      }
      const mark = t.closest<HTMLElement>('[data-mark]');
      if (mark && open && open.kind !== 'cat') {
        h.mark(open.kind, open.kind === 'uid' ? open.uid : open.id, mark.dataset.mark as Mark);
        renderList();
        return;
      }
      const link = t.closest<HTMLElement>('[data-go]');
      if (link) {
        void go(link.dataset.go!);
        return;
      }
      if (t.closest('.act') && open?.kind === 'uid') {
        h.toggle(open.uid);
        renderList();
        return;
      }
      const cell = t.closest<HTMLElement>('[data-uid],[data-res],[data-cat]');
      if (!cell || cell.closest('.inv-detail')) return;
      if (cell.dataset.res) open = { kind: 'res', id: Number(cell.dataset.res) };
      else if (cell.dataset.cat) open = { kind: 'cat', id: Number(cell.dataset.cat) };
      else if (cell.dataset.uid) open = { kind: 'uid', uid: Number(cell.dataset.uid) };
      else return;
      if (open.kind === 'uid') h.seen(open.uid);
      renderList();
    };
    open = null;
    detail.hidden = true;
    modal.hidden = true;
    endPick();
    bar();
    el.hidden = false;
    return new Promise((resolve) => {
      el.querySelector<HTMLButtonElement>('.sh-head .close')!.onclick = () => {
        el.hidden = true;
        detail.hidden = true;
        modal.hidden = true;
        resolve();
      };
    });
  }

  /** Bilan de fin de partie (victoire ou défaite). */
  summary(
    won: boolean, rows: [string, string][], cards: string[], loot: string,
    xp?: { gained: number; before: number; view: SheetView },
    items?: { icon: string; name: string; count: number; boss: boolean; lost: boolean; rarity?: number }[],
    quit = false,
  ): Promise<void> {
    const el = this.root.querySelector<HTMLElement>('.summary')!;
    el.querySelector('h2')!.textContent = won ? 'Victoire !' : quit ? 'Combat quitté' : 'Le Sacrieur est tombé';
    el.querySelector('.sum-sub')!.textContent = won ? `${this.lastLabel === 'Boss' ? 'Le boss est vaincu' : 'L’élite est vaincue'} : ${this.areaName}, terminé !` : 'Il reviendra plus fort.';
    el.querySelector('.sum-stats')!.innerHTML = rows.map(([k, v]) => `<div><span>${k}</span><b class="gr-num">${v}</b></div>`).join('');
    el.querySelector('.sum-cards')!.innerHTML = cards.length
      ? `<span class="gr-label">Cartes prises</span><div>${cards.map((c) => `<span class="gr-chip">${c}</span>`).join('')}</div>`
      : '';
    el.querySelector('.sum-loot')!.textContent = loot;
    const box2 = el.querySelector<HTMLElement>('.sum-items')!;
    box2.hidden = !items;
    if (items) {
      box2.innerHTML = `<span class="gr-label">Butin</span><div>${items.length
        ? items.map((i) => `<span class="sum-item r${i.rarity ?? 0} ${i.boss ? 'boss' : ''} ${i.lost ? 'lost' : ''}" title="${i.name}">${i.icon}${i.count > 1 ? `<b class="gr-num">${i.count}</b>` : ''}</span>`).join('')
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
  /** Donne une Super Croquette (ou toutes) à un familier ; renvoie le message. */
  feed(uid: number, all: boolean): string;
  detail(uid: number): ItemDetail;
  resource(id: number): ItemDetail;
  /** Équipe ou retire. */
  toggle(uid: number): void;
  /** L'objet a été regardé (plus « nouveau »). */
  seen(uid: number): void;
  /** Fiche Encyclopédie (objet possédé ou non). */
  catalog(id: number): ItemDetail;
  /** Met / enlève favori ou verrou sur un équipement (uid) ou une ressource (id). */
  mark(kind: 'uid' | 'res', id: number, mark: Mark): void;
}

/** Ce dont l'écran Donjons a besoin (fourni par le jeu). */
export interface ZoneHooks {
  view(): AtlasView;
  choose(id: string): void;
  current(): { kind: 'map' | 'dungeon'; name: string; level: number; sub: string; key?: { text: string; ok: boolean } };
  /** Clés d'un donjon donné (texte, et s'il est possible d'entrer). */
  info(id: string): { key?: { text: string; ok: boolean } };
  /** Entrée dans l'étape choisie (dépense une clé pour un donjon déjà vaincu) ; false s'il n'y a pas de clé. */
  enter(): boolean;
  /** Étapes nouvellement débloquées (pastille). */
  fresh(): number;
  seen(): void;
}

/** Réglages d'une barre de filtres. */
interface BarCfg {
  placeholder: string;
  slot?: boolean;
  stat?: boolean;
  set?: boolean;
  rarity?: boolean;
  toggles: [string, string][];
  sorts: [SortKey, string][];
  /** Libellé d'un filtre posé depuis un autre panneau (« ing:303 »). */
  label?: (o: string) => string;
}
const SLOT_OPTIONS: [ItemSlot, string][] = [
  ['chapeau', 'Chapeau'], ['cape', 'Cape'], ['amulette', 'Amulette'], ['anneau', 'Anneau'], ['ceinture', 'Ceinture'],
  ['bottes', 'Bottes'], ['bouclier', 'Bouclier'], ['arme', 'Arme'],
];
const SET_OPTIONS = () => Object.values(SETS).map((s): [number, string] => [s.id, s.name]).sort((a, b) => a[1].localeCompare(b[1], 'fr'));
const specialLabel = (o: string) => {
  const [k, id] = o.split(':');
  const name = item(Number(id)).name;
  return k === 'ing' ? `Utilise : ${name}` : k === 'id' ? `Recette : ${name}` : o;
};
const SEARCH_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M15 15l5.5 5.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>';
const STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8l-5.8 3.3 1.4-6.4-4.9-4.4 6.5-.7z" fill="#f2c14e" stroke="#3b2414" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const LOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5" fill="none" stroke="#3b2414" stroke-width="2.6"/><rect x="4.5" y="10" width="15" height="11" rx="3" fill="#8ddccf" stroke="#3b2414" stroke-width="2"/><circle cx="12" cy="15.5" r="1.8" fill="#3b2414"/></svg>';

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
  /** Équipements possédés (fusion, brisage). */
  forge(): ForgeRow[];
  fusion(uid: number): FusionView | null;
  /** Fusionne ; renvoie le message à afficher. */
  fuse(uid: number, partners: number[]): string;
  breakInfo(uid: number): BreakView | null;
  /** Brise ; renvoie le message à afficher. */
  breakIt(uid: number): string;
  /** Forgemagie : vue d'un objet, et pose d'une rune (résultat à afficher). */
  fm(uid: number): FmView | null;
  fmApply(uid: number, runeId: number): { text: string; outcome: 'sc' | 'sn' | 'ec' | null };
}
