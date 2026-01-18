# Build stage: install production deps (if any) and prepare artefacts
# Use ARG so the automated workflow can pin to a digest without editing the build logic.
ARG BASE_IMAGE=node:25-slim
FROM ${BASE_IMAGE} AS build
WORKDIR /app
ENV NODE_ENV=production

# copy manifests first to leverage cache
COPY package*.json ./

# install production dependencies only when a lockfile exists (keeps build idempotent)
# (no-op if there are no dependencies)
RUN if [ -f package-lock.json ]; then \
  npm ci --only=production --no-audit --no-fund; \
  fi

# copy only runtime files
COPY server.js probe.js ./

# ensure files are owned by the non-root `node` user provided by the official image
RUN chown -R node:node /app

# Runtime stage: small, up-to-date Node runtime with reduced attack surface
ARG BASE_IMAGE=node:25-slim
FROM ${BASE_IMAGE} AS runtime
WORKDIR /app
ENV NODE_ENV=production

# copy prepared artifacts from build stage
COPY --from=build --chown=node:node /app .

# run as non-root user
USER node

EXPOSE 8080
ENV PORT=8080

# lightweight healthcheck using node (works without curl/wget)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const req=http.get({host:'127.0.0.1',port:process.env.PORT||8080,path:'/health'},res=>process.exit(res.statusCode===200?0:1));req.on('error',()=>process.exit(1));" || exit 1

CMD ["node","server.js"]
