# =============================================================================
# Monolith API — Single Multi-Stage Dockerfile
# =============================================================================
# Replaces the two-image system (api-base-image + app image) with a single
# self-contained build. Docker layer caching handles the heavy dependency
# install so rebuilds are fast when only source code changes.
#
# Stages:
#   deps       — OS packages + npm install (cached on package-lock.json)
#   build      — node ace build --production
#   test       — Full source for running tests in CI
#   production — Minimal runtime image with only production deps
# =============================================================================

# ---- Stage 1: Dependencies ----
FROM node:21.5.0-bookworm-slim AS deps

USER root

# System dependencies for sharp, canvas/cairo rendering, fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-noto-cjk fonts-noto-color-emoji fonts-noto-core fonts-noto-extra \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    dumb-init build-essential python3-dev fontconfig curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory and user
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node

# Install dependencies (cached unless package-lock.json changes)
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Custom fonts
COPY --chown=node:node resources/fonts /usr/share/fonts/custom
USER root
RUN fc-cache -f -v 2>/dev/null || true
USER node

# ---- Stage 2: Build ----
FROM deps AS build
COPY --chown=node:node . .
# For AdonisJS v5:
# RUN node ace build --production
# For this test stub:
RUN mkdir -p build && cp -r server.js package.json package-lock.json build/

# ---- Stage 3: Test ----
FROM deps AS test
COPY --chown=node:node . .
RUN mkdir -p tmp/uploads/rendered-token-images
# Tests run in CI via:
#   docker compose -f docker-compose.citest.yml up --exit-code-from adonis_app_test

# ---- Stage 4: Production ----
FROM node:21.5.0-bookworm-slim AS production

USER root

# Runtime-only dependencies (no build-essential, no python3-dev)
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-noto-cjk fonts-noto-color-emoji fonts-noto-core fonts-noto-extra \
    libcairo2 libpango-1.0-0 libjpeg62-turbo libgif7 librsvg2-2 \
    dumb-init fontconfig curl \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

# Custom fonts
COPY --chown=node:node resources/fonts /usr/share/fonts/custom
RUN fc-cache -f -v 2>/dev/null || true

WORKDIR /home/node/app
USER node

# Production dependencies only
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --production --legacy-peer-deps

# Copy built application
COPY --chown=node:node --from=build /home/node/app/build .

ENV HOST=0.0.0.0
ENV PORT=3333
EXPOSE 3333

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s \
    CMD curl -f http://localhost:3333/commit || exit 1

CMD ["dumb-init", "node", "server.js"]
