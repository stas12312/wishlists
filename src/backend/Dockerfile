FROM golang:1.26.1-trixie AS base

RUN apt update \
    && apt install -y \
    libvips \
    libvips-dev


EXPOSE 8080

# Сборка отладочной версии
FROM base AS dev
RUN go install github.com/air-verse/air@latest
RUN go install github.com/go-delve/delve/cmd/dlv@latest

EXPOSE 2345

WORKDIR /app
CMD ["air"]

# Сборка исполняемого файла
FROM base AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . ./

RUN CGO_ENABLED=1 GOOS=linux go build -o /server



# Копирование необходимых файлов в итоговую сборку
FROM debian:trixie-slim

RUN apt update \
    && apt install -y --no-install-recommends \
    ca-certificates \
    curl \
    tzdata \
    libvips42t64 \
    && rm -rf /var/lib/apt/lists/*


COPY --from=builder /server /server
COPY ./db /db
ADD /mail/template /mail/template

ENTRYPOINT ["/server"]
