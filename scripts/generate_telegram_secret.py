"""Генерирует секрет Telegram webhook для вставки в файл окружения."""

import secrets


if __name__ == "__main__":
    print(f"TELEGRAM_WEBHOOK_SECRET={secrets.token_hex(32)}")
