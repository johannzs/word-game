# Jeu de Mots - Défi du Personnage

Un jeu de mots interactif où le joueur doit trouver des mots tout en gérant la dégradation d'un personnage et ses vies.

## Règles du Jeu

### Objectif
Trouver tous les mots de la liste sélectionnée tout en gardant le personnage en vie.

### Mécaniques
- **Listes de mots**: 5 listes de 5 mots chacune, sélectionnées aléatoirement au début de chaque partie
- **Vies**: Le joueur commence avec 3 vies
- **Timer**: 30 secondes par mot, le temps écoulé fait perdre une vie
- **Personnage**: Se dégrade visuellement à chaque mot trouvé

### Actions
- **Valider un mot**: 
  - ✅ Bon mot → Personnage se dégrade, mot suivant
  - ❌ Mauvais mot → Perte d'une vie
- **Passer un mot**: Le mot est mis de côté et reviendra à la fin

### Conditions de fin
- **Victoire**: Trouver les 5 mots ET le personnage est à terre (complètement dégradé)
- **Défaite**: Perdre les 3 vies (mauvais mot ou temps écoulé)

## Installation

1. Clonez ou téléchargez les fichiers du projet
2. Ouvrez `index.html` dans votre navigateur web

## Contrôles

- **Entrer le mot**: Tapez dans le champ de texte
- **Valider**: Cliquez sur "Valider" ou appuyez sur Entrée
- **Passer**: Cliquez sur "Passer" pour sauter le mot actuel

## États du personnage

1. **Standing** 😊 - État normal
2. **Degraded** 😟 - Légèrement dégradé
3. **Very-degraded** 😵 - Très dégradé  
4. **On-ground** 😴 - Au sol (victoire possible)

## Technologies utilisées

- HTML5 sémantique
- CSS3 avec animations et transitions
- JavaScript vanilla (ES6+)
- Design responsive

## Fonctionnalités

- Interface intuitive et moderne
- Animations fluides du personnage
- Gestion du temps avec timer
- Système de vies visuel
- Messages de feedback
- Modal de fin de partie
- Bouton de redémarrage
