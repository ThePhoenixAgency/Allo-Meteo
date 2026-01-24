# 🚀 Guide de Déploiement - Allo-Météo Oisans

## 📋 Prérequis

- Node.js 18+
- Clé API Google Gemini (obligatoire)
- Compte GitHub (pour secrets)

---

## 🔑 Configuration de la Clé API Gemini

### 1. Obtenir la clé Gemini

1. Aller sur [Google AI Studio](https://aistudio.google.com/apikey)
2. Créer une nouvelle clé API
3. Copier la clé (format: `AIzaSy...`)

### 2. Stocker la clé dans GitHub Secrets

#### Méthode 1: Via l'interface GitHub

1. Aller sur votre repo: `https://github.com/ThePhoenixAgency/Allo-meteo`
2. Cliquer sur **Settings** → **Secrets and variables** → **Actions**
3. Cliquer sur **New repository secret**
4. Nom: `GEMINI_API_KEY`
5. Valeur: Coller votre clé API
6. Cliquer sur **Add secret**

#### Méthode 2: Via GitHub CLI

```bash
# Installer gh CLI si nécessaire
brew install gh  # macOS
# ou
sudo apt install gh  # Linux

# Se connecter
gh auth login

# Ajouter le secret
gh secret set GEMINI_API_KEY -b "votre-clé-api-ici"
```

---

## 🌐 Déploiement sur Vercel (Recommandé)

### Installation

```bash
npm install -g vercel
```

### Déploiement

```bash
# Login
vercel login

# Déployer en production
vercel --prod

# Configurer les variables d'environnement
vercel env add GEMINI_API_KEY production
# Coller votre clé quand demandé
```

### Configuration via Dashboard Vercel

1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner votre projet `Allo-Meteo`
3. Aller dans **Settings** → **Environment Variables**
4. Ajouter:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Votre clé API
   - **Environment**: Production, Preview, Development
5. Cliquer sur **Save**

---

## 🔧 Déploiement sur Netlify

### Via CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build et deploy
npm run build
netlify deploy --prod

# Configurer les variables d'environnement
netlify env:set GEMINI_API_KEY "votre-clé-api-ici"
```

### Via Dashboard Netlify

1. Aller sur [app.netlify.com](https://app.netlify.com)
2. Créer un nouveau site depuis Git
3. Connecter votre repo GitHub
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Environment variables:
   - `GEMINI_API_KEY` = votre clé API
6. Cliquer sur **Deploy site**

---

## 🐳 Déploiement Docker (Auto-hébergement)

### Créer un Dockerfile

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build et Run

```bash
# Build l'image
docker build -t allo-meteo:latest .

# Run avec variable d'environnement
docker run -d \
  -p 3000:80 \
  -e GEMINI_API_KEY="votre-clé-api-ici" \
  --name allo-meteo \
  allo-meteo:latest
```

---

## ⚙️ Variables d'Environnement

### Production (Obligatoire)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Clé API Google Gemini | `AIzaSy...` |

### Développement Local

Créer un fichier `.env` à la racine :

```bash
cp .env.example .env
```

Éditer `.env` :

```bash
GEMINI_API_KEY=votre-clé-api-ici
```

---

## 🧪 Tester le Déploiement

### 1. Vérifier la Build Locale

```bash
npm run build
npm run preview
```

Ouvrir http://localhost:4173

### 2. Vérifier que Gemini fonctionne

Dans la console du navigateur, vous devriez voir :

```
✅ Expert text fetched. excerpt: [METEO] ...
```

**Pas** de messages d'erreur comme :

```
❌ Gemini API erreur: ...
```

### 3. Tester l'Audio

Cliquer sur le bouton **BULLETIN**. L'audio doit se lancer.

---

## 🔍 Dépannage

### Erreur: "Clé API Gemini non configurée"

**Solution**: Vérifier que `GEMINI_API_KEY` est bien définie dans les variables d'environnement du service de déploiement.

```bash
# Vercel
vercel env ls

# Netlify
netlify env:list

# Local
cat .env
```

### Erreur 403 Forbidden (Gemini)

**Causes possibles**:
- Clé API invalide
- Clé API révoquée
- Quota dépassé

**Solution**: Générer une nouvelle clé sur [Google AI Studio](https://aistudio.google.com/apikey)

### L'IA locale est toujours détectée en production

**Normal**: Le système essaie automatiquement de détecter une IA locale (localhost:1234, etc.). Si aucune n'est trouvée, il utilise Gemini uniquement.

**Vérifier les logs**:
```
ℹ️ Aucune IA locale détectée (mode Gemini uniquement)
```

---

## 📊 Monitoring

### Vérifier les Logs

#### Vercel
```bash
vercel logs
```

#### Netlify
```bash
netlify logs
```

### Métriques Gemini

Suivre l'utilisation de l'API sur [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 🔒 Sécurité

### ✅ Bonnes Pratiques

- ✅ **Jamais** commit `.env` dans Git
- ✅ Utiliser GitHub Secrets pour CI/CD
- ✅ Rotation des clés API tous les 6 mois
- ✅ Limiter les domaines autorisés dans Google Cloud Console

### ⚠️ À Ne Pas Faire

- ❌ Ne pas partager la clé API publiquement
- ❌ Ne pas hardcoder la clé dans le code
- ❌ Ne pas commit `.env` dans Git

---

## 📚 Ressources

- [Documentation Gemini API](https://ai.google.dev/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## 🆘 Support

Pour toute question ou problème :

1. Vérifier les [Issues GitHub](https://github.com/ThePhoenixAgency/Allo-meteo/issues)
2. Consulter les logs de déploiement
3. Ouvrir une nouvelle issue avec les détails de l'erreur
