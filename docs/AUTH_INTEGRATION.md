Intégration d'authentification (Clerk & Google) — guide rapide

But
- Fournir des exemples commentés pour intégrer Clerk (solution d'auth frontend) et Google OAuth.
- Expliquer où mettre les secrets (local `.env` pour dev, GitHub Secrets pour CI) et quels URLs utiliser.

Principes généraux
- Ne commite jamais de secrets. Ajoute les clés dans `.env` (local dev) et dans GitHub Secrets (Settings → Secrets and variables → Actions) pour CI / release.
- Pour les variables frontend Vite, préfixe par `VITE_` (ex: `VITE_GOOGLE_CLIENT_ID`, `VITE_CLERK_FRONTEND_API`). Ces variables sont exposées au bundle client.
- Pour les secrets côté serveur (ex: `GOOGLE_CLIENT_SECRET`, `CLERK_API_KEY`), ne pas utiliser `VITE_` et ne pas committer.

Exemple .env (dev local) — sauvegarde en `.env` (ne pas committer)

# Gemini (existant)
GEMINI_API_KEY=...

# Clerk - frontend API key (Vite prefixed)
VITE_CLERK_FRONTEND_API=clerk.example.frontend.api
# Clerk - server API key (keep secret, use in server-side only)
CLERK_API_KEY=...

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
# Callback URL (configure in Google Cloud Console)
# Example local callback: http://localhost:5173/auth/google/callback


Clerk (commenté)
- Installer : `npm install @clerk/clerk-react` (frontend) et `npm install @clerk/clerk-sdk-node` (backend) si besoin.
- Frontend (React) :
  - Wrappe l'app avec `<ClerkProvider frontendApi={import.meta.env.VITE_CLERK_FRONTEND_API}>`.
  - Utilise `<SignInButton />` / `<UserButton />` selon les besoins.
- Backend : utiliser `CLERK_API_KEY` pour vérifier des sessions côté serveur.

Google OAuth (commenté)
- Création : Google Cloud Console → Credentials → OAuth 2.0 Client IDs
- Définir les Authorized Redirect URIs (ex : `http://localhost:5173/auth/google/callback` pour dev; `/auth/google/callback` en production sur ton domaine)
- Frontend : utiliser Google Identity Services (script) ou rediriger vers l'endpoint d'autorisation.
- Backend (option recommandée) : échanger le code d'autorisation (`code`) contre un token en appelant `https://oauth2.googleapis.com/token` en utilisant `GOOGLE_CLIENT_SECRET` et `GOOGLE_CLIENT_ID`. Ne pas effectuer l'échange côté client.

Où mettre les secrets ?
- Local dev : `.env` (ajouter `.env` à `.gitignore`)
- CI / GitHub Actions : ajouter `GEMINI_API_KEY`, `NPM_TOKEN`, `GHCR_TOKEN`, `GOOGLE_CLIENT_SECRET`, `CLERK_API_KEY` dans Settings → Secrets and variables → Actions
- Frontend (public) : uniquement `VITE_` variables publiques (client ID). Les secrets privés ne doivent jamais être exposés côté client.

Exemples sécurité / callback
- Pour Google, la redirect URI doit exactement correspondre à celle configurée dans Google Cloud Console.
- Pour Clerk, configure les origins autorisées dans le dashboard Clerk et fournis la `frontendApi` dans le front.

Notes supplémentaires
- Je fournis un fichier `auth-examples.tsx` dans le repo contenant ces snippets commentés pour que tu puisses les activer quand tu veux.
- Si tu veux, je peux implémenter l'intégration réelle (Clerk ou Google) derrière un flag de configuration et gérer la session utilisateur dans l'app.