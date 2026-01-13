Sécurité — local-ai-mcp

But : donner des conseils concrets pour exécuter ce service de manière sûre sur un réseau local ou dans Docker.

1) Principe de base
- Par défaut, le service écoute sur 0.0.0.0. Ne l'exposez pas sur Internet sans protection additionnelle.
- Exigez une authentification si vous l'exposez au réseau local (voir MCP_SECRET).
- Restreignez par firewall (macOS : pf, ufw sur Linux) ou en liant à 127.0.0.1 si vous n'avez pas besoin d'accès LAN.

2) Utilisation d'une clé secrète simple (recommandé pour usage LAN)
- Défini par la variable d'environnement MCP_SECRET.
- Le serveur vérifie l'en‑tête HTTP `x-mcp-secret` pour les appels POST (`/text`, `/tts`, `/probe`). Si la valeur ne correspond pas, la requête reçoit HTTP 401.
- Exemple (curl):
  curl -X POST http://192.168.1.10:8080/text -H "x-mcp-secret: votremotdepasse" -H 'Content-Type: application/json' -d '{"host":"http://192.168.1.57:6667","prompt":"Test"}'

3) Meilleures pratiques
- Préférez exécuter derrière un reverse proxy (nginx, Caddy) qui gère TLS et auth (Basic auth / JWT) si vous devez exposer le service.
- N'exécutez PAS ce service en tant que root.
- Activez un firewall et n'autorisez que les IPs de confiance.
- Sur Docker, mappez seulement le port nécessaire et utilisez des réseaux Docker privés si possible.
- Limitez la taille des requêtes côté client et surveillez les logs.

4) Conseils pour VS Code / développement
- Ne commitez pas vos secrets en clair (ajoutez `MCP_SECRET` dans `.env` et dans `.gitignore`).
- Utilisez des configs `launch.json` pour lancer en mode debug avec des variables d'environnement locales.

5) Responsabilité
- Ce projet fournit une protection minimale (secret simple + rate‑limit). Pour une mise en production, ajoutez TLS, auth forte, journaux et surveillance intrusion.
