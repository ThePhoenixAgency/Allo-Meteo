# Bootstrap (macOS)

Ce fichier décrit le script `bootstrap.sh` présent à la racine du dépôt.

Objectif:
- Préparer rapidement une machine macOS pour le développement Allo‑Meteo.

Ce que fait le script (résumé):
- Installe Homebrew si nécessaire
- Installe `git`, `curl`, `jq`
- Installe `nvm` et Node 20
- Installe Docker Desktop (optionnel)
- Installe `gh` (GitHub CLI) et VS Code
- Exécute `npm ci`, et prépare `packages/local-ai-mcp` (pack build)

Usage:

```bash
chmod +x bootstrap.sh
./bootstrap.sh
```

Remarques:
- Le script est conçu pour être idempotent et prudent; il affiche des instructions si une intervention manuelle est requise.
- Vérifiez chaque étape si vous avez une configuration spécifique (ex: gestionnaire de paquets alternatif).

## Lancer le conteneur `local-ai-mcp` (exemple)

Le dépôt contient un package `packages/local-ai-mcp` qui peut être packagé et exécuté en tant qu'image Docker.

```bash
# depuis la racine du repo
docker build -f packages/local-ai-mcp/Dockerfile -t local-ai-mcp:latest packages/local-ai-mcp

docker run --rm -p 8080:8080 \
  -e MCP_SECRET="changeme" \
  --read-only \
  --cap-drop ALL \
  local-ai-mcp:latest
```

Consignes de sécurité : ne placez jamais de secrets dans l'image; utilisez les variables d'environnement (ou les secrets de votre orchestrateur). Voir `docs/DOCKER.md` pour la checklist de sécurisation et l'intégration CI.