// Généré depuis DofusDB (sorts du Sacrieur, Dofus 3) : ne pas modifier à la main.
import type { SpellId } from './spells';

/** Les 22 sorts du Sacrieur : niveau de déblocage réel, coût en PA et description DofusDB ; `id` = sort présent dans le jeu. */
export const GRIMOIRE: { dofusId: number; name: string; level: number; pa: number; text: string; id: SpellId | null }[] = [
  { dofusId: 12725, name: "Supplice", level: 1, pa: 3, text: "Vole de la vie dans l'élément Terre. Les entités qui attaquent la cible sont soignées d'une partie des dommages occasionnés.", id: "supplice" },
  { dofusId: 12748, name: "Hémorragie", level: 1, pa: 3, text: "Réduit les soins reçus par la cible et vole de la vie dans l'élément Air.", id: "hemorragie" },
  { dofusId: 12734, name: "Absorption", level: 1, pa: 3, text: "Vole de la vie dans l'élément Feu et retire de la Puissance aux ennemis ou transfère une partie de la vie du lanceur à l'allié ciblé.", id: "absorption" },
  { dofusId: 12728, name: "Stase", level: 1, pa: 3, text: "Vole de la vie dans l'élément Eau et réduit les chances de Critique.", id: "stase" },
  { dofusId: 12735, name: "Attirance", level: 5, pa: 2, text: "Attire la cible. L'attirance est plus importante et la portée maximale du sort est augmentée de 4 si le lanceur est en Souffrance 6 ou plus.", id: "attirance" },
  { dofusId: 12737, name: "Mutilation", level: 10, pa: 2, text: "Sacrifie une partie de la vie du lanceur pour augmenter sa Puissance. À chaque début de tour, sacrifie de nouveau une partie de sa vie pour incrémenter son état de Mutilation tant que le sort est actif. Relancer le sort retire les effets appliqués et lance le sort Coagulation : • Applique un bouclier sur le lanceur. • Le bouclier est plus important selon l'état de Mutilation.", id: "mutilation" },
  { dofusId: 12744, name: "Épée Vorace", level: 15, pa: 3, text: "Invoque une Épée Vorace maîtrisable qui peut voler de la vie dans l'élément Neutre.", id: "epeeVorace" },
  { dofusId: 12746, name: "Ravage", level: 20, pa: 3, text: "Rapproche le lanceur vers la cible et occasionne des dommages Terre aux ennemis.", id: "ravage" },
  { dofusId: 12733, name: "Assaut", level: 25, pa: 2, text: "Échange de position avec la cible et occasionne des dommages Air aux ennemis.", id: "assaut" },
  { dofusId: 12736, name: "Transposition", level: 30, pa: 3, text: "Échange de position avec la cible. La portée maximale du sort est augmentée de 4 si le lanceur est en Souffrance 6 ou plus.", id: "transposition" },
  { dofusId: 12745, name: "Condensation", level: 35, pa: 3, text: "Occasionne des dommages Eau aux ennemis et attire les cibles vers le lanceur en zone.", id: null },
  { dofusId: 12756, name: "Hostilité", level: 40, pa: 2, text: "Occasionne des dommages Feu aux ennemis et repousse la cible.", id: null },
  { dofusId: 12761, name: "Couronne d'Épines", level: 45, pa: 2, text: "Applique l'état Pesanteur sur les cibles en zone, un bouclier et l'état Couronne d'Épines sur le lanceur : • Renvoie les dommages subis en mêlée aux ennemis à son contact. Applique un bouclier supplémentaire sur le lanceur pour chaque ennemi dans la zone d'effet s'il est en Souffrance 6 ou plus.", id: null },
  { dofusId: 12738, name: "Transfusion", level: 50, pa: 2, text: "Occasionne des dommages Neutre selon la vie restante du lanceur aux ennemis et transfère une partie de sa vie aux alliés en zone.", id: null },
  { dofusId: 12757, name: "Dissolution", level: 55, pa: 4, text: "Vole de la vie dans l'élément Eau et retire de la Fuite en zone. N'affecte pas le lanceur.", id: null },
  { dofusId: 12753, name: "Désolation", level: 60, pa: 4, text: "Vole de la vie dans l'élément Air et retire des PM en zone.", id: null },
  { dofusId: 12739, name: "Sacrifice", level: 65, pa: 2, text: "Intercepte les dommages subis par les alliés en zone. Détruit également les Épées du lanceur dans la zone pour lui transférer une partie de leur vie restante.", id: null },
  { dofusId: 12732, name: "Bain de Sang", level: 70, pa: 4, text: "Augmente le Tacle du lanceur pour chaque entité dans la zone d'effet et vole de la vie dans l'élément Terre en zone.", id: null },
  { dofusId: 12750, name: "Hécatombe", level: 75, pa: 4, text: "Réduit les soins reçus par les cibles et vole de la vie dans l'élément Feu en zone. N'affecte pas le lanceur.", id: null },
  { dofusId: 12759, name: "Libation", level: 80, pa: 3, text: "Sacrifie une partie de la vie du lanceur pour réduire la durée de ses effets et le soigner à la fin de son prochain tour. Les soins sont plus importants selon la Souffrance.", id: null },
  { dofusId: 12743, name: "Berserk", level: 85, pa: 2, text: "Sacrifie une partie de la vie du lanceur pour lui appliquer l'état Berserk : • Rend le lanceur Intaclable. • Augmente ses dommages aux sorts. • Réduit les soins reçus par le lanceur. L'état Berserk est retiré si le lanceur retourne en Souffrance 5 ou moins ou relance le sort.", id: null },
  { dofusId: 12741, name: "Punition", level: 90, pa: 4, text: "Occasionne des dommages dans le meilleur élément du lanceur et des dommages Neutre selon sa vie érodée.", id: null },
];
