<div align="center">
![Allo-Meteo Banner](./docs/images/banner1.png)

# Allo-Météo Oisans

**Bulletin météo intelligent & état des routes pour l'Oisans**

[![RGPD Compliant](https://img.shields.io/badge/RGPD-Conforme-green?style=for-the-badge&logo=shield)](https://www.cnil.fr)
[![Cookies](https://img.shields.io/badge/Cookies-13%20mois%20max-blue?style=for-the-badge&logo=cookie)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)]()
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.4.1-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.5%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

</div>

## Vue d'ensemble

Application web de bulletins météo en temps réel pour la région de l'Oisans (Alpes françaises) avec :

- **IA générative** (Google Gemini 2.5 Flash avec recherche web)
- **Synthèse vocale** des bulletins météo (Gemini TTS)
- **Prévisions 7 stations** (Le Bourg-d'Oisans, Alpe d'Huez, Les 2 Alpes, Vaujany, Oz, St-Christophe, Villard-Reculas)
- **Alertes risques** (sismique, crues, routes)
- **Données météo** via Prevision-Meteo.ch
- **RGPD compliant** avec bandeau cookies

## Technologies

### Frontend

- **React 19.2.3** - Framework UI avec server components
- **TypeScript 5.8.2** - Typage statique
- **Vite 6.4.1** - Build tool ultra-rapide
- **Lucide React** - Bibliothèque d'icônes
- **Tailwind CSS** - Styling utility-first (intégré)

### IA & APIs

- **Google Gemini AI 2.5 Flash** - Analyse météo avec recherche web temps réel
- **Gemini TTS** - Synthèse vocale (voix Kore)
- **Prevision-Meteo.ch** - Données météo montagne
- **ipapi.co** - Géolocalisation utilisateur (RGPD)

### Conformité

- **RGPD** - Bandeau cookies obligatoire
- **Cookies max 13 mois** (Article 82 CNIL)
- **Tracking consentement** utilisateur
- **Données locales** (localStorage + cookies)
- **Géolocalisation** avec consentement

---

## Installation Rapide (macOS)

Pour configurer automatiquement tout votre environnement (Node.js, Docker, VS Code, etc.) et cloner le projet :

```bash
# Si vous n'avez pas encore le projet :
curl -sSL https://raw.githubusercontent.com/ThePhoenixAgency/Allo-Meteo/main/bootstrap.sh | bash

# Si vous avez déjà cloné le projet :
./bootstrap.sh
```

_Le script est intelligent : il détecte s'il est déjà dans le dossier du projet et ne réinstalle que le nécessaire._

## Run Locally

1. **Configurer les Secrets GitHub (pour CI/CD) :**
   - Allez dans Settings > Secrets and Variables > Actions
   - Ajoutez `GEMINI_API_KEY` et `OPENWEATHER_API_KEY`.

2. **Configurer l'Environnement Local (Optionnel) :**
   - Les clés sont récupérées via `process.env`. Assurez-vous qu'elles sont dans votre environnement.

3. **Run the app:**

   ```bash
   npm run dev
   ```

4. **Open:** http://localhost:3000

## Déploiement Production

📚 **Guide complet:** [docs/vercel-deploy.md](docs/vercel-deploy.md)

**Résumé:**

1. Se connecter sur [vercel.com](https://vercel.com) avec GitHub
2. Importer le projet `ThePhoenixAgency/Allo-meteo`
3. Ajouter `GEMINI_API_KEY` et `OPENWEATHER_API_KEY` dans Environment Variables.
4. Déployer → C'est en ligne !

Vercel redéploie automatiquement à chaque push sur `main`.

---

## Conformité RGPD

### Cookies utilisés

| Cookie                  | Durée   | Usage                   |
| ----------------------- | ------- | ----------------------- |
| `allo_meteo_consent`    | 13 mois | Consentement cookies    |
| `allo_meteo_user_token` | 13 mois | Identifiant utilisateur |

### Données locales (localStorage)

- `allo_meteo_user_profile` - Profil utilisateur (ville, IP, visites)
- `lastUserActivity` - Timestamp dernière interaction (pas d'appel API si inactif)
- `lastAIFetch` - Cache requêtes IA (30 minutes)

### Suppression données

L'utilisateur peut supprimer ses données via la console navigateur :

```javascript
localStorage.clear();
document.cookie
  .split(';')
  .forEach(
    (c) =>
      (document.cookie =
        c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;'),
  );
```

---

## Changelog Récent

### 1.1.2 - 2026-01-28: Stabilité, Gouvernance IA & Correction Types

- **Correction Critique** : Résolution de l'erreur TypeScript dans les tests unitaires via l'utilisation du constructeur `Response` natif pour les mocks de `fetch`.
- **Standardisation IA** : Création de `.github/AI_INSTRUCTIONS.md` pour garantir la qualité du code (SOLID, DRY, KISS).
- **Versionnage Sémantique** : Passage à la norme SemVer (Base 1.1.2).
- **Footer Dynamique** : Support de l'affichage automatique de la date de dernière mise à jour.
- **Workflow Silencieux** : CI/CD configurée pour des pushs/deploy sans notifications intrusives.
- **Structure Simplifiée** : Centralisation du code source à la racine (`index.tsx`) pour une maintenance facilitée.

### 1.1.1 - 2026-01-28: Multi-Source API & Tests Locaux

- **Force de calcul** : Ajout du support combiné OpenWeather et WeatherAPI pour une redondance maximale.
- **Mode Test Local** : Possibilité d'injecter les clés via terminal sans fichier `.env`.
- **Refonte Cookie Banner** : Nouvelle interface flottante, plus discrète et moderne.

### 1.0.0 - 2026-01-24: Premier Déploiement Officiel

- **Gemini AI** : Météo intelligente avec recherche web temps réel.
- **Architecture Oisans** : 7 stations connectées.
- **CI/CD Vercel** : Pipeline de déploiement automatique.

#### Migration Gemini AI

- **Gemini obligatoire** pour météo temps réel (recherche web active)
- **GPS précis** : 7 stations de l'Oisans pré-configurées
- **Prompt structuré** : format forcé avec validation des sections requises
- **Cache 30min** : économie tokens Gemini
- **Pas d'appel API** sans interaction utilisateur

#### Tests Unitaires (19 tests - 100% Réussis)

- Coordonnées GPS validées (toutes stations < 50km du Bourg d'Oisans)
- API météo : gestion erreurs 404, 500, timeout
- Tokens Gemini : cache, rate limiting 5s
- Disponibilité 24/7 sans fenêtre de maintenance

#### CI/CD Auto-Deploy

- **GitHub Actions** : build + tests automatiques
- **Auto-merge** : si tests passent (sauf Dependabot)
- **Vercel deploy** : automatique sur merge main

### 2026-01-18 - Nettoyage & Améliorations

- Ajout timeout sur requêtes API externes
- Validation améliorée des réponses API
- Utilisation `URL()` constructor pour construction d'URLs
- Optimisation gestion d'erreurs

---

## Changer de Lieu

📚 **Guide détaillé:** [docs/vercel-deploy.md](docs/vercel-deploy.md#changer-le-lieu-oisans--autre-région)

**Résumé:** Modifier `index.tsx` (lignes 23-25, 151-157, 159) → Commit + push → Vercel redéploie automatiquement

**Coordonnées GPS:** [Google Maps](https://www.google.com/maps) → Clic droit → "Copier les coordonnées"

---

## Tests

📚 **Guide complet:** [docs/prompt-test.md](docs/prompt-test.md)

```bash
npm test                # 19 tests automatiques
npm run test:watch      # Mode watch
npm run test:coverage   # Couverture
```

**Tests:** GPS, API météo (404/500/timeout), tokens Gemini, format réponses, disponibilité 24/7

## 📦 Build & Deploy

```bash
npm run build    # Production build
npm run preview  # Test production locally
npm run validate # Lint + TypeCheck + Tests + Build
```
