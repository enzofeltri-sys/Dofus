import { item } from '../game/data/items';

/** Icônes officielles des objets (DofusDB, 64 px), intégrées au jeu. */
const URLS = import.meta.glob('../assets/items/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const BY_ICON = new Map(Object.entries(URLS).map(([path, url]) => [Number(path.match(/(\d+)\.png$/)![1]), url]));

export const itemIconUrl = (id: number): string => BY_ICON.get(item(id).icon) ?? '';
export const itemIconImg = (id: number, cls = '') => `<img class="it-ico ${cls}" src="${itemIconUrl(id)}" alt="" draggable="false">`;
export const allItemIconUrls = () => [...BY_ICON.values()];

/** Armes : icône en 128 px, tenue en main par le Sacrieur. */
const WEAPON_URLS = import.meta.glob('../assets/weapons/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const WEAPON_BY_ICON = new Map(Object.entries(WEAPON_URLS).map(([path, url]) => [Number(path.match(/(\d+)\.png$/)![1]), url]));
export const weaponIconUrl = (id: number): string => WEAPON_BY_ICON.get(item(id).icon) ?? '';
