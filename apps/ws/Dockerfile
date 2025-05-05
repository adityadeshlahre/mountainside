FROM node:22-alpine AS base

FROM base AS builder
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"
# Set working directory
WORKDIR /app
RUN npm install --global pnpm@latest
RUN pnpm add -g turbo nodemon
COPY . .
RUN turbo prune --scope=ws --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

RUN npm install --global pnpm@latest 

RUN pnpm add -g turbo nodemon dotenv dotenv-cli

WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm i

RUN pnpm turbo run build --filter=ws...

FROM base AS runner

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

RUN npm install --global pnpm@latest

RUN pnpm add -g nodemon dotenv dotenv-cli

WORKDIR /app

# Don't run production as root
# RUN groupadd --system --gid 1001 nextjs
# RUN useradd --system --uid 1001 nodejs
# USER nodejs
COPY --from=installer /app .

EXPOSE 8080

CMD cd apps/ws/ && pnpm dev