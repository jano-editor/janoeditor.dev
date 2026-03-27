# Stage 1: Build
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm via npm (more reliable than corepack in CI)
RUN npm install -g pnpm@10

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build the SSR app
RUN NUXT_SESSION_PASSWORD=build-time-placeholder-min-32-chars pnpm build

# Stage 2: Production runtime
FROM node:22-bookworm-slim

WORKDIR /app

# git + esbuild needed at runtime for plugin builds
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g esbuild

# Copy built output from builder
COPY --from=builder /app/.output ./.output

# Persistent data volume for SQLite + artifacts
VOLUME /app/data

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]
