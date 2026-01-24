# 🚀 Guide de Déploiement Vercel

## Méthode 1: Dashboard Vercel (Recommandé - 5 minutes)

### Étape 1: Créer un compte Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"Sign Up"**
3. Se connecter avec **GitHub**

### Étape 2: Importer le Projet

1. Une fois connecté, cliquer sur **"Add New..."** → **"Project"**
2. Autoriser Vercel à accéder à vos repos GitHub
3. Chercher et sélectionner : **`ThePhoenixAgency/Allo-meteo`**
4. Cliquer sur **"Import"**

### Étape 3: Configurer le Projet

**Framework Preset:** Vercel détecte automatiquement **Vite**

**Build Settings:**
- Build Command: `npm run build` (auto-détecté)
- Output Directory: `dist` (auto-détecté)
- Install Command: `npm install` (auto-détecté)

**Ne rien changer**, Vercel configure tout automatiquement !

### Étape 4: Ajouter la Clé API Gemini

**CRITIQUE: Sans cette clé, l'app ne fonctionnera pas !**

1. Cliquer sur **"Environment Variables"** (avant de déployer)
2. Ajouter la variable :
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Coller votre clé API Gemini (obtenue sur [Google AI Studio](https://aistudio.google.com/apikey))
   - **Environments**: Cocher **Production**, **Preview**, **Development**
3. Cliquer sur **"Add"**

### Étape 5: Déployer

1. Cliquer sur **"Deploy"**
2. Attendre 1-2 minutes (le build compile votre app)
3. ✅ **C'est en ligne !**

Vercel vous donne une URL : `https://allo-meteo.vercel.app` (ou similaire)

---

## Méthode 2: CLI Vercel (Pour développeurs)

### Installation

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

Suivre les instructions dans le navigateur.

### Déployer

```bash
# Depuis le dossier du projet
vercel

# Pour déployer en production
vercel --prod
```

### Ajouter la Clé API

```bash
vercel env add GEMINI_API_KEY production
# Coller votre clé quand demandé
```

Ensuite re-déployer :

```bash
vercel --prod
```

---

## Vérification du Déploiement

### 1. Ouvrir l'URL de production

Exemple : `https://allo-meteo.vercel.app`

### 2. Ouvrir la Console du Navigateur (F12)

**Attendu:**
```
🔍 Détection des modèles IA locaux...
ℹ️ Aucune IA locale détectée (mode Gemini uniquement)
Expert text fetched. excerpt: [METEO]
Température: X°C
...
```

**Si erreur:**
```
❌ Clé API Gemini requise. Configurez GEMINI_API_KEY dans .env
```

👉 **Solution**: Retourner sur Vercel → Projet → Settings → Environment Variables → Ajouter `GEMINI_API_KEY`

### 3. Tester le Bulletin Audio

Cliquer sur le bouton **"BULLETIN"** dans l'interface.

**Attendu:** Audio joué avec la voix de Gemini.

---

## Changer le Lieu (Oisans → Autre Région)

Pour changer de lieu, modifiez ces constantes dans `index.tsx` :

```typescript
// Lignes 23-25
const LOCATION = "Votre Ville";  // Ex: "Chamonix"
const LOCATION_COORDS = {
  lat: 45.9237,   // Latitude
  lon: 6.8694     // Longitude
};
```

### Exemple: Chamonix

```typescript
const LOCATION = "Chamonix-Mont-Blanc";
const LOCATION_COORDS = { lat: 45.9237, lon: 6.8694 };
```

### Exemple: Grenoble

```typescript
const LOCATION = "Grenoble";
const LOCATION_COORDS = { lat: 45.1885, lon: 5.7245 };
```

### Comment trouver les coordonnées ?

1. Aller sur [Google Maps](https://www.google.com/maps)
2. Chercher votre ville
3. Clic droit sur le point → **"Copier les coordonnées"**
4. Format: `45.1234, 5.6789` → `lat: 45.1234, lon: 5.6789`

### Modifier les Stations

Dans le prompt (ligne 151-157), changer les stations :

```typescript
[STATIONS]
Station 1 : X°C
Station 2 : X°C
Station 3 : X°C
```

**Exemple pour Chamonix:**

```typescript
[STATIONS]
Les Houches : X°C
Argentière : X°C
Vallorcine : X°C
Le Tour : X°C
Les Contamines : X°C
```

### Modifier la Route

Ligne 159, changer la route :

```typescript
[ROUTE]
État de la RD1234 (Votre-Ville-Destination): ...
```

**Exemple:**

```typescript
[ROUTE]
État de la N205 (Chamonix-Tunnel du Mont-Blanc): ...
```

### Re-déployer après modification

**Dashboard Vercel:**
1. Commit et push vos changements sur GitHub
2. Vercel redéploie **automatiquement** !

**CLI:**
```bash
git add -A
git commit -m "feat: changement de lieu vers Chamonix"
git push
# Vercel redéploie automatiquement
```

---

## Configuration Avancée

### Domaine Personnalisé

1. Aller sur Vercel → Projet → **Settings** → **Domains**
2. Ajouter votre domaine : `allo-meteo.fr`
3. Suivre les instructions pour configurer le DNS

### Analytics

Vercel Analytics est **gratuit** pour les projets Hobby.

1. Aller sur Vercel → Projet → **Analytics**
2. Cliquer sur **"Enable Analytics"**
3. Vous verrez les visites, performances, etc.

### Logs

Pour voir les logs en temps réel :

```bash
vercel logs https://votre-projet.vercel.app
```

Ou sur le dashboard : Projet → **Deployments** → Cliquer sur un déploiement → **"View Logs"**

---

## Troubleshooting

### Erreur: Build Failed

**Cause:** Erreur TypeScript ou dépendances manquantes

**Solution:**
```bash
# Tester le build localement
npm run build

# Si ça échoue, corriger les erreurs TypeScript
```

### Erreur: Environment Variable Not Found

**Cause:** `GEMINI_API_KEY` non configurée

**Solution:**
1. Vercel Dashboard → Projet → Settings → Environment Variables
2. Ajouter `GEMINI_API_KEY`
3. Redéployer (ou attendre le prochain commit)

### Performance lente

**Cause:** Gemini API peut être lent selon la charge

**Solution:** Le cache est déjà activé (30 minutes). Vous pouvez réduire `AUTO_REFRESH_INTERVAL_MS` dans le code.

---

## Support

Pour toute question :
- [Documentation Vercel](https://vercel.com/docs)
- [Issues GitHub](https://github.com/ThePhoenixAgency/Allo-meteo/issues)
