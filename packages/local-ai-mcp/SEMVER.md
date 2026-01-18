Semantic Versioning (SEMVER) — local-ai-mcp

Principes (rappel)
- Version format: MAJOR.MINOR.PATCH
  - MAJOR: breaking changes
  - MINOR: new features backward compatible
  - PATCH: bug fixes

Processus recommandé pour releases
1. Bump version locally: `npm version patch|minor|major --no-git-tag-version`
2. Pack artifact (pack): `npm run pack` (generates ./dist/*.tgz)
3. Test local package by installing the tgz in another project: `npm install /path/to/local-ai-mcp-0.1.0.tgz`
4. Use the GitHub `Release` workflow to upload artifact and optionally publish to npm or GHCR.

Release automation notes
- The `release.yml` workflow accepts an optional `package_version` input to avoid tagging in git via the workflow. Set `publish_npm` and/or `publish_docker` to true to publish artifacts.
- Make sure to set secrets in the repository settings: `NPM_TOKEN` for npm, `GHCR_TOKEN` for GHCR, and keep them private.

Backporting & Changelog
- Keep a short changelog in the commit messages. For more advanced flows, consider adding `standard-version` or `semantic-release` later.