local-ai-mcp — Micro MCP-like adapter for local LLM/TTS servers

Quick summary
- Small, zero-dependency Node.js program that probes local LLM/TTS endpoints (LM Studio or similar) and exposes a simple HTTP API for detection, text generation probes and TTS probes.
- Designed to be run on any machine (laptop, local server, Raspberry Pi), accessible from LAN via 0.0.0.0 binding.
- Contains rate-limiting to avoid hammering local models.

Quick start (local)

1. From repo:
   cd packages/local-ai-mcp
   node server.js

2. From Docker (recommended for portability):
   docker build -t local-ai-mcp:latest .
   docker run -p 8080:8080 -e BIND_HOST=0.0.0.0 -d local-ai-mcp:latest

API
- GET /health -> { ok: true, uptime }
- GET /models?host=<host-or-url> -> lists models at host (/v1/models)
- POST /text { host, prompt, model? } -> probes text endpoints and returns { text, sources, perf, endpoint }
- POST /tts { host, prompt } -> probes TTS and returns { audio, perf, endpoint }
- POST /probe { host, prompt, model? } -> runs both text and tts probes

Client helper (usage)

- Use the bundled client functions in `packages/local-ai-mcp/client.js` to call the MCP server from any app. Example:

import { callMcpText, callMcpTts } from 'packages/local-ai-mcp/client.js';

const res = await callMcpText('http://192.168.1.10:8080', 'http://192.168.1.57:6667', 'Ton prompt ici', 'qwen/qwen2.5-vl-7b:2', 'ton_secret');

- The client returns the raw JSON response from the MCP server (which includes `ok: true` and either `text` or `audio` result).

Intégration dans un autre projet VS Code (exemples)

Option A — Utilisation comme dossier local (recommandé pour développement)
1. Copier le dossier `packages/local-ai-mcp` dans votre dépôt (ou utiliser `git submodule add <repo> packages/local-ai-mcp`).
2. Depuis la racine de votre projet, ajoutez un script utile dans votre `package.json` :
   "scripts": {
     "mcp:start": "node packages/local-ai-mcp/server.js"
   }
3. Dans VS Code, créez un `launch.json` (Debug) pour lancer `server.js` et définir des variables d'env (ex : `MCP_SECRET`, `PORT`, `BIND_HOST`). Exemple :

{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Run local-ai-mcp",
      "program": "${workspaceFolder}/packages/local-ai-mcp/server.js",
      "env": { "MCP_SECRET": "votre_secret_local", "BIND_HOST": "127.0.0.1" }
    }
  ]
}

Option B — Utilisation via Docker (facile à déplacer)
1. Construire : `docker build -t local-ai-mcp:latest packages/local-ai-mcp`.
2. Lancer (ex : accès LAN restreint) :
   `docker run -p 8080:8080 -e BIND_HOST=0.0.0.0 -e MCP_SECRET=votremdp -d local-ai-mcp:latest`
3. Ajoutez un `tasks.json`/`launch.json` dans VS Code si vous souhaitez démarrer/arrêter via l'IDE.

Sécurité (sommaire)
- Lisez `SECURITY.md` pour les recommandations (exiger `MCP_SECRET`, lier à `127.0.0.1` si possible, utiliser un reverse proxy TLS/Basic Auth si exposé sur LAN, etc.).
- Le serveur accepte un en‑tête `x-mcp-secret`. Si `MCP_SECRET` n'est pas défini, le serveur fonctionne sans auth (mode développement). Pour la production, définissez `MCP_SECRET` et ne l'exposez pas publiquement.

Exemple d'appel sécurisé depuis l'application cliente :
  curl -X POST http://192.168.1.10:8080/text \
    -H 'Content-Type: application/json' -H 'x-mcp-secret: votremdp' \
    -d '{"host":"http://192.168.1.57:6667","prompt":"Test"}'

Notes complémentaires
- Ce package a un faible nombre de dépendances (aucune) pour rester simple et portable.
- Si tu veux que je publie ce package (npm) ou génère un `npm pack` pour distribution, dis‑le et je prépare ça.
Examples
curl 'http://localhost:8080/models?host=http://192.168.1.57:6667'

curl -X POST http://localhost:8080/text -H 'Content-Type: application/json' -d '{"host":"http://192.168.1.57:6667","prompt":"Test"}'

curl -X POST http://localhost:8080/tts -H 'Content-Type: application/json' -d '{"host":"http://192.168.1.57:6667","prompt":"Bonjour"}'

Notes
- Bind host defaults to 0.0.0.0 so the service is reachable from other machines on the LAN. Use BIND_HOST to restrict if necessary.
- The service is intentionally minimal (no external deps) so you can easily copy it into Dropbox or clone it on another machine and run.

Packaging

- Npm pack (create a .tgz that you can copy or publish):
  cd packages/local-ai-mcp && npm run pack
  > artefacts will be in `packages/local-ai-mcp/dist` (eg. local-ai-mcp-0.1.0.tgz)

- Docker image (portable runtime):
  cd packages/local-ai-mcp && npm run docker-build
  (or to export the image tarball): npm run docker-save
  > docker tar will be in `packages/local-ai-mcp/dist/local-ai-mcp-docker.tar`

- To install the package locally in another project (from the tarball):
  npm install /path/to/local-ai-mcp-0.1.0.tgz

- To add as a submodule and run in VS Code, see the "Intégration dans un autre projet VS Code" section above.

Publishing

- When ready, bump the version in `package.json`, run tests (if any), then publish with `npm publish` (or: `npm publish --access=public` if desired).
- Note: the package contains no external dependencies and is intended as a small, copyable tool for local networks.

