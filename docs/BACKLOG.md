# Backlog centralisé

Ce fichier centralise le backlog du projet Allo‑Meteo (issues, tâches et décisions en suspens).

Généré automatiquement par l'assistant. Date: 2026-01-18

## Tâches principales

| ID | Tâche | Statut |
|----|-------|--------|
| 1  | Docs: ajouter guide d'exécution & exemple d'utilisation | completed |
| 2  | Docs: ajouter `docs/DOCKER.md` (but, commandes, checklist sécurité) | completed |
| 3  | CI: intégrer scan Docker image (Trivy) dans GitHub Actions | in-progress |
| 4  | CI: ajouter job pour builder l'image et échouer/alerter en cas de vulnérabilités critiques | not-started |
| 5  | Code: vérifier `packages/local-ai-mcp/Dockerfile` pour utiliser un utilisateur non-root et multi-stage build | not-started |
| 6  | Docs: ajouter section 'Lancer le conteneur' dans `docs/BOOTSTRAP.md` et `README.md` | completed |
| 7  | CI: ajouter job Trivy qui push un rapport comme artifact et échoue sur vulnéras critiques | not-started |
| 8  | Code: patch Dockerfile & PR (non-root, multi-stage, add HEALTHCHECK) | not-started |
| 9  | Tests: ajouter tests unitaires (vitest) pour `probe.js` et `client.js` | not-started |
| 10 | Tests: ajouter tests E2E (Playwright) pour le flux UI (fallback chain, TTS, start/stop mock) | not-started |
| 11 | UI: ajouter bouton Start/Stop mock et intégration avec `scripts/local-ai-controller.js` | not-started |
| 12 | UI: persister l'historique des métriques de performance (tokens, latences) | not-started |
| 13 | Code: finaliser `MCP-first` behavior (flag/config et UI) | not-started |
| 14 | CI: ajouter job E2E Playwright dans GitHub Actions (PR + push) | not-started |
| 15 | Release: documenter et automatiser release (npm/GHCR) — ajouter job et inputs/secret mapping | not-started |
| 16 | Security: ajouter CI check pour présence de `GEMINI_API_KEY` (decider fatal vs non-fatal) | not-started |
| 17 | Docs: documenter `local-ai-mcp` API + exemples d'appel (README + snippets) | not-started |
| 18 | Docs: ajouter guide 'lancer le mock local AI' et utiliser la controller (README/docs) | not-started |
| 19 | Packaging: envisager conversion TypeScript pour `local-ai-mcp` (optionnel) | not-started |
| 20 | CI: ajouter job pour builder, scanner et pusher l'image signée vers GHCR (avec secrets) | not-started |
| 21 | Security: configurer Dependabot/Renovate pour MAJ dépendances et PRs automatiques | not-started |
| 22 | CI: maintenir `security-audit` planifié (npm audit) et intégrer résultats de vulnérabilités à backlog | not-started |
| 23 | Tests: ajouter tests de santé & rate-limiting pour `local-ai-mcp` | not-started |
| 24 | Docs: guide d'administration (start/stop mock par IP, sécurisation/ACL) | not-started |
| 25 | Infra: ajouter manifest Helm/K8s template pour déployer `local-ai-mcp` en cluster | not-started |
| 26 | QA: ajouter smoke tests pour fallback Open-Meteo (fetch manuel) | not-started |
| 27 | Accessibility: audit a11y UI et corriger issues majeures | not-started |
| 28 | Repo: ajouter vérification du script `bootstrap.sh` (lint/simple test) aux checks pré-commit | not-started |
| 29 | CI: upload du rapport Trivy en tant qu'artifact (après scan) | not-started |
| 30 | Decision: définir si CI doit échouer si `GEMINI_API_KEY` absent (policy décision) | not-started |
| 31 | Backlog: centraliser toutes les questions en suspens dans `docs/BACKLOG.md` (liens & propriétaires) | completed |
| 32 | Docs: ajouter mode d'emploi pas-à-pas pour exécuter le projet (Windows/Linux + macOS) | not-started |
| 33 | Maintenance: ajouter étape release pour générer changelog automatique (release-drafter) | not-started |
| 34 | Security: ajouter scan SLSA / supply-chain (slsa-verifier) et signatures d'artefacts | not-started |
| 35 | CI: ajouter job pour tests statiques (pylint / eslint fix already exists) — s'assurer qu'il passe sur PRs | not-started |
| 36 | DevExp: ajouter script `dev:reset` pour remettre l'environnement local en état connu (db, cache, mocks) | not-started |
| 37 | Docs: ajouter guide sur où mettre les Secrets (GitHub Organization vs Repo, Environments) | not-started |
| 38 | UX: ajouter sélecteur de modèle persisté et documenter comment l'utiliser (UI + README) | not-started |
| 39 | Monitoring: ajouter endpoints metrics / prometheus pour `local-ai-mcp` et exporter métriques en conteneur | not-started |
| 40 | CI: ajouter job de sécurité qui exécute `npm audit` et échoue sur CVE critiques | not-started |
| 41 | Git: nettoyage des branches obsolètes (merge + suppression locale et remote) | completed |
| 42 | Security: corriger SSRF dans index.tsx ligne 562 (fetch vers ipapi.co sans validation) | not-started |
| 43 | DevOps: rendre les hooks Git exécutables (.husky/pre-commit et .husky/pre-push) | not-started |

---

Notes & décisions en suspens:
- Décider si l'absence de `GEMINI_API_KEY` doit rendre le CI fatal ou non (voir tâche 30).
- Déterminer le owner pour le Job Trivy / CI (ex: "devops@thephoenixagency"), assigner dans la première PR.
- **URGENT**: Corriger la vulnérabilité SSRF dans index.tsx (tâche 42) - requête non validée vers API externe

## Questions en suspens (consignées — l'assistant ne posera plus de questions)
- Policy: faut-il rendre le CI fatal si `GEMINI_API_KEY` est absent ? (voir tâche 30)
- Owner: qui est responsable du Job Trivy / CI ?
- Publication: décider de la politique de publication NPM/GHCR (qui a accès aux secrets)
- Priorité: prioriser le job Trivy (ID 3) ou l'audit/patch du Dockerfile (ID 5)
- **Security**: Valider la correction SSRF (tâche 42) - implémenter whitelist d'URLs ou proxy sécurisé

## Notes de l'assistant
Toutes les questions, propositions et décisions en suspens sont consignées ci-dessus.
L'assistant n'émettra plus de questions actives — il documentera toute proposition ou décision dans ce fichier et attendra des instructions via Issues/PRs ou assignations dans le backlog.

### Dernières actions (2026-01-18)
- ✅ Nettoyage Git complet : merge de 3 branches non-mergées dans main
- ✅ Suppression de 6 branches locales et 5 branches remote
- ✅ Push des changements vers origin/main (c691dae..6e0c710)
- ⚠️ Identification vulnérabilité SSRF dans index.tsx:562

_Last updated: 2026-01-18_

Si tu veux, je crée des Issues GitHub pour chaque item prioritaire et je fais une PR pour le job Trivy en premier lieu. (Me dire si tu veux que je priorise autre chose.)