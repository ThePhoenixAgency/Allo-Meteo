Capsule documentaire — Allo‑Météo & local-ai-mcp

But & portée
- Ce dépôt contient l'application Allo‑Météo (React + Vite) et un package réutilisable `packages/local-ai-mcp` qui fournit un micro-MCP pour interroger des LLM/TTS locaux (LM Studio, etc.).
- Objectif: permettre le développement hors-ligne / en LAN et faciliter le déploiement local d'un modèle et d'un pipeline TTS.

Structure du repo (points d'entrée)
- index.tsx                          → UI principale (Allo‑Météo)
- scripts/local-ai-server.js         → mock local AI server (développement)
- scripts/local-ai-controller.js     → contrôleur start/stop status pour le mock
- packages/local-ai-mcp/
  - server.js                        → le service MCP (HTTP)
  - probe.js                         → utilitaires pour détecter et tester endpoints
  - client.js                        → helpers pour appeler le MCP depuis une app
  - Dockerfile, pack.sh, README.md, SECURITY.md → packaging & sécurité

Environnements et variables clefs
- GEMINI_API_KEY : (optionnel) clé Gemini (si tu veux l'utiliser)
- MCP_SECRET : (optionnel mais recommandé) secret pour protéger le MCP (x-mcp-secret header)
- BIND_HOST / PORT : l'address/port pour binder les services (0.0.0.0 ou 127.0.0.1 selon usage)
- CONTROLLER_PORT : port du controller start/stop (default 6789)

Auth providers (Clerk / Google)
- VITE_CLERK_FRONTEND_API : API frontend Clerk (Vite prefixed - visible côté client)
- CLERK_API_KEY : Clerk server API key (secret, server side only)
- VITE_GOOGLE_CLIENT_ID : Google OAuth Client ID (OK pour frontend public)
- GOOGLE_CLIENT_SECRET : Google OAuth client secret (keep secret, server-side)

Voir `docs/AUTH_INTEGRATION.md` pour des exemples commentés d'intégration, et `auth-examples.tsx` pour snippets prêts à être dé-commentés.
Sécurité et bonnes pratiques (résumé)
- Ne pas exposer MCP ou le contrôleur directement sur Internet.
- Ajouter reverse-proxy TLS + auth si tu dois l'exposer sur un réseau.
- Utiliser MCP_SECRET et pare-feu pour limiter l'accès.

Release & versioning
- Packaging : `packages/local-ai-mcp/pack.sh` génère `dist/local-ai-mcp-<version>.tgz`.
- CI/Release : workflows GitHub Actions pré-configurés (`.github/workflows/ci.yml`, `release.yml`).
- Semantic versioning : bump via `npm version` avant publishing; `release.yml` accepte `package_version` en entrée pour override.

Intégration rapide pour VS Code (continuer de n'importe où)
- Copier `packages/local-ai-mcp` sur ta machine (ou installer depuis le tgz).
- Lancer le MCP : `node server.js` ou via Docker.
- Dans `index.tsx`, configurer l'URL du MCP et le secret (UI fournit des champs pour ça maintenant).

Outils d'automatisation
- Husky + lint-staged : pre-commit auto-fix (eslint/prettier)
- GitHub Actions : CI build + pack artifact, scheduled npm audit, auto-fix workflow

Support
- Si tu veux que je publie le package sur npm et configure l'automatisation complète (version bump + release notes + tag), je peux préparer les secrets et le workflow (tu devras ajouter NPM_TOKEN et GHCR_TOKEN dans les Secrets GitHub).