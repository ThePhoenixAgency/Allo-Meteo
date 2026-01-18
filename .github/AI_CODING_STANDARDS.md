# Règles de Codage pour IA

Ce document définit les standards de code que toute IA doit respecter lors de la génération ou modification de code.

## Standards de Code

### 1. Validation des Entrées

Toute donnée externe doit être validée avant utilisation.

```javascript
// Requis
const validated = await validateInput(userInput);
const safe = ensureSafe(validated);
```

### 2. Construction d'URLs

Utiliser `URL()` constructor pour construire des URLs.

```javascript
// Requis
const fullUrl = new URL(endpoint, baseUrl).toString();
const res = await fetch(fullUrl);
```

### 3. Gestion des Erreurs

Logger les erreurs côté serveur, retourner messages génériques côté client.

```javascript
// Requis
try {
  // Code
} catch (e) {
  console.error('Error:', e);
  return { error: 'operation_failed' };
}
```

### 4. Timeouts

Ajouter timeouts sur toutes les requêtes externes (max 10s).

```javascript
// Requis
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

const res = await fetch(url, { signal: controller.signal });
clearTimeout(timeoutId);
```

### 5. Permissions GitHub Actions

Définir permissions explicites et minimales.

```yaml
# Requis
name: Workflow

permissions:
  contents: read

on:
  push:
```

## Patterns à Éviter

### Template Strings pour URLs
```javascript
// À éviter
const url = `${userInput}/endpoint`;
```

### Erreurs Détaillées
```javascript
// À éviter
catch (e) {
  return { error: e.message };
}
```

### Requêtes sans Timeout
```javascript
// À éviter
await fetch(url);
```

## Patterns Recommandés

### Construction URL
```javascript
// Recommandé
const validated = await validate(input);
const safe = ensureSafe(validated);
const url = new URL('/endpoint', safe).toString();
```

### Gestion Erreur
```javascript
// Recommandé
try {
  // Code
} catch (e) {
  console.error('Details:', e);
  return { error: 'failed' };
}
```

### Requête avec Timeout
```javascript
// Recommandé
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
} catch (e) {
  clearTimeout(timeoutId);
  throw e;
}
```

## Instructions IA

Lors de génération/modification de code :

1. Valider toutes les entrées externes
2. Utiliser `URL()` constructor
3. Ajouter timeouts sur requêtes
4. Messages d'erreur génériques
5. Permissions minimales workflows
6. Logger erreurs serveur uniquement

---

Dernière mise à jour : 2026-01-18

