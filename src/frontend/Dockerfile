FROM node:20 AS base
WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG base_url
ARG yandex_metrika_id
ARG static_url

ARG sentry_auth_token
ARG sentry_dsn
ARG ws_url

ARG build_time
ARG base_url

ENV BASE_URL $base_url
ENV NEXT_PUBLIC_BASE_URL $base_url
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID $yandex_metrika_id
ENV NEXT_PUBLIC_STATIC_URL $static_url

ENV SENTRY_AUTH_TOKEN $sentry_auth_token
ENV NEXT_PUBLIC_SENTRY_DSN $sentry_dsn
ENV NEXT_PUBLIC_WS_URL $ws_url

ENV NEXT_PUBLIC_VERSION $version
ENV NEXT_PUBLIC_BUILD_TIME $build_time

RUN npm run build

FROM node:20-alpine3.19 as release
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/.next ./.next

COPY --from=base /app/public ./public
COPY --from=base /app/next.config.js ./next.config.js

ARG version
ARG build_time
ARG base_url

ENV NEXT_PUBLIC_VERSION $version
ENV NEXT_PUBLIC_BUILD_TIME $build_time
ENV BASE_URL $base_url

EXPOSE 3000

CMD ["npm", "start"]
