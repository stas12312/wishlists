FROM node:20 AS base
WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine3.19 as release
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/.next ./.next

ARG version
ARG build_time
ARG base_path

ENV VERSION $version
ENV BUILD_TIME $build_time
ENV BASE_PATH $base_path

EXPOSE 3000

CMD ["npm", "start"]