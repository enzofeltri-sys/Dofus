# Dofus — version Enzo · Debrief complet du projet

> État au 14 octobre 2026. Ce document résume tout le projet pour qu'une autre personne (ou une autre IA)
> puisse comprendre où on en est et aider sur un point précis sans tout relire.
> La référence détaillée des règles reste `docs/DESIGN.md`.

---

## 1. Le projet en une page

- **Quoi** : un jeu de fan **privé**, jamais publié, dans l'univers de **Dofus** (Ankama).
- **Genre** : roguelike d'action en **temps réel**, en **mode portrait** sur téléphone. On ne fait que **se déplacer** (joystick virtuel) : l'arme et les sorts se lancent **tout seuls**.
- **Mode Histoire** : tous les donjons de Dofus (126), chacun joué comme une partie de 8 à 10 salles avec mini-boss et boss.
- **Progression persistante** comme Dofus : niveaux 1 à 200, caractéristiques, équipement, panoplies, puis métier unique « Artisan », raretés, fusion, forgemagie.
- **Plus tard** : un mode Survie façon Brotato (repart de zéro à chaque partie).
- **Où jouer** : page privée claude.ai (un seul fichier HTML) et site Cloudflare (déployé automatiquement depuis la branche `main`).

### Règles de travail
- On avance **dans l'ordre**, étape par étape : proposition de design → Enzo valide ou demande des changements → intégration → étape suivante.
- **Honnêteté** : on ne dit pas oui à tout, on signale les risques.
- **Tester avant de montrer** : tests automatiques + vérification dans un vrai navigateur, captures à l'appui.
- **Demander avant toute nouvelle forme de publication.**
- Les règles de Dofus sont reprises **au plus près** (vraies données DofusDB), et seulement adaptées quand le temps réel l'impose.

---

## 2. Ce qui est fait

| Étape | Contenu | État |
|---|---|---|
| 1 | Test de style : salle de la Crypte de Kardorim en portrait, Sacrieur, Chafers, interface « grimoire » | ✅ validé |
| 2 | Moteur de combat : monde à pas fixe, collisions, IA des 4 Chafers (attaques annoncées au sol), salles, sortie, défaite | ✅ validé |
| 3 | 6 sorts du Sacrieur, Souffrance, Mutilation / Coagulation, cartes entre les salles, boss Kardorim | ✅ validé |
| 4 | Mini-boss (salle 5), camp, bilan de partie, sauvegarde locale | ✅ validé |
| 5 | Fiche de caractéristiques complète, vraies données des monstres, XP et niveaux, points à répartir | ✅ validé |
| 6 | Butin réel + butin de région, inventaire, équipement, panoplies | 🔶 à valider en jeu |
| 7 | Artisan (fabrication) | à venir |
| 8 | Raretés, fusion, brisage, forgemagie | à venir |
| 9 | Zones de farm (Plaines d'Incarnam en premier) | à venir |
| 10 | Donjons suivants par tranches de niveaux, finitions, installation sur l'appareil | à venir |

### 2.1 Combat (temps réel)
- **1 tour Dofus = 4 secondes.** 6 PA par tour sous forme de jauge qui se recharge ; chaque sort coûte ses vrais PA.
- **Arme automatique** : Épée rouillée, 1,9 coup/s, frappe en arc tout ce qui est à portée.
- **Sorts automatiques** lancés dans l'ordre des cases (priorité choisie par le joueur), avec les vraies portées et limites de lancer.
- **Vol de vie** : soigne de 50 % des dommages. Dommages des sorts ×0,3 (compensation : on lance bien plus de sorts qu'en tour par tour).
- **Monstres** : vraies stats DofusDB (5 grades), PV ×1,8 et Puissance +30 % en temps réel ; chaque attaque est **annoncée au sol** (cercle, cône ou ligne) avant de frapper.
- **Salles** : 6 à 12 monstres, deuxième vague à partir de la salle 3, mini-boss en salle 5 (Sergent Chafer d'élite : PV ×2,5, charge en ligne), boss en salle 9 (**Kardorim** : Casse-crâne, Craquement d'Os qui accélère ses alliés, invocation de Kardorib).
- **Calibrage validé** : « si je me concentre, je le fais » (Enzo). Une Crypte réussie dure ≈ 3 min 30.

### 2.2 Sacrieur
- **Sorts (niveau 10, données réelles)** : Supplice (Terre, marque), Hémorragie (Air, réduit les soins), Absorption (Feu, −Puissance), Stase (Eau, −Critique), Attirance (attire de 7 cases), Mutilation (sacrifie 10 % des PV par palier pour de la Puissance, puis bouclier de Coagulation).
- **Souffrance** : 1 charge par tranche de **10 % de PV perdus** (10 max), elle ne redescend qu'avec les soins ; chaque charge donne de la Puissance et active des bonus (Attirance : portée +4 à 6 charges).
- **Cases de sorts** selon le niveau : 4 au début, 5 au niveau 50, 6 au 100, 7 au 150, 8 au 200.
- **Cartes entre les salles** : 1 au choix parmi 3 (nouveau sort, amélioration +5 % de dégâts ou −5 % de recharge, bonus de stat, passif). Tout est remis à zéro à la partie suivante.
- **Passifs** (cumulables 3 fois) : Soif de sang, Sang neuf, Épines, Frénésie, Douleur exaltée, Peau de cuir.

### 2.3 Caractéristiques et formules (comme Dofus)
- Fiche complète : Vitalité, Sagesse, Force, Intelligence, Chance, Agilité ; PA, PM, Portée, Invocations, Initiative, Prospection ; Puissance, Dommages (fixes et par élément), Critique, Dommages critiques, Soins, Poussée, Renvoi, % mêlée / distance / arme / sort ; résistances % et fixes par élément, critiques, poussée, mêlée / distance ; Tacle, Fuite, Esquive et Retrait PA/PM ; Érosion.
- **Dommages** : base × (100 + carac + Puissance) / 100 + dommages fixes ; puis résistances fixes, puis % (plafonnées à 50 %, une faiblesse négative augmente les dégâts).
- **Traductions en temps réel** : poussée (un monstre frappé contre un mur prend des dommages de poussée), tacle (au contact d'un monstre, la vitesse baisse selon tacle/fuite), érosion (10 % des dégâts subis réduisent les PV max jusqu'à la fin de la salle), initiative (le camp le plus rapide agit tout de suite).
- **Affichage** : chiffres corail sur une faiblesse, grisés sur une résistance ; faiblesses et résistances du boss sur sa barre de vie.

### 2.4 Progression
- **XP** : vraie XP de chaque monstre (grade DofusDB), bonus de Sagesse, XP dégressive au-delà de 10 niveaux d'écart. Gardée même en cas de défaite.
- **Courbe** exponentielle : ≈ 4 min pour passer le niveau 10, ≈ 18 h pour le niveau 199 → 200, **≈ 600 h** au total. Une Crypte rapporte ≈ 15 000 XP (environ un niveau au niveau 10).
- **5 points par niveau**, paliers réels du Sacrieur (1 pour 1 jusqu'à 100, puis 2, 3, 4 ; Sagesse 3 pour 1), remise à zéro gratuite au camp.

### 2.5 Butin et équipement (étape 6)
- **Vraies tables de drop** de la Crypte (DofusDB) avec multiplicateurs de rythme : ressources ×0,15, équipement ×0,05, boss aux taux réels (panoplie Kardorim : 20 % par pièce), mini-boss ×3. La Prospection multiplie les chances.
- **Butin de région** : dans Dofus, la plupart des objets viennent du monde ouvert. Chaque donjon est rattaché à sa région (Crypte → Incarnam) et ses monstres ont ≈ 10 % de chances de lâcher un objet des monstres de la région.
- **Équipement** : jets aléatoires dans les vraies fourchettes, niveau requis réel, bonus de panoplie réels, deux anneaux (identiques permis, sauf anneaux de panoplie).
- **Départ** : Panoplie du Jeune Aventurier sans le Chapeau (le Chapeau tombe sur les Chafers : premier objectif).
- **Règle de mort** : on garde l'XP et ce que les monstres ont lâché, on perd le butin du boss.

### 2.6 Camp (écran d'accueil)
- Le Sacrieur, son niveau et sa barre d'XP, ses records.
- **Caractéristiques** : répartition des points, remise à zéro, fiche complète en 4 onglets.
- **Inventaire** : le Sacrieur entouré de ses cases (comme Dofus), panoplies actives, équipements et ressources, fiche d'objet avec comparaison (vert / rouge) et bouton Équiper.
- Entrée du donjon ; bilan de fin de partie (statistiques, cartes prises, XP, montée de niveau, butin).

---

## 3. Décisions validées pour la suite

- **Zones de farm (étape 9)** : une zone par région, 5 salles en vagues avec les vrais monstres du monde ouvert. Garde-fous pour ne pas rendre le jeu trop facile : seulement le butin de la région (jamais celui des donjons ni des boss), XP ×0,5 par minute, 1 carte toutes les 2 salles, ni mini-boss ni boss, aucune adaptation au personnage.
- **Difficulté jamais ajustée au personnage** : un perso du niveau du donjon avec un équipement de son niveau doit le trouver difficile mais faisable ; 10 niveaux en dessous, quasi impossible ; au-dessus, il devient un donjon de farm.
- **Artisan (étape 7, fait)** : un seul métier, niveaux 1 à 200 ; atelier au camp avec 105 vraies recettes de Dofus 3, toutes faisables avec le butin du jeu (pas encore d’armes) ; objets Commun à jets aléatoires ; craft critique (Rare) à l’étape 8.
- **Raretés (étape 8)** : Commun → Rare → Épique → Légendaire → Mythique (≈ +15 % par rang). Fusion (3 objets identiques, puis objets de la même panoplie), brisage en runes, forgemagie avec les vraies règles (puits, exos).

---

## 4. Technique

- **Pile** : TypeScript, Vite, **PixiJS 8** (WebGL 2D) pour le jeu, DOM + CSS pour l'interface. Tests : **Vitest** (58 tests). Vérification navigateur : Playwright + Chromium (captures en format téléphone).
- **Architecture** :
  - `src/game/` : toute la logique, sans affichage (monde à pas fixe de 1/60 s, événements consommés par le rendu) : `world.ts`, `formulas.ts`, `progression.ts`, `inventory.ts`, `loot.ts`, `cards.ts`, `save.ts`.
  - `src/game/data/` : sorts, monstres, héros, objets (`items.gen.ts` généré depuis DofusDB par `tools/fetch_items.py`).
  - `src/art/` : dessins **vectoriels SVG** (Sacrieur, Chafers, Kardorim, décor), découpés en morceaux.
  - `src/render/` : squelette articulé (`rig.ts`) et animations (`anims.ts`).
  - `src/ui/` : interface (HUD, cartes, camp, fiche, inventaire), charte « grimoire d'aventurier ».
  - `tools/` : simulation d'équilibrage (`balance.ts`), tests navigateur (`flow.mjs`, `progress.mjs`, `inventory.mjs`), extraction des données (`fetch_items.py`).
- **Données** : DofusDB (api.dofusdb.fr) pour les monstres, grades, sorts, objets, panoplies, drops et icônes d'objets.
- **Publication** : `npm run build:single` produit un seul fichier HTML (≈ 1,1 Mo) ; la branche `main` est déployée automatiquement sur Cloudflare.
- **Sauvegarde** : locale (localStorage), versionnée avec migration automatique. ⚠️ Sur iPhone, ajouter le jeu à l'écran d'accueil pour que Safari ne l'efface pas.

---

## 5. Direction artistique (pour une aide graphique)

### 5.1 Le style
- **Dessin cartoon vectoriel**, proche du Dofus officiel (Dofus 2 / Wakfu) : contours sombres épais (brun encre `#3b2414`), aplats de couleurs franches, un ombrage simple, des yeux expressifs, des proportions « chibi » mais pas trop (tête ≈ 1/3 du corps).
- **Vue 3/4 de dessus** (sol écrasé à 62 %), personnages vus **de profil 3/4**, tournés vers la droite (retournés par le jeu pour aller à gauche).
- **Interface « grimoire d'aventurier »** : parchemin, cadres bruns arrondis, polices Lilita One (titres) et Nunito (texte).

### 5.2 Palette
| Rôle | Couleur |
|---|---|
| Encre (contours, texte) | `#3b2414` |
| Parchemin | `#f7eed6` / `#dcc38c` |
| Vert feuille | `#5d8c3a` |
| Turquoise | `#22a196` |
| Corail | `#e8664a` |
| Or | `#e3a838` |
| Magie (violet) | `#8b52c9` |
| Nuit | `#2a160c` |

### 5.3 Contraintes techniques des personnages (important)
Les personnages **ne sont pas des images fixes** : ce sont des **pantins articulés**. Chaque monstre est dessiné en **morceaux séparés** qui tournent autour de pivots, et le jeu les anime (marche, attaque, coup reçu, mort).
- **Chafer (et monstres du même gabarit)** : 9 morceaux — cape, bras arrière, jambe arrière, bassin, jambe avant, torse, bouclier, bras avant, tête. Dessin de 160 × 186, pieds en (84, 177).
- **Sacrieur** : 6 morceaux — jambe arrière, jambe avant, bras arrière, torse, bras avant, tête.
- Fond **transparent**, morceaux qui se chevauchent légèrement aux articulations (pour ne pas voir de trou quand ils tournent).
- Les morceaux doivent rester **cohérents entre eux** (même épaisseur de trait, mêmes couleurs, même éclairage).

### 5.4 Ce dont on aura besoin
- **Étape 9** : les monstres d'Incarnam (≈ 6 familles : Bouftous, Tofus, Fleurs, Gloots, Chakrobats / Ronronchons, Feux) et un décor de plaine en portrait (720 × 1560).
- **Étape 10 et après** : les monstres et décors de chaque nouveau donjon.
- Éventuellement : de nouvelles icônes de sorts, des effets visuels de sorts.

---

## 6. Questions ouvertes / à surveiller

- Rythme du butin et difficulté avec l'équipement de l'Aventurier (test d'Enzo en cours).
- Nom de la jauge du Sacrieur : « Souffrance » (nom Dofus) ou « Saignement ».
- Inclusion des 8 donjons saisonniers (Nowel, Halouine…).
- Export / import de sauvegarde entre appareils (prévu, pas encore fait).
