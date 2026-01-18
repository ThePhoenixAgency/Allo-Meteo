#!/usr/bin/env bash
# sync-env-from-github.sh
# Récupère GEMINI_API_KEY depuis GitHub Secrets et met à jour .env

set -euo pipefail

echo "🔐 Synchronisation de GEMINI_API_KEY depuis GitHub Secrets..."

# Vérifier si gh CLI est installé
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) n'est pas installé."
    echo "📦 Installation via Homebrew..."
    brew install gh
fi

# Vérifier l'authentification
if ! gh auth status &> /dev/null; then
    echo "🔑 Connexion à GitHub..."
    gh auth login
fi

# Récupérer le secret (ne fonctionne que si vous avez les droits admin sur le repo)
echo "📥 Récupération de GEMINI_API_KEY..."
API_KEY=$(gh secret list --json name,updatedAt | jq -r '.[] | select(.name=="GEMINI_API_KEY") | .name')

if [ -n "$API_KEY" ]; then
    echo "✅ Secret GEMINI_API_KEY trouvé sur GitHub"
    echo ""
    echo "⚠️  Note: GitHub ne permet pas de LIRE la valeur des secrets pour des raisons de sécurité."
    echo "Vous devez copier manuellement la clé depuis votre source d'origine."
    echo ""
    echo "Alternative: Utilisez GitHub Codespaces où les secrets sont injectés automatiquement."
else
    echo "❌ Secret GEMINI_API_KEY introuvable"
fi
