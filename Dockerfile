# Stage 1: Build
FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 make g++ git \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN NUXT_SESSION_PASSWORD=build-time-placeholder-min-32-chars pnpm build

# Stage 2: Production
FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g esbuild

COPY --from=builder /app/.output ./.output

VOLUME /app/data
EXPOSE 3000

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]
