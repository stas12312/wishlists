FROM golang:1.23 as base

RUN apt update \
    && apt install -y \
    libvips \
    libvips-dev


EXPOSE 8080

# Сборка отладочной версии
FROM base as dev
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
FROM debian:latest

RUN apt update \
    && apt install -y \
    ca-certificates \
    curl \
    tzdata \
    libvips \
    libvips-dev \
    && update-ca-certificates


COPY --from=builder /server /server
COPY ./db /db
ADD /mail/template /mail/template

ENTRYPOINT ["/server"]
