#!/usr/bin/env bash
set -euo pipefail
# Wrapper to run scripts/create-pr-with-pat.sh non-interactively
# Usage: GITHUB_TOKEN=ghp_xxx [GITHUB_ACTOR=yourlogin] ./scripts/run-create-pr.sh [branch]

BRANCH=${1:-chore/auto-updates-2x-daily}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# If not set, try read token from token file (keeps it out of shell history)
DEFAULT_TOKEN_FILE="$HOME/.config/allo_meteo/token"
TOKEN_FILE=${GITHUB_TOKEN_FILE:-$DEFAULT_TOKEN_FILE}
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  if [[ -f "$TOKEN_FILE" ]]; then
    # Ensure restrictive permissions; if not, try to fix them automatically.
    chmod 600 "$TOKEN_FILE" 2>/dev/null || true
    PERMS=$(stat -f "%A" "$TOKEN_FILE" 2>/dev/null || stat -c "%a" "$TOKEN_FILE" 2>/dev/null || true)
    if [[ -n "$PERMS" ]]; then
      # On most systems 600 or 600-like perms are acceptable; skip complicated checks.
      :
    fi
    # Prefer extracting a token-like string (supports files with comments). Match common GH token prefixes.
    TOKEN_EXTRACT=$(grep -oE 'gh[pousr]_[A-Za-z0-9_\-]+' "$TOKEN_FILE" | head -n1 || true)
    if [[ -n "$TOKEN_EXTRACT" ]]; then
      export GITHUB_TOKEN="$TOKEN_EXTRACT"
      echo "Loaded GITHUB_TOKEN from $TOKEN_FILE (extracted token)"
    else
      # Fallback: first non-empty, non-comment line
      TOKEN_LINE=$(grep -v '^\s*#' "$TOKEN_FILE" | sed -n '1p' | tr -d '\n' || true)
      if [[ -n "$TOKEN_LINE" ]]; then
        export GITHUB_TOKEN="$TOKEN_LINE"
        echo "Loaded GITHUB_TOKEN from $TOKEN_FILE (first non-comment line)"
      else
        echo "Error: no token found in $TOKEN_FILE"
        exit 1
      fi
    fi
  else
    echo "Error: GITHUB_TOKEN not set and token file $TOKEN_FILE not found."
    exit 1
  fi
fi

# Ensure the helper script is executable
if [[ ! -x "$SCRIPT_DIR/create-pr-with-pat.sh" ]]; then
  chmod +x "$SCRIPT_DIR/create-pr-with-pat.sh" || true
fi

# Provide a sensible GITHUB_ACTOR fallback
if [[ -z "${GITHUB_ACTOR:-}" ]]; then
  GIT_USER=$(git config user.name || true)
  if [[ -n "$GIT_USER" ]]; then
    export GITHUB_ACTOR="$GIT_USER"
  fi
fi

echo "Running create-pr-with-pat.sh for branch: $BRANCH (actor: ${GITHUB_ACTOR:-<unset>})"
"$SCRIPT_DIR/create-pr-with-pat.sh" "$BRANCH"
EXIT_CODE=$?

if [[ $EXIT_CODE -ne 0 ]]; then
  echo "create-pr-with-pat.sh exited with code $EXIT_CODE"
  exit $EXIT_CODE
fi

echo "Wrapper finished successfully. Remember to unset GITHUB_TOKEN when done: 'unset GITHUB_TOKEN'"
