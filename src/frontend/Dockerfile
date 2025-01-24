FROM node:20 AS base
WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG base_url
ARG yandex_metrika_id

ENV BASE_URL $base_url
ENV YANDEX_METRIKA_ID $yandex_metrika_id
RUN npm run build

FROM node:20-alpine3.19 as release
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/.next ./.next

COPY --from=base /app/public ./public

ARG version
ARG build_time
ARG base_url
ARG yandex_metrika_id

ENV VERSION $version
ENV BUILD_TIME $build_time
ENV BASE_URL $base_url
ENV YANDEX_METRIKA_ID $yandex_metrika_id

EXPOSE 3000

CMD ["npm", "start"]
