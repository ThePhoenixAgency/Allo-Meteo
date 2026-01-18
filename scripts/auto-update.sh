#!/usr/bin/env bash
# Helper used by CI: update Dockerfile base digest, run npm audit fixes and commit changes.
set -euo pipefail
cd "$(dirname "$0")/.."
PKG=packages/local-ai-mcp
DOCKERFILE="$PKG/Dockerfile"
BASE=node:25-slim

echo "==> pulling ${BASE}"
docker pull ${BASE}
DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' ${BASE} | cut -d'@' -f2 || true)
if [[ -n "$DIGEST" ]]; then
  echo "==> pinning ${BASE}@${DIGEST} in ${DOCKERFILE}"
  perl -0777 -pe "s{ARG\s+BASE_IMAGE=.*}{ARG BASE_IMAGE=${BASE}@${DIGEST}}smi" -i $DOCKERFILE
fi

# npm fixes
cd $PKG
npm ci --no-audit --no-fund || true
npm audit fix --only=prod --package-lock-only || true

# commit changes (idempotent)
git config user.name "github-actions[bot]" || true
git config user.email "41898282+github-actions[bot]@users.noreply.github.com" || true

git add $DOCKERFILE package-lock.json package.json || true
if ! git diff --cached --quiet; then
  git commit -m "chore(auto): daily dependency + base-image updates" || true
  git push origin HEAD:main || true
else
  echo "No updates to commit"
fi
