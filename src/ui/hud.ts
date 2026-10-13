import './hud.css';
import { sacrieurSvg } from '../art/sacrieur';
import { ICONS } from './grimoire-icons';
import { ICON_ABSORPTION, ICON_ATTIRANCE, ICON_MUTILATION, ICON_SUPPLICE } from './icons';

export interface SpellSlot {
  name: string;
  icon: string;
  cost: number;
}

export const SPELL_BAR: SpellSlot[] = [
  { name: 'Supplice', icon: ICON_SUPPLICE, cost: 3 },
  { name: 'Absorption', icon: ICON_ABSORPTION, cost: 3 },
  { name: 'Attirance', icon: ICON_ATTIRANCE, cost: 2 },
  { name: 'Mutilation', icon: ICON_MUTILATION, cost: 2 },
];

const PA_MAX = 6;
const SUFFERING_MAX = 10;

/** Tête du Sacrieur recadrée pour le médaillon (même dessin que le personnage en jeu). */
const portraitSvg = () => sacrieurSvg('head').replace(/viewBox="[^"]*" width="\d+" height="\d+"/, 'viewBox="31 13 66 66"');

const PAUSE_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="5.5" y="4.5" width="4.6" height="15" rx="2" fill="#3b2414"/><rect x="13.9" y="4.5" width="4.6" height="15" rx="2" fill="#3b2414"/></svg>`;
const LOCK_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 10V8a4.5 4.5 0 0 1 9 0v2" fill="none" stroke="#3b2414" stroke-width="2.4" stroke-linecap="round"/><rect x="5" y="10" width="14" height="10" rx="3" fill="#e3a838" stroke="#3b2414" stroke-width="2.2"/><circle cx="12" cy="15" r="1.6" fill="#3b2414"/></svg>`;

/** Interface de combat (DOM au-dessus du canvas), charte « grimoire d'aventurier ». */
export class Hud {
  readonly root: HTMLElement;
  private hpFill!: HTMLElement;
  private hpVal!: HTMLElement;
  private paFill!: HTMLElement;
  private paVal!: HTMLElement;
  private sufFill!: HTMLElement;
  private sufVal!: HTMLElement;
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
      <div class="bar gr-panel">
        <div class="gr-gauge hp">
          <span class="ico">${ICONS.vie.svg}</span>
          <span class="track"><span class="fill" style="--c: var(--coral)"></span></span>
          <span class="val">--</span>
        </div>
        <div class="row2">
          <div class="gr-gauge mini pa">
            <span class="ico">${ICONS.pa.svg}</span>
            <span class="track"><span class="fill" style="--c: var(--turquoise)"></span></span>
            <span class="val">6</span>
          </div>
          <div class="gr-gauge mini suf">
            <span class="ico">${ICONS.souffrance.svg}</span>
            <span class="track"><span class="fill" style="--c: var(--coral-dark)"></span></span>
            <span class="val">0</span>
          </div>
        </div>
        <div class="spells"><div class="lock"><span>${LOCK_SVG}Sorts : étape 3</span></div></div>
      </div>
      <div class="bossbar gr-panel" hidden>
        <div class="bname"></div>
        <div class="gr-gauge"><span class="track"><span class="fill" style="--c: var(--magic)"></span></span><span class="val gr-num"></span></div>
      </div>
      <div class="toast-wrap"><div class="gr-toast toast" hidden></div></div>
      <div class="overlay" hidden><div class="card gr-panel gold"><h2 class="gr-title"></h2><p></p><button type="button" class="gr-btn btn"></button></div></div>`;
    this.hpFill = root.querySelector('.hp .fill')!;
    this.hpVal = root.querySelector('.hp .val')!;
    this.paFill = root.querySelector('.pa .fill')!;
    this.paVal = root.querySelector('.pa .val')!;
    this.sufFill = root.querySelector('.suf .fill')!;
    this.sufVal = root.querySelector('.suf .val')!;
    this.joy = root.querySelector('.joy')!;
    this.knob = root.querySelector('.joy .knob')!;
    this.hint = root.querySelector('.hint')!;
    this.bar = root.querySelector('.bar')!;

    this.setRooms(1, 9);
    const spells = root.querySelector('.spells')!;
    SPELL_BAR.forEach((s, i) => {
      const el = document.createElement('div');
      el.className = 'spell';
      el.innerHTML = `<div class="art">${s.icon}</div><div class="cd"></div><div class="prio gr-num">${i + 1}</div><div class="cost gr-num">${s.cost}</div>`;
      spells.appendChild(el);
      this.spellEls.push(el);
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
  setHp(hp: number, max: number) {
    const k = Math.max(0, hp) / max;
    this.hpFill.style.setProperty('--v', `${100 * k}%`);
    this.hpVal.textContent = `${Math.round(Math.max(0, hp))}/${max}`;
    this.bar.classList.toggle('low', k <= 0.3);
  }
  setPa(pa: number) {
    this.paFill.style.setProperty('--v', `${(100 * Math.min(pa, PA_MAX)) / PA_MAX}%`);
    this.paVal.textContent = String(Math.floor(pa));
  }
  setSuffering(n: number) {
    this.sufFill.style.setProperty('--v', `${(100 * Math.min(n, SUFFERING_MAX)) / SUFFERING_MAX}%`);
    this.sufVal.textContent = String(n);
  }
  /** cd : fraction restante du cooldown (0 = prêt). */
  setCooldown(i: number, cd: number) {
    this.spellEls[i].style.setProperty('--cd', String(Math.max(0, Math.min(1, cd))));
  }
  flashCast(i: number) {
    const el = this.spellEls[i];
    el.classList.remove('cast');
    void el.offsetWidth;
    el.classList.add('cast');
  }
  placeHint(y: number) {
    this.hint.style.top = `${y}px`;
  }

  /** Barre de sorts verrouillée (les sorts arrivent à l'étape 3). */
  lockSpells(locked: boolean) {
    this.root.querySelector('.spells')!.classList.toggle('locked', locked);
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
    return !this.root.querySelector<HTMLElement>('.overlay')!.hidden;
  }
}
