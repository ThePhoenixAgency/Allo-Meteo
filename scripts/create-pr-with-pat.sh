#!/usr/bin/env bash
set -euo pipefail
# Usage:
# GITHUB_TOKEN=ghp_xxx ./scripts/create-pr-with-pat.sh [branch] [title] [body] [base]

BRANCH=${1:-chore/auto-updates-2x-daily}
TITLE=${2:-"chore(security): harden local-ai-mcp + 2x-daily auto-update"}
BODY=${3:-"Harden Dockerfile, require Node 25, fix runtime bugs, add 2x-daily auto-update CI + Trivy, Dependabot."}
BASE=${4:-main}

# If GITHUB_TOKEN not set, try read from a secure token file.
DEFAULT_TOKEN_FILE="$HOME/.config/allo_meteo/token"
TOKEN_FILE=${GITHUB_TOKEN_FILE:-$DEFAULT_TOKEN_FILE}

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  if [[ -f "$TOKEN_FILE" ]]; then
    # Ensure file permissions are restrictive
    PERMS=$(stat -f "%A" "$TOKEN_FILE" 2>/dev/null || stat -c "%a" "$TOKEN_FILE" 2>/dev/null || true)
    if [[ -n "$PERMS" ]]; then
      # If others have read access, refuse to use the file
      if [[ "$PERMS" =~ [07][0-9][0-9] || "$PERMS" =~ ^[0-9]{3}$ && ${PERMS:0:1} -ne 0 ]]; then
        echo "Error: token file permissions seem too permissive. Set to 600: chmod 600 $TOKEN_FILE"
        exit 1
      fi
    fi
    GITHUB_TOKEN=$(cat "$TOKEN_FILE" | tr -d '\n' )
    export GITHUB_TOKEN
  else
    echo "Error: set GITHUB_TOKEN env var (repo scope) or create a token file at $TOKEN_FILE"
    exit 1
  fi
fi

# Determine repo owner/name from env or git remote
if [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
  REPO="$GITHUB_REPOSITORY"
else
  REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)
  if [[ "$REMOTE_URL" =~ ^git@github.com:([^/]+)/([^/]+)(\.git)?$ ]]; then
    REPO="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
  elif [[ "$REMOTE_URL" =~ ^https?://github.com/([^/]+)/([^/]+)(\.git)?$ ]]; then
    REPO="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
  else
    echo "Cannot determine repo from origin remote. Set GITHUB_REPOSITORY env (owner/repo)"
    exit 1
  fi
fi

# Ensure branch exists
if ! git show-ref --verify --quiet refs/heads/${BRANCH}; then
  echo "Branch ${BRANCH} not found locally. Create or checkout it first."
  exit 1
fi

# Push branch (use token-based push if GITHUB_TOKEN is set to avoid credential prompts)
echo "Pushing branch ${BRANCH}..."
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  echo "Using GITHUB_TOKEN for authenticated push"
  # Prefer explicit actor (username) if provided in env
  # If GITHUB_ACTOR is a valid GitHub login (alphanum and hyphens), include it, else fallback to token-only URL.
  SAFE_ACTOR=""
  if [[ -n "${GITHUB_ACTOR:-}" ]] && [[ "${GITHUB_ACTOR}" =~ ^[A-Za-z0-9-]+$ ]]; then
    SAFE_ACTOR="$GITHUB_ACTOR"
  else
    # Try to use git user.name only if it matches allowed username pattern
    GIT_USER=$(git config user.name 2>/dev/null || true)
    if [[ -n "$GIT_USER" ]] && [[ "$GIT_USER" =~ ^[A-Za-z0-9-]+$ ]]; then
      SAFE_ACTOR="$GIT_USER"
    fi
  fi

  if [[ -n "$SAFE_ACTOR" ]]; then
    AUTH_URL="https://${SAFE_ACTOR}:${GITHUB_TOKEN}@github.com/${REPO}.git"
  else
    AUTH_URL="https://${GITHUB_TOKEN}@github.com/${REPO}.git"
  fi

  # Push explicitly from HEAD to remote branch to avoid ambiguity
  git push "$AUTH_URL" "HEAD:refs/heads/${BRANCH}" || {
    echo "Authenticated push failed. Falling back to remote 'origin' push..."
    git push -u origin "${BRANCH}"
  }
else
  git push -u origin "${BRANCH}"
fi

# Create PR
API_URL="https://api.github.com/repos/${REPO}/pulls"

# Build JSON payload safely. Prefer jq when available, else use python3.
export _PR_TITLE="$TITLE"
export _PR_BODY="$BODY"
export _PR_BRANCH="$BRANCH"
export _PR_BASE="$BASE"

if command -v jq >/dev/null 2>&1; then
  DATA=$(jq -n --arg title "$_PR_TITLE" --arg body "$_PR_BODY" --arg head "$_PR_BRANCH" --arg base "$_PR_BASE" '{title:$title,body:$body,head:$head,base:$base}')
else
  DATA=$(python3 - <<PY
import os, json
print(json.dumps({
  "title": os.environ.get("_PR_TITLE", ""),
  "body": os.environ.get("_PR_BODY", ""),
  "head": os.environ.get("_PR_BRANCH", ""),
  "base": os.environ.get("_PR_BASE", "")
}))
PY
)
fi

unset _PR_TITLE _PR_BODY _PR_BRANCH _PR_BASE

echo "Creating PR on ${REPO}..."
RESP=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" -d "$DATA" "$API_URL")

PR_URL=$(echo "$RESP" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('html_url',''))") || true
MESSAGE=$(echo "$RESP" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('message',''))") || true

if [[ -z "$PR_URL" ]]; then
  echo "Failed to create PR: $MESSAGE"
  echo "API response: $RESP"
  exit 1
fi

echo "PR created: $PR_URL"
