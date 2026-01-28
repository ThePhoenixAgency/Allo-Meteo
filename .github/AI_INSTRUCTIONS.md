# Directives de Codage Allo-Météo

Ce fichier contient les instructions impératives pour tous les agents IA (Antigravity, Gemini, Claude, Copilot) intervenant sur ce codebase.

## Principes Fondamentaux

- **KISS** (Keep It Simple, Stupid) : Privilégier la simplicité et la lisibilité.
- **DRY** (Don't Repeat Yourself) : Toute logique doit avoir une source de vérité unique.
- **SOLID** : Appliquer les principes de conception orientée objet et fonctionnelle.
- **ACID** : Garantir la fiabilité des transactions de données, même côté client.
- **MVC** : Respecter une séparation claire entre Modèle (données/APIs), Vue (Components React) et Contrôleur (Logique de fetch/Hook).

## Standards de Documentation

- **Docstrings** : Chaque fonction et composant doit avoir une en-tête JSDoc décrivant les paramètres, les retours et les effets de bord.
- **Capsule Documentaire** : Inclure un résumé technique en haut des fichiers majeurs.
- **Commentaires Complets** : Expliquer le _pourquoi_ plutôt que le _quoi_.
- **Versioning Sémantique** : Incrémenter les versions (MAJOR.MINOR.PATCH) rigoureusement selon l'impact des changements.

## Workflow & Déploiement

- **Versioning** : Base 1.0.0 fixée au premier déploiement.
- **Footer Dynamique** : La date de dernière mise à jour doit être automatiquement injectée dans le footer lors du build.
- **CI/CD Silencieux** :
  - Déploiement automatique sans notifications mail.
  - Autocommit et Auto-PR activés par défaut.
  - Intervention humaine requise SEULEMENT en cas d'Issue GitHub ou d'échec critique des tests.

## Style de Code & Emojis

- **Interdiction Formelle d'Emojis** : NE JAMAIS ajouter d'emojis dans le code, les commentaires ou les logs de console. Les seuls emojis tolérés sont les lunes (pour les phases lunaires ou le mode nuit).
- **Code Propre** : Clean Code exigé.
- **Typage Strict** : Utiliser TypeScript de manière stricte (Éviter les `any`).
- **Design System** : Harmonisation avec le design system existant (Vanilla CSS / Tailwind).
