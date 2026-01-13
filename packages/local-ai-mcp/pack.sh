#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p dist
echo "-> building docker image"
docker build -t local-ai-mcp:latest .

echo "-> producing npm pack"
npm pack --pack-destination dist

echo "Artifacts in: $(pwd)/dist"
ls -la dist
