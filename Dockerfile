FROM node:22-alpine AS base

FROM base AS builder

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

RUN npm install --global pnpm@latest
RUN pnpm add -g turbo concurrently dotenv dotenv-cli

WORKDIR /app

COPY . .

RUN turbo prune --scope=server --scope=web --scope=ws --docker

FROM base AS installer

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

RUN npm install --global pnpm@latest 

RUN pnpm add -g turbo concurrently nodemon dotenv dotenv-cli

WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm install

RUN pnpm turbo run build --filter=server --filter=web --filter=ws

FROM base AS runner

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

RUN npm install --global pnpm@latest

RUN pnpm add -g turbo concurrently nodemon dotenv dotenv-cli prisma

WORKDIR /app

COPY --from=installer /app .

RUN apk add --no-cache nginx

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
EXPOSE 3000
EXPOSE 5173

# CMD ["sh", "-c", "concurrently 'pnpm db:generate && pnpm db:migrate' 'cd apps/server && pnpm dev' 'cd apps/web && pnpm dev'"]

# CMD ["sh", "-c", "pnpm db:generate && pnpm db:push && pnpm db:resolve && pnpm db:deploy && nginx -g 'daemon off;' && concurrently 'cd apps/server && pnpm dev' 'cd apps/web && pnpm dev'"]

CMD ["sh", "-c", "pnpm db:generate && pnpm db:push && pnpm db:resolve && pnpm db:deploy && nginx -g 'daemon off;' & concurrently 'cd apps/server && pnpm dev' 'cd apps/web && pnpm dev'"]
