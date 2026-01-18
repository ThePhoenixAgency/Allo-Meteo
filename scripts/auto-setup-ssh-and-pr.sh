#!/usr/bin/env bash
set -euo pipefail
# Automated helper: generate SSH key, add to GitHub, switch remote to SSH,
# push branch and create PR. Reads token from ~/.config/allo_meteo/token if needed.

BRANCH=${1:-chore/auto-updates-2x-daily}
TITLE=${2:-"chore(security): harden local-ai-mcp + 2x-daily auto-update"}
BODY=${3:-"Automated PR: harden Dockerfile, CI, dependabot"}
BASE=${4:-main}

TOKEN_FILE=${GITHUB_TOKEN_FILE:-$HOME/.config/allo_meteo/token}
KEY_PATH=${KEY_PATH:-$HOME/.ssh/id_ed25519_allometeo}

if [[ ! -f "$TOKEN_FILE" ]]; then
  echo "Token file not found: $TOKEN_FILE"
  exit 1
fi

# extract token (common ghp_/gho_/ghc_/ghu_/ghr_ prefixes)
GITHUB_TOKEN=$(grep -oE 'gh[pousr]_[A-Za-z0-9_\-]+' "$TOKEN_FILE" | head -n1 || true)
if [[ -z "$GITHUB_TOKEN" ]]; then
  # fallback to first non-comment line
  GITHUB_TOKEN=$(grep -v '^\s*#' "$TOKEN_FILE" | sed -n '1p' | tr -d '\n' || true)
fi

if [[ -z "$GITHUB_TOKEN" ]]; then
  echo "No token found in $TOKEN_FILE"
  exit 1
fi

echo "Using token from $TOKEN_FILE (not shown)."

# Ensure ssh key exists (create if missing)
if [[ -f "$KEY_PATH" ]]; then
  echo "SSH key already exists at $KEY_PATH; backing up to ${KEY_PATH}.bak"
  cp "$KEY_PATH" "${KEY_PATH}.bak"
  cp "${KEY_PATH}.pub" "${KEY_PATH}.pub.bak" || true
fi

echo "Generating SSH key at $KEY_PATH"
ssh-keygen -t ed25519 -C "allo-meteo-$(whoami)@$(hostname)" -f "$KEY_PATH" -N "" >/dev/null

# Add to ssh-agent and macOS keychain if possible
eval "$(ssh-agent -s)" >/dev/null 2>&1 || true
if command -v ssh-add >/dev/null 2>&1; then
  # macOS: attempt to store in keychain
  if [[ "$(uname -s)" == "Darwin" ]]; then
    ssh-add --apple-use-keychain "$KEY_PATH" || ssh-add "$KEY_PATH" || true
  else
    ssh-add "$KEY_PATH" || true
  fi
fi

PUB=$(cat "${KEY_PATH}.pub")

# Determine repo owner/name
REPO=""
if [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
  REPO="$GITHUB_REPOSITORY"
else
  REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)
  if [[ "$REMOTE_URL" =~ ^git@github.com:([^/]+)/([^/]+)(\.git)?$ ]]; then
    REPO="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
  elif [[ "$REMOTE_URL" =~ ^https?://github.com/([^/]+)/([^/]+)(\.git)?$ ]]; then
    REPO="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
  else
    # fallback to owner from package.json if exists
    if [[ -f package.json ]]; then
      OWNER=$(node -e "console.log(require('./package.json').repository?.url || '')" 2>/dev/null || true)
    fi
    if [[ -n "$OWNER" ]]; then
      REPO="$OWNER"
    fi
  fi
fi

if [[ -z "$REPO" ]]; then
  echo "Cannot determine repo owner/name from git remote or env. Set GITHUB_REPOSITORY or run from repo." 
  exit 1
fi

echo "Adding SSH public key to GitHub account via API..."
TS=$(date -u +%Y%m%dT%H%M%SZ)
TITLE_KEY="allo-meteo-$TS"
RESP=$(curl -sS -o /tmp/gh_key_resp.json -w "%{http_code}" -X POST -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" https://api.github.com/user/keys -d "$(printf '{"title":"%s","key":"%s"}' "$TITLE_KEY" "$PUB")")
if [[ "$RESP" != "201" ]]; then
  echo "Failed to add SSH key to GitHub (HTTP $RESP). Check token scopes (need 'admin:public_key')."
  cat /tmp/gh_key_resp.json || true
  exit 1
fi

KEY_ID=$(cat /tmp/gh_key_resp.json | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('id',''))") || true
echo "SSH key added to GitHub (id=$KEY_ID)."

# Switch remote to SSH
echo "Setting git remote to SSH for repo $REPO"
git remote set-url origin "git@github.com:${REPO}.git"

echo "Pushing branch $BRANCH"
git push "origin" "HEAD:refs/heads/${BRANCH}" || { echo "git push failed"; exit 1; }

# Create PR via API
API_URL="https://api.github.com/repos/${REPO}/pulls"
PAYLOAD=$(python3 - <<PY
import json,os
print(json.dumps({
  'title': os.environ.get('TITLE','${TITLE}'),
  'body': os.environ.get('BODY','${BODY}'),
  'head': os.environ.get('BRANCH','${BRANCH}'),
  'base': os.environ.get('BASE','${BASE}')
}))
PY
)

echo "Creating PR..."
PR_RESP=$(curl -sS -o /tmp/gh_pr_resp.json -w "%{http_code}" -X POST -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" "$API_URL" -d "$PAYLOAD")
if [[ "$PR_RESP" != "201" ]]; then
  echo "Failed to create PR (HTTP $PR_RESP). Response:"; cat /tmp/gh_pr_resp.json || true
  exit 1
fi

PR_URL=$(cat /tmp/gh_pr_resp.json | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('html_url',''))") || true
echo "PR created: $PR_URL"

echo "Done. You may revoke the token or remove the SSH key if desired. Key id: $KEY_ID"
