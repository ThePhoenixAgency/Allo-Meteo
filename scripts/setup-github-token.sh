#!/usr/bin/env bash
# setup-github-token.sh
# Guide pour configurer un GitHub Token et l'utiliser avec gh CLI

set -euo pipefail

echo "📝 Configuration GitHub Token pour gh CLI"
echo ""
echo "1️⃣  Créer un Personal Access Token:"
echo "   👉 https://github.com/settings/tokens?type=beta"
echo ""
echo "2️⃣  Permissions requises:"
echo "   - Repository access: Sélectionner ce repo (Allo-Meteo)"
echo "   - Repository permissions:"
echo "     • Secrets: Read-only (pour lire GEMINI_API_KEY)"
echo "     • Contents: Read-only"
echo ""
echo "3️⃣  Ajouter le token dans .env:"
echo '   GITHUB_TOKEN=github_pat_XXXXXXXXXXXX'
echo ""
echo "4️⃣  gh CLI l'utilisera automatiquement via GH_TOKEN"
echo ""

# Vérifier si le token existe dans .env
if [ -f .env ] && grep -q "^GITHUB_TOKEN=" .env; then
    echo "✅ GITHUB_TOKEN trouvé dans .env"
    
    # Charger le token
    source <(grep "^GITHUB_TOKEN=" .env)
    export GH_TOKEN="$GITHUB_TOKEN"
    
    # Tester gh CLI
    if command -v gh &> /dev/null; then
        echo "🧪 Test de connexion..."
        if gh auth status 2>&1 | grep -q "Logged in"; then
            echo "✅ gh CLI authentifié avec succès!"
            echo ""
            echo "🔍 Vérification des secrets disponibles:"
            gh secret list || echo "⚠️  Pas d'accès aux secrets (permissions insuffisantes)"
        else
            echo "⚠️  Token non valide ou permissions insuffisantes"
        fi
    else
        echo "⚠️  gh CLI non installé. Installez-le avec: brew install gh"
    fi
else
    echo "⚠️  GITHUB_TOKEN non trouvé dans .env"
    echo "   Ajoutez-le après l'avoir créé sur GitHub"
fi
