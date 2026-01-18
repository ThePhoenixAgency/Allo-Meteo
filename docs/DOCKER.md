# Docker — But, exécution et checklist de sécurisation

## À quoi sert l'image Docker "local-ai-mcp" ?

- Fournir un environnement reproductible pour exécuter le **micro‑MCP** (`local-ai-mcp`) qui expose une API locale compatible pour text/tts et probe.
- Permettre d'exécuter le serveur local de manière isolée (utilisation en DEV, CI ou sur un serveur LAN pour tester des LMs locaux).
- Faciliter la distribution (image Docker) en CI/CD pour tests automatiques (scans, builds) et un déploiement contrôlé.

## Comment builder et exécuter l'image (exemples)

Build locale depuis la racine du repo :

```bash
# depuis le repo root
docker build -f packages/local-ai-mcp/Dockerfile -t local-ai-mcp:latest packages/local-ai-mcp

# run (expose le port 8080 par défaut)
docker run --rm -p 8080:8080 \
  -e MCP_SECRET="changeme" \
  --read-only \
  --cap-drop ALL \
  local-ai-mcp:latest
```

Notes:
- Ne mettez JAMAIS de secrets (clefs API, tokens) directement dans l'image ou Dockerfile. Utilisez des variables d'environnement (ou des secrets via votre orchestrateur) et stockez-les dans GitHub Secrets / Vault.
- Pour le développement sur une machine locale, vous pouvez binder sur 0.0.0.0 et ajuster -p 6667:8080 si vous utilisez un mappage de ports non standard.

## Checklist de sécurisation Docker (essentiel)

1. Scanner l'image pour vulnérabilités
   - Utilisez Trivy (ou autre scanner) : `trivy image local-ai-mcp:latest`.
   - Automatiser le scan dans CI et fail/alerter sur vulnérabilités critiques.

2. Choisir une base image minimale et maintenue
   - Préférer `node:20-alpine` (ou équivalent) et pinner la version exacte si possible.
   - Mettre à jour les dépendances et rebuild régulièrement.

3. Multi-stage build & artefacts minimaux
   - Construire l'application dans une étape puis copier uniquement les artefacts nécessaires dans l'image finale.

4. Exécuter en tant qu'utilisateur non-root
   - Ajouter `USER nobody` (ou un utilisateur dédié) dans Dockerfile final.

5. Réduire les capacités et rendre le FS en lecture seule
   - `--cap-drop ALL`, `--read-only` à l'exécution; si besoin, monter des volumes spécifiques en RW.

6. Santé & limites
   - Ajoutez un `HEALTHCHECK` dans Dockerfile et des limites CPU/mémoire (via orchestrateur ou `docker run` flags).

7. Scanning d'images signées & registre privé
   - Utiliser une registry avec contrôle d'accès et signer les images (ex: Docker Content Trust, Notary) pour confiance supply chain.

8. Secrets & configuration
   - Ne pas stocker de clefs dans le code ou image. Utiliser GitHub Secrets, Hashicorp Vault, ou les secrets Kubernetes.

9. Logs & monitoring
   - Rediriger logs vers stdout/stderr (comportement Docker standard) et centraliser via un tool de monitoring.

10. Limiter l'exposition réseau
   - N'exposez pas de ports non nécessaires, utilisez des règles de firewall ou des policies réseau dans l'orchestrateur.

## Automatisation recommandée (CI)

- Ajouter un job GitHub Action qui :
  1. Build l'image (`docker build` ou `docker buildx`),
  2. Exécute Trivy (`aquasecurity/trivy-action`) et fail/alerte sur vulns critiques,
  3. Pusher l'image vers la registry privée (GHCR/Docker Hub) si OK.

## Commandes utiles

- Scanner local :
  ```bash
  brew install trivy # mac
  trivy image local-ai-mcp:latest
  ```

- Exemple d'exécution sécurisée minimale (dev):
  ```bash
  docker run --rm -p 8080:8080 -e MCP_SECRET="$(gpg -dq secret.gpg)" --read-only --cap-drop ALL local-ai-mcp:latest
  ```

---

### ✅ Changements appliqués (patch rapide)
- Dockerfile : multi-stage build, `NODE_ENV=production`, exécution en utilisateur non-root (`node`), copie minimale des artefacts. Le Dockerfile utilise maintenant `ARG BASE_IMAGE=node:25-slim` pour faciliter le pinning automatique.
- `.dockerignore` : contexte de build réduit pour éviter de pousser des fichiers inutiles.
- `package.json` : script `docker-build:secure` pour builder l'image durcie (`local-ai-mcp:secure`).
- CI automatisée : workflow quotidien qui pinne la base (digest), exécute `npm audit fix` (prod), lance Trivy et commite automatiquement les corrections non risquées.

### 🔍 Vérifier localement (suggestions)
1. Builder l'image sécurisée :
```bash
npm run docker-build:secure
# ou (build arg support) :
docker build --build-arg BASE_IMAGE=node:25-slim -f packages/local-ai-mcp/Dockerfile -t local-ai-mcp:secure packages/local-ai-mcp
```
2. Scanner l'image (Trivy recommandé) :
```bash
# installer Trivy (macOS): brew install trivy
trivy image local-ai-mcp:secure
```
3. Analyse de runtime / quick smoke-test :
```bash
docker run --rm -p 8080:8080 --read-only --cap-drop ALL -e MCP_SECRET="changeme" local-ai-mcp:secure
# puis vérifier /health
curl -f http://localhost:8080/health
```

### 🔁 Automatisation (ce que j'ai ajouté)
- Job GitHub Actions `Auto update deps & base image` (daily):
  - tente `npm audit fix --only=prod` et commit les corrections auto si sûres;
  - récupère le digest de `node:25-slim` et pinne `ARG BASE_IMAGE` dans le `Dockerfile` (commit automatique);
  - reconstruit l'image et lance un scan Trivy (échec en cas de vulnérabilités CRITICAL);
  - crée automatiquement une issue si des vulnérabilités critiques non-fixables sont détectées.
- Dependabot activé pour `npm` et `docker` (daily). Le job CI exécute les mises à jour deux fois par jour (auto‑commit silencieux).

### ⚙️ Comment désactiver / ajuster le comportement
- Pour empêcher le commit automatique : retire les permissions `contents: write` ou modifie le job pour créer une PR au lieu d'un push direct.
- Pour changer la fréquence : édite `.github/workflows/auto-update-deps-and-baseimage.yml` (cron).

---

Si tu veux que je :
- [A] ouvre la PR contenant toutes ces modifications + message de changelog, ou
- [B] active un comportement "PR only" (au lieu de push direct) pour revue humaine, dis‑le et je prépare la PR correspondante.
