FROM node:22-alpine AS base
RUN apk update && apk add libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

FROM base AS build
WORKDIR /app
ENV SKIP_ENVIRONMENT_CHECK=true
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY ./apps/frontends/omni-book/package.json ./apps/frontends/omni-book/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter=omni-book
COPY . .
RUN pnpm --filter=omni-book build
RUN pnpm deploy --filter=omni-book --prod ./prod/omni-book

FROM base
WORKDIR /app
COPY --from=build /app/prod/omni-book ./
CMD ["pnpm", "start"]