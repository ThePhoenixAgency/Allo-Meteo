# 🧪 Test du Prompt Gemini

## Prompt Utilisé

Le prompt force Gemini à respecter un format structuré avec des balises spécifiques.

## Format Attendu

```
[METEO]
Température: X°C
Ciel: (ensoleillé/nuageux/pluvieux/neigeux)
Humidité: X%
Pression: XhPa
Pluie: Xmm
Neige: Xcm

[INVERSION]
(OUI ou NON)

[STATIONS]
Alpe d'Huez : X°C
Les 2 Alpes : X°C
Vaujany : X°C
Oz-en-Oisans : X°C
Saint-Christophe-en-Oisans : X°C
Villard-Reculas : X°C

[ROUTE]
État de la RD1091 (Grenoble-Oisans-Briançon): ...

[RISQUES]
Sismique: (Faible/Modéré/Élevé ou "Aucune alerte en cours")
Crues: (Vert/Jaune/Orange/Rouge ou "Aucune alerte en cours")

[EVENEMENTS]
- Événement 1
- Événement 2
- Événement 3

[LUNE]
Phase actuelle de la lune
```

## Sections Obligatoires

Le code vérifie la présence de ces sections :
- `[METEO]`
- `[STATIONS]`
- `[ROUTE]`
- `[RISQUES]`
- `[LUNE]`

Si une section manque, un warning est affiché dans la console mais l'application continue de fonctionner.

## Test Manuel

### 1. Créer un fichier `.env`

```bash
cp .env.example .env
```

Éditer `.env` et ajouter votre clé Gemini :

```
GEMINI_API_KEY=votre-clé-api-ici
```

### 2. Lancer l'application

```bash
npm run dev
```

### 3. Ouvrir la console du navigateur

Ouvrir http://localhost:3000 et ouvrir la console (F12).

### 4. Vérifier les logs

Vous devriez voir :

```
Expert text fetched. excerpt: [METEO]
Température: 5°C
Ciel: nuageux
...
```

### 5. Vérifier les sections manquantes

Si des sections manquent, vous verrez :

```
⚠️ Sections manquantes dans la réponse Gemini: ["[EVENEMENTS]"]
```

## Résultat Attendu

- ✅ Toutes les données météo affichées correctement
- ✅ Températures des stations affichées dans le tableau
- ✅ État de la route visible
- ✅ Risques sismique et crues affichés
- ✅ Phase de lune visible
- ✅ Éphéméride (Saint du jour) calculé localement

## Que Faire si le Format n'est pas Respecté ?

### Symptôme 1: Sections manquantes

**Console:**
```
⚠️ Sections manquantes dans la réponse Gemini: ["[METEO]", "[STATIONS]"]
```

**Cause:** Gemini n'a pas suivi le format structuré.

**Solution:**
1. Vérifier que la clé API Gemini est valide
2. Vérifier que le modèle `gemini-3-flash-preview` est disponible
3. Le prompt peut nécessiter un ajustement (contactez le développeur)

### Symptôme 2: Données vides

**UI:** Les cartes météo affichent "..." ou "Chargement..."

**Cause:** Gemini a répondu mais sans les balises correctes.

**Solution:** Vérifier la console pour voir la réponse brute de Gemini.

### Symptôme 3: Erreur API

**Console:**
```
❌ Erreur Gemini API: Invalid API key
```

**Solution:** Vérifier que `GEMINI_API_KEY` est bien configuré dans `.env`.

## Test du Bulletin Audio

Cliquer sur le bouton **BULLETIN** dans l'interface.

**Attendu:**
- Audio généré par Gemini TTS (voix Kore)
- Lecture du bulletin météo avec toutes les informations

**Si échec:**
- Vérifier la console pour les erreurs TTS
- Si Gemini TTS échoue, l'app essaie automatiquement un serveur TTS local (optionnel)

## Logs de Debug

Pour activer les logs détaillés, ouvrir la console et regarder :

```javascript
// Voir la réponse complète de Gemini
localStorage.setItem('debug', 'true');

// Désactiver
localStorage.removeItem('debug');
```

## Tests Automatisés

TODO: Ajouter des tests unitaires pour vérifier le parsing des sections.
