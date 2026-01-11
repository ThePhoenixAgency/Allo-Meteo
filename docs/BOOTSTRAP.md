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
- Le script est conçu pour être idempotent et prudently non-intrusif; il affiche des instructions si une intervention manuelle est requise.
- Vérifiez chaque étape si vous avez une configuration spécifique (ex: gestionnaire de paquets alternatif).