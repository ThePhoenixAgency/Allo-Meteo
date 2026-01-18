## Mode d'emploi (macOS)

### 1. Prérequis système
- Installer [Node.js 20.x.x](https://nodejs.org/en/download/) (LTS). Vérifier avec `node -v` et `npm -v` (la v20 est compatible avec Apple Silicon et Intel).
- Ton Mac M3 Ultra est une puce Apple Silicon 100% native : il suffit d’installer les versions ARM de Node.js et de LM Studio (elles sont proposées sur les sites officiels). Rosetta est inutile ici, donc tu peux ignorer toute mention de traduction Intel→ARM. 
- Installer [LM Studio](https://lmsys.org/LMStudio/) ou un autre modèle local et s'assurer qu'il expose une API HTTP sur `http://localhost:6666`. Tu as déjà un modèle chargé sur le port 6666, parfait.

### 2. Cloner et préparer le projet
```bash
git clone https://github.com/ThePhoenixAgency/Allo-Meteo.git
cd Allo-Meteo
npm install
```

### 3. Configuration des clés API
- Copier `.env` si besoin et modifier :
  ```bash
  cp .env .env.local
  open -t .env.local
  ```
- Remplir `GEMINI_API_KEY=...` avec la clé Gemini (optionnel si tu utilises uniquement le fallback local).
- Le flag `process.env.API_KEY` est utilisé par l'app ; si la clé est absente, le fallback local via `http://localhost:6666` est déclenché automatiquement.

### 4. Démarrer LM Studio (ou autre moteur local)
1. Lancer LM Studio en mode API :
1. Lancer l'interface LM Studio depuis le Finder ou Spotlight (`open -a "LM Studio"`).
  - Dans l'application, ouvre les paramètres (gear) → active le switch “Serveur API” ou “Start API Server”.
  - La console de l'app doit afficher `Listening on http://localhost:6666` (ce n’est pas une page HTML, c’est un endpoint JSON).
  - Si tu préfères démarrer depuis le terminal et que l’app n’est pas déjà ouverte, exécute :
    ```bash
    "/Applications/LM Studio.app/Contents/MacOS/LM Studio" --api
    ```
    (ou adapte le chemin si tu as déplacé l’app). Le binaire s’appelle `LM Studio` (avec un espace), c’est pour ça que `lmstudio` n’existe pas.
2. Charger un modèle compatible (ex. `mistral-v0.1`, `wizard-13B` ou similaire).
3. Vérifier que l'API écoute bien sur `http://localhost:6666` (la page HTML ne s’affiche pas, c’est une API REST qui répond du JSON).

### 5. Tester la connexion locale
- Le dépôt inclut `scripts/test-local-ai.js`. Pour vérifier que ton serveur répond :
  ```bash
  node scripts/test-local-ai.js
  ```
- Si le serveur renvoie un texte, tu verras l'extrait et le test passe.

### 5.1. Lancer le serveur de fallback local (mock)
Si tu n'as pas encore ton LM Studio prêt, tu peux démarrer un mock qui simule `/generate` et `/tts` sur le port **6667** :
```bash
npm run local-ai
```
Le script `scripts/local-ai-server.js` répond toujours avec un texte contenant les balises `[METEO]`, `[STATIONS]`, `[RISQUES]`, etc. et une pseudo-piste audio (base64). Utile pour reprendre l’UI même sans LLM.

### 5.2. Détection automatique de port
Le client teste automatiquement les adresses suivantes : `http://localhost:6666` et `http://localhost:6667`. Si ton LM Studio écoute sur un autre port, tu peux :
- lancer le mock (ci‑dessus) pour travailler immédiatement ; ou
- me dire le nouveau port (ou modifier `LOCAL_AI_BASE_URLS` dans `index.tsx`) et je l’ajouterai dans la liste de détection.


### 6. Lancer l'application
```bash
npm run dev
```
- L'interface démarre sur http://localhost:3000/.
- Si `GEMINI_API_KEY` est défini, l'IA cible Gemini ; sinon elle bascule automatiquement vers `localhost:6666` pour le texte et `/tts` pour l’audio.

### 7. Scénario audio
- Le bouton `BULLETIN` génère un prompt en Français. Si l'audio est fourni par Gemini, la réponse TTS est directement décodée. Sinon, ton serveur local doit exposer `POST /tts` retournant `{ "audio": "<base64>" }`.
- Exemple de payload :
  ```json
  {
    "prompt": "Texte Allo-Météo..."
  }
  ```

### 8. Compilation & production
- Pour compiler : `npm run build`.
- Pour prévisualiser la build : `npm run preview`.

### 9. Conseils pratiques
- Les fichiers `index.css` et `index.html` ont été ajoutés/configurés pour charger Tailwind en CDN et appliquer des styles globaux.
- Pour des tests automatisés, tu peux ajouter un script npm qui exécute `node scripts/test-local-ai.js` avant `npm run dev`.
- Pour la production, évite de committer `.env` réel. `.env.local` peut rester hors git et tu peux charger les secrets via `direnv` ou `launchctl`.

### 10. Résolution des problèmes fréquents
- **Pas de réponse du serveur local** : vérifier que LM Studio est bien lancé et que le port 6666 n'est pas bloqué (`lsof -i :6666`).
- **Erreur Gemini** : valider que la clé est valide et ne dépasse pas les quotas de ton projet Google Cloud.
- **Audio cassé** : confirmer que la réponse JSON contient une propriété `audio` base64 décodable.

En cas de doute, relance `npm run dev` après avoir nettoyé `node_modules` (`rm -rf node_modules package-lock.json` puis `npm install`).