FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG base_url
ARG yandex_metrika_id
ARG static_url

ARG sentry_dsn
ARG ws_url
ARG sentry_conf

ARG version
ARG build_time
ARG donate_url

ENV NEXT_PUBLIC_BASE_URL $base_url
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID $yandex_metrika_id
ENV NEXT_PUBLIC_STATIC_URL $static_url

ENV NEXT_PUBLIC_SENTRY_DSN $sentry_dsn
ENV NEXT_PUBLIC_WS_URL $ws_url

ENV NEXT_PUBLIC_VERSION $version
ENV NEXT_PUBLIC_BUILD_TIME $build_time
ENV NEXT_PUBLIC_DONATE_URL $donate_url
ENV SENTRY_CONF $sentry_conf
ENV SENTRY_RELEASE $version

RUN npm run build

# Sourcemaps для загрузки в Sentry: docker build --target sourcemaps --output type=local,dest=<dir>
FROM scratch AS sourcemaps
COPY --from=base /app/.next/static ./static
COPY --from=base /app/.next/server ./server

FROM node:20-alpine AS release
WORKDIR /app

ARG sentry_conf
ENV SENTRY_CONF $sentry_conf
ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME 0.0.0.0

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

# Sourcemaps не должны попадать в образ и отдаваться браузеру
RUN find .next -name '*.map' -delete \
    && find .next/static -name '*.js' -exec sed -i 's|^//# sourceMappingURL=.*$||' {} + \
    && find .next/static -name '*.css' -exec sed -i 's|/\*# sourceMappingURL=.*\*/$||' {} +

EXPOSE 3000

CMD ["node", "server.js"]
