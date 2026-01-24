<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🌦️ Allo-Météo Oisans

**Bulletin météo intelligent & prévisions route pour les Alpes (Oisans)**

[![RGPD Compliant](https://img.shields.io/badge/RGPD-Conforme-green?style=for-the-badge&logo=shield)](https://www.cnil.fr)
[![Cookies](https://img.shields.io/badge/Cookies-13%20mois%20max-blue?style=for-the-badge&logo=cookie)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)]()
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.4.1-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.5%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

</div>

## 📋 Vue d'ensemble

Application web de bulletins météo en temps réel pour la région de l'Oisans (Alpes françaises) avec :
- 🤖 **IA générative** (Google Gemini 2.5 Flash avec recherche web)
- 🗣️ **Synthèse vocale** des bulletins météo (Gemini TTS)
- 🏔️ **Prévisions 7 stations** (Le Bourg-d'Oisans, Alpe d'Huez, Les 2 Alpes, Vaujany, Oz, St-Christophe, Villard-Reculas)
- ⚠️ **Alertes risques** (sismique, crues, routes)
- 🌡️ **Données météo** via Prevision-Meteo.ch
- 🍪 **RGPD compliant** avec bandeau cookies

## 🛠️ Technologies

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
- ✅ **RGPD** - Bandeau cookies obligatoire
- ✅ **Cookies max 13 mois** (Article 82 CNIL)
- ✅ **Tracking consentement** utilisateur
- ✅ **Données locales** (localStorage + cookies)
- ✅ **Géolocalisation** avec consentement

---

## 🚀 Run Locally

**Prerequisites:** Node.js 18+ et **clé API Gemini obligatoire**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set the `GEMINI_API_KEY` in `.env`:**
   ```bash
   cp .env.example .env
   # Éditer .env et ajouter votre clé Gemini
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open:** http://localhost:3000

## 🌐 Déploiement Production

### Déploiement Vercel (Recommandé)

Consultez **`docs/VERCEL_DEPLOY.md`** pour le guide pas-à-pas complet (5 minutes).

**Résumé rapide:**
1. Se connecter sur [vercel.com](https://vercel.com) avec GitHub
2. Importer le projet `ThePhoenixAgency/Allo-meteo`
3. Ajouter la variable d'environnement `GEMINI_API_KEY`
4. Cliquer sur "Deploy" → **C'est en ligne !**

### Autres Plateformes

Consultez **`docs/DEPLOYMENT.md`** pour Netlify, Docker, etc.

---

## 🍪 Conformité RGPD

### Cookies utilisés

| Cookie | Durée | Usage |
|--------|-------|-------|
| `allo_meteo_consent` | 13 mois | Consentement cookies |
| `allo_meteo_user_token` | 13 mois | Identifiant utilisateur |

### Données locales (localStorage)

- `allo_meteo_user_profile` - Profil utilisateur (ville, IP, visites)
- `lastUserActivity` - Timestamp dernière interaction (pas d'appel API si inactif)
- `lastAIFetch` - Cache requêtes IA (30 minutes)

### Suppression données

L'utilisateur peut supprimer ses données via la console navigateur :
```javascript
localStorage.clear();
document.cookie.split(";").forEach(c => document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;");
```

---

## Changelog Récent

### 2026-01-24 - Production Ready: Gemini AI + Auto-deploy + Tests

#### Migration Gemini AI
- ✅ **Gemini obligatoire** pour météo temps réel (recherche web active)
- ✅ **GPS précis** : 7 stations de l'Oisans pré-configurées
- ✅ **Prompt structuré** : format forcé avec validation des sections requises
- ✅ **Cache 30min** : économie tokens Gemini
- ✅ **Pas d'appel API** sans interaction utilisateur

#### Tests Unitaires (19 tests - 100% ✅)
- ✅ Coordonnées GPS validées (toutes stations < 50km du Bourg d'Oisans)
- ✅ API météo : gestion erreurs 404, 500, timeout
- ✅ Tokens Gemini : cache, rate limiting 5s
- ✅ Disponibilité 24/7 sans fenêtre de maintenance

#### CI/CD Auto-Deploy
- ✅ **GitHub Actions** : build + tests automatiques
- ✅ **Auto-merge** : si tests passent (sauf Dependabot)
- ✅ **Vercel deploy** : automatique sur merge main

#### Nettoyage Code
- ❌ Supprimé package `local-ai-mcp` (non utilisé)
- 📉 **-1042 lignes** de code supprimées

### 2026-01-18 - Nettoyage & Améliorations
- Ajout timeout sur requêtes API externes
- Validation améliorée des réponses API
- Utilisation `URL()` constructor pour construction d'URLs
- Optimisation gestion d'erreurs

---

## 🗺️ Changer de Lieu

Pour adapter l'application à une autre région (ex: Chamonix, Grenoble) :

1. **Modifier les coordonnées** dans `index.tsx` (lignes 23-25) :
   ```typescript
   const LOCATION = "Votre Ville";
   const LOCATION_COORDS = { lat: 45.1234, lon: 5.6789 };
   ```

2. **Trouver les coordonnées GPS** :
   - Aller sur [Google Maps](https://www.google.com/maps)
   - Clic droit sur votre ville → "Copier les coordonnées"

3. **Modifier les stations** dans le prompt (ligne 151-157)

4. **Modifier la route** (ligne 159)

📚 **Guide détaillé:** `docs/VERCEL_DEPLOY.md` section "Changer le Lieu"

---

## 📚 Documentation

- **`docs/VERCEL_DEPLOY.md`** - Guide déploiement Vercel pas-à-pas (5 min)
- **`docs/DEPLOYMENT.md`** - Autres plateformes (Netlify, Docker, etc.)
- **`docs/PROMPT_TEST.md`** - Tests et validation prompt Gemini
- **`docs/AUTH_INTEGRATION.md`** - Intégration authentification (Clerk, Google OAuth)

---

## 🧪 Tests

```bash
npm test                # Lancer les tests unitaires
npm run test:watch      # Mode watch
npm run test:coverage   # Rapport de couverture
```

**19 tests automatiques** couvrant :
- Validation GPS (coordonnées + distances)
- Gestion erreurs API (404, 500, timeout)
- Optimisation tokens Gemini (cache, rate limiting)
- Format réponses Gemini (sections requises)
- Disponibilité 24/7

## 📦 Build & Deploy

```bash
npm run build    # Production build
npm run preview  # Test production locally
npm run validate # Lint + TypeCheck + Tests + Build
```
