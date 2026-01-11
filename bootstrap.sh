#!/usr/bin/env bash
# bootstrap.sh
# Script d'amorçage pour macOS pour préparer rapidement un poste de dev
# Usage: chmod +x bootstrap.sh && ./bootstrap.sh

set -euo pipefail
IFS=$'\n\t'

echo "--- Bootstrap Allo-Meteo — démarrage";

echo "(1/9) Vérification des outils de base (brew/git/curl/jq)";
if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew non trouvé — installation (requiert sudo)";
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)";
else
  echo "Homebrew déjà installé";
fi

echo "Installation git, jq, curl";
brew install git jq curl --quiet || true

echo "(2/9) Installer Node 20 via nvm";
if ! command -v nvm >/dev/null 2>&1; then
  brew install nvm --quiet || true
  mkdir -p "$HOME/.nvm"
  # Add nvm init to .zshrc if not present
  if ! grep -q 'NVM_DIR' "$HOME/.zshrc" 2>/dev/null; then
    printf '\nexport NVM_DIR="$HOME/.nvm"\n[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && . "/opt/homebrew/opt/nvm/nvm.sh"\n' >> "$HOME/.zshrc"
  fi
  # source for this run
  # shellcheck source=/dev/null
  . /opt/homebrew/opt/nvm/nvm.sh 2>/dev/null || true
fi
# ensure nvm is loaded
if command -v nvm >/dev/null 2>&1; then
  nvm install 20 || true
  nvm alias default 20 || true
else
  echo "nvm non disponible — installe manuellement node 20";
fi

echo "(3/9) Installer Docker Desktop (si souhaité)";
if ! command -v docker >/dev/null 2>&1; then
  echo "Installation Docker Desktop (via Homebrew cask)";
  brew install --cask docker --quiet || true
  echo "Démarre Docker Desktop via Launchpad ou 'open -a Docker'";
else
  echo "Docker déjà installé";
fi

echo "(4/9) Installer gh (GitHub CLI)";
if ! command -v gh >/dev/null 2>&1; then
  brew install gh --quiet || true
fi

echo "(5/9) Installer VS Code (UI)";
if ! command -v code >/dev/null 2>&1; then
  brew install --cask visual-studio-code --quiet || true
fi

echo "(6/9) Cloner repo et installer dépendances";
if [ ! -d "Allo-Meteo" ]; then
  git clone git@github.com:ThePhoenixAgency/Allo-Meteo.git || true
fi
cd Allo-Meteo || exit 1
npm ci || true
npm run prepare 2>/dev/null || true

echo "(7/9) Préparer local-ai-mcp (pack & docker)";
cd packages/local-ai-mcp || true
npm ci || true
npm run pack 2>/dev/null || true
cd - >/dev/null

echo "(8/9) Vérifications finales";
node -v || true
npm -v || true
git --version || true

echo "--- Bootstrap terminé. Pour démarrer l'app:";
echo "  cd Allo-Meteo && npm run dev";
echo "Pour lancer le mock local AI (tests): npm run local-ai";
echo "Pour builder et packer le micro-MCP: cd packages/local-ai-mcp && npm run pack";

echo "NOTE: Ce script tente d'être idempotent et non intrusive. Vérifie manuellement chaque étape si besoin.";
exit 0
