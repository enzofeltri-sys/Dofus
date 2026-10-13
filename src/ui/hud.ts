import './hud.css';
import { sacrieurSvg } from '../art/sacrieur';
import { ICONS } from './grimoire-icons';

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
const portraitSvg = () => sacrieurSvg('head').replace(/viewBox="[^"]*" width="\d+" height="\d+"/, 'viewBox="31 13 66 66"');

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
        <div class="gr-gauge"><span class="track"><span class="fill" style="--c: var(--magic)"></span></span><span class="val gr-num"></span></div>
      </div>
      <div class="toast-wrap"><div class="gr-toast toast" hidden></div></div>
      <div class="picker" hidden>
        <div class="pk-head"><h2 class="gr-title"></h2><p class="pk-sub"></p></div>
        <div class="pk-cards"></div>
        <div class="pk-book gr-panel"><div class="gr-label pk-booklbl"></div><div class="pk-slots"></div></div>
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
  setBoss(name: string | null, hp = 0, max = 1) {
    const el = this.root.querySelector<HTMLElement>('.bossbar')!;
    el.hidden = name === null;
    if (name === null) return;
    el.querySelector('.bname')!.textContent = name;
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
    return !this.root.querySelector<HTMLElement>('.overlay')!.hidden || !this.root.querySelector<HTMLElement>('.picker')!.hidden;
  }
}
