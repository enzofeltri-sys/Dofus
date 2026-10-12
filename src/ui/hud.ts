import './hud.css';
import {
  ICON_ABSORPTION, ICON_ATTIRANCE, ICON_BLOOD, ICON_HEART, ICON_MUTILATION, ICON_PAUSE, ICON_SACRIEUR, ICON_STAR, ICON_SUPPLICE,
} from './icons';

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

/** Interface de combat (DOM au-dessus du canvas). */
export class Hud {
  readonly root: HTMLElement;
  private hpVal!: HTMLElement;
  private hpFill!: HTMLElement;
  private hpLabel!: HTMLElement;
  private paVal!: HTMLElement;
  private drops: HTMLElement[] = [];
  private spellEls: HTMLElement[] = [];
  readonly joy: HTMLElement;
  readonly knob: HTMLElement;
  readonly hint: HTMLElement;
  readonly bar: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    root.innerHTML = `
      <div class="top">
        <div class="portrait">${ICON_SACRIEUR}<div class="level">12</div></div>
        <div class="titlebox">
          <div class="plaque">Crypte de Kardorim</div>
          <div class="rooms"></div>
          <div class="xp"><b style="width:62%"></b></div>
        </div>
        <button class="pause" aria-label="Pause">${ICON_PAUSE}</button>
      </div>
      <div class="hint">Glisse le pouce pour te déplacer</div>
      <div class="joy idle"><div class="base"></div><div class="knob"></div></div>
      <div class="bar">
        <div class="vitals">
          <div class="heart">${ICON_HEART}<div class="val">--</div></div>
          <div class="hpbar"><div class="track"><div class="fill"></div><div class="label">--</div></div><div class="suffering"><div class="drops"></div></div></div>
          <div class="star">${ICON_STAR}<div class="val">6</div></div>
        </div>
        <div class="spells"><div class="lock">Sorts : étape 3</div></div>
      </div>
      <div class="toast" hidden></div>
      <div class="overlay" hidden><div class="card"><h2></h2><p></p><button type="button" class="btn"></button></div></div>`;
    this.hpVal = root.querySelector('.heart .val')!;
    this.hpFill = root.querySelector('.hpbar .fill')!;
    this.hpLabel = root.querySelector('.hpbar .label')!;
    this.paVal = root.querySelector('.star .val')!;
    this.joy = root.querySelector('.joy')!;
    this.knob = root.querySelector('.joy .knob')!;
    this.hint = root.querySelector('.hint')!;
    this.bar = root.querySelector('.bar')!;

    this.setRooms(1, 9);
    const drops = root.querySelector('.suffering .drops')!;
    for (let i = 0; i < 10; i++) {
      const d = document.createElement('i');
      d.innerHTML = ICON_BLOOD;
      drops.appendChild(d);
      this.drops.push(d);
    }
    const spells = root.querySelector('.spells')!;
    SPELL_BAR.forEach((s, i) => {
      const el = document.createElement('div');
      el.className = 'spell';
      el.innerHTML = `${s.icon}<div class="cd"></div><div class="prio">${i + 1}</div><div class="cost">${s.cost}</div>`;
      spells.appendChild(el);
      this.spellEls.push(el);
    });
  }

  /** Progression dans le donjon : salle courante (1..n), la dernière est celle du boss. */
  setRooms(cur: number, total: number) {
    const el = this.root.querySelector('.rooms')!;
    el.innerHTML = [...Array(total)].map((_, i) => `<i class="${i === total - 1 ? 'boss' : i + 1 < cur ? 'done' : i + 1 === cur ? 'cur' : ''}"></i>`).join('') + `<span>Salle ${cur}/${total}</span>`;
  }

  /** Hauteur occupée par la barre du bas (pour cadrer la caméra au-dessus). */
  bottomInset(): number {
    return window.innerHeight - this.bar.getBoundingClientRect().top;
  }
  topInset(): number {
    return (this.root.querySelector('.top') as HTMLElement).getBoundingClientRect().bottom;
  }

  setHp(hp: number, max: number) {
    this.hpVal.textContent = String(Math.round(hp));
    this.hpFill.style.width = `${(100 * hp) / max}%`;
    this.hpLabel.textContent = `${Math.round(hp)} / ${max}`;
  }
  setPa(pa: number) {
    this.paVal.textContent = String(Math.floor(pa));
  }
  setSuffering(n: number) {
    this.drops.forEach((d, i) => d.classList.toggle('on', i < n));
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
