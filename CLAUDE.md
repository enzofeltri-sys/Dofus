# Dofus — version Enzo

Jeu privé (jamais publié publiquement) : roguelite d'action en temps réel, portrait sur téléphone, univers **Dofus 3** (données DofusDB, version Dofus 3.0 — pas Dofus Touch). Le joueur ne fait que se déplacer ; arme et sorts partent tout seuls.

## Règles de travail avec Enzo (à respecter à chaque session)
- **Écrire à Enzo en français.**
- **Tout dans l'ordre** : je propose un design → Enzo valide ou demande des modifications → j'intègre → on passe à la suite. Une décision de jeu non validée = une proposition, pas du code publié.
- **Être honnête** : ne pas dire oui à tout ; dire quand une idée pose problème, chiffres à l'appui (simulations).
- **Être professionnel** : tester avant de montrer (tests unitaires, parcours dans le navigateur, captures regardées).
- **Toujours demander avant de publier** quelque chose de nouveau. Déjà autorisé en routine : republier l'artifact https://claude.ai/artifact/HvZapFdxVMQneBQzFV7mtV et pousser sur `claude/test-de-style` puis `main` (déploiement Cloudflare).
- **Pas d'invention quand Dofus a la vraie chose** : vrais monstres, objets, recettes, runes, armes (DofusDB). Si une valeur n'est pas vérifiable, le dire.
- **Références visuelles** (décision d'Enzo du 29/10 : le jeu reste strictement privé, on peut **calquer** les illustrations ; avant, la règle était « regarder, jamais copier ») : rendus des cartes du jeu `https://api.dofusdb.fr/img/maps/1/<mapId>.jpg` (identifiants via `api.dofusdb.fr/map-positions?subAreaId=<sous-zone>`), illustrations des monstres `api.dofusdb.fr/img/monsters/<gfxId>.png`, archives publiques dofusdude (`github.com/dofusdude/dofus3-main/releases/latest/download/<archive>.tar.gz`). Guides de donjons (captures en jeu, grandes illustrations des boss, vrais sorts expliqués) : `python3 -I tools/refs_guide.py <page> <dossier vide>` (pages de dofuspourlesnoobs.com, ex. `cimetiere-des-mastodontes`). Toujours partir de ces références avant de dessiner un décor ou un monstre. Inaccessibles d'ici (ne pas contourner) : encyclopédie dofus.com et wiki fandom (403), dofus-portal (refusé par le proxy) ; les archives dofusdude ne vont pas au-delà de 128 px pour les monstres.
- Ne pas contourner le blocage sur le téléchargement des ressources graphiques Ankama (CDN cytrus) ; les icônes DofusDB (`api.dofusdb.fr/img/...`) sont utilisées.

## Où trouver quoi
- `docs/DESIGN.md` : toutes les règles validées et la feuille de route (§10). `docs/DEBRIEF.md` : bilan du projet.
- Données : `python3 tools/fetch_items.py` → `src/game/data/items.gen.ts` (objets, panoplies, drops, recettes, runes, armes) + icônes. Panoplies de zone : `npx vite-node tools/zone_monsters.ts > <dossier>/zone_monsters.json` puis `python3 -I tools/gen_zone_sets.py <dossier>` → `src/game/data/zonesets.gen.ts`.
- Logique : `src/game/` (world, formulas, loot, inventory, craft, forge, search, save…), tests Vitest à côté (`npx vitest run`).
- Interface : `src/ui/hud.ts` (+ vues `*-view.ts`), rendu PixiJS dans `src/main.ts`, dessins SVG dans `src/art/`.
- Navigateur : serveur `npx vite --port 5173`, parcours `node tools/{flow,inventory,progress,artisan,search,forge,weapon,champs}.mjs` (captures dans `shots/`).
- Équilibrage : `npx vite-node tools/balance.ts`, `npx vite-node tools/career.ts [joueurs] [parties] zone=champs|crypte [arme=<id>] [joueur=bon]` (carrière d'un nouveau joueur).
- Publication : `npm run build:split` → `dist-split/dofus.html` + `jeu-<empreinte>.js` + `style-<empreinte>.css` (liste dans `dist-split/files.json`), publiés ensemble sur l'artifact (`files`, en retirant les anciens avec `null`) ; l'empreinte change à chaque version, sinon le téléphone garde l'ancien jeu en cache ; la page seule ne passait plus la validation du serveur à 15 Mo. `npm run build:single` (un seul fichier) reste disponible pour les tests hors ligne.
