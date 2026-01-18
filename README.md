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
- 🤖 **IA générative** (Google Gemini 2.5 Flash + LM Studio local)
- 🗣️ **Synthèse vocale** des bulletins météo
- 🏔️ **Prévisions stations** (Alpe d'Huez, Les 2 Alpes, Vaujany...)
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
- **Google Gemini AI 2.5 Flash** - Analyse météo intelligente
- **LM Studio** - Fallback IA local (OpenAI-compatible)
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

Consultez `docs/BOOTSTRAP.md` pour le script d'amorçage macOS et `docs/DOCKER.md` pour l'utilisation / sécurité du conteneur `local-ai-mcp`.

**Prerequisites:** Node.js 18+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set the `GEMINI_API_KEY` in `.env`:**
   ```bash
   echo "GEMINI_API_KEY=your_key_here" > .env
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open:** http://localhost:3000

---

## 🍪 Conformité RGPD

### Cookies utilisés

| Cookie | Durée | Usage |
|--------|-------|-------|
| `allo_meteo_consent` | 13 mois | Consentement cookies |
| `allo_meteo_user_token` | 13 mois | Identifiant utilisateur |

### Données locales (localStorage)

- `allo_meteo_user_profile` - Profil utilisateur (ville, IP, visites)
- `allo_meteo_model` - Modèle IA sélectionné
- `lastUserActivity` - Timestamp dernière interaction
- `lastAIFetch` - Cache requêtes IA

### Suppression données

L'utilisateur peut supprimer ses données via la console navigateur :
```javascript
localStorage.clear();
document.cookie.split(";").forEach(c => document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;");
```

---

## Changelog Récent

### 2026-01-18 - Nettoyage & Améliorations

#### Netoyage et Améliorations du Code
- Ajout timeout sur requêtes API externes
- Validation améliorée des réponses API
- Utilisation `URL()` constructor pour construction d'URLs
- Optimisation gestion d'erreurs
- Nettoyage code (suppression duplications)

---

## Build & Deploy

```bash
npm run build  # Production build
npm run preview  # Test production locally
```
