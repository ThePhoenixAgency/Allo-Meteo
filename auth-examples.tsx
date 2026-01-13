/*
  auth-examples.tsx
  - Fichier d'exemples commentés pour Clerk & Google sign-in.
  - Ces snippets sont volontairement commentés : installez les dépendances et dé-commentez pour activer.
*/

// --- Clerk (frontend) example -------------------------------------------------
// 1) Installer : npm install @clerk/clerk-react
// 2) Décommentez et adaptez :

/*
import React from 'react';
import { ClerkProvider, SignInButton, UserButton } from '@clerk/clerk-react';

const clerkFrontendApi = import.meta.env.VITE_CLERK_FRONTEND_API || '';

export const ClerkWrapExample = ({ children }: any) => {
  return (
    <ClerkProvider frontendApi={clerkFrontendApi} navigate={(to) => window.history.pushState({}, '', to)}>
      {children}
    </ClerkProvider>
  );
};

// Usage in index.tsx:
// <ClerkWrapExample>
//   <App />
// </ClerkWrapExample>

// Sign-in button example
export function ClerkButtons() {
  return (
    <div>
      <SignInButton />
      <UserButton />
    </div>
  );
}
*/

// --- Google OAuth example ----------------------------------------------------
// 1) Register OAuth client in Google Cloud Console
// 2) Set VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in env
// 3) Use an OAuth redirect flow; the exchange of the authorization code must happen on the server.

/*
// Frontend snippet: launch Google OAuth
export function GoogleSignInButton() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const redirectUri = window.location.origin + '/auth/google/callback';

  const onSignin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      '&response_type=code&scope=openid%20profile%20email&prompt=consent';
    window.location.href = authUrl;
  };

  return <button onClick={onSignin}>Se connecter avec Google</button>;
}

// Server: exchange code for tokens (example express handler - server side only)
// POST /auth/google/callback receives `code` and performs server-side POST to https://oauth2.googleapis.com/token
*/

// Note: ces exemples sont destinés comme guide; n'expose jamais GOOGLE_CLIENT_SECRET côté client.
export default {};
