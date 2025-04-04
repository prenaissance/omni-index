FROM node:22-alpine AS base
RUN apk update && apk add libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter=backend

COPY . .
RUN pnpm --filter=backend build
RUN pnpm deploy --filter=backend --prod ./prod/backend

FROM base AS runner
COPY --from=build /app/prod/backend ./
CMD ["node", "dist/main"]
