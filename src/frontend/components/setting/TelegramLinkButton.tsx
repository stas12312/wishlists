"use client";

import { Button, Link, Modal } from "@heroui/react";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { FiExternalLink } from "react-icons/fi";

import { createTelegramLinkCode } from "@/lib/client-requests/telegram";
import { getAuthInfo } from "@/lib/client-requests/user";
import { AuthInfo } from "@/lib/models/user";

export const TelegramLinkButton = ({
  disabled,
  onLinked,
}: {
  disabled: boolean;
  onLinked: (info: AuthInfo) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const requestVersion = useRef(0);

  useEffect(
    () => () => {
      requestVersion.current++;
    },
    [],
  );

  useEffect(() => {
    if (!isOpen || !expiresAt || isLoading) return;
    const controller = new AbortController();
    let pollTimer: ReturnType<typeof setTimeout>;
    const expire = () => {
      controller.abort();
      clearTimeout(pollTimer);
      setIsExpired(true);
    };
    const expiryTimer = setTimeout(expire, Math.max(0, expiresAt - Date.now()));
    const poll = async () => {
      if (controller.signal.aborted) return;
      if (Date.now() >= expiresAt) {
        expire();
        return;
      }
      try {
        const info = await getAuthInfo(controller.signal);
        if (controller.signal.aborted) return;
        if (info.links.some((item) => item.provider === "telegram")) {
          controller.abort();
          clearTimeout(expiryTimer);
          setIsOpen(false);
          onLinked(info);
          return;
        }
      } catch {
        // Временная ошибка сети не должна прерывать ожидание привязки.
      }
      if (!controller.signal.aborted) pollTimer = setTimeout(poll, 3000);
    };
    void poll();
    return () => {
      controller.abort();
      clearTimeout(pollTimer);
      clearTimeout(expiryTimer);
    };
  }, [isOpen, expiresAt, isLoading, onLinked]);

  const changeOpen = (open: boolean) => {
    if (!open) {
      requestVersion.current++;
      setIsLoading(false);
    }
    setIsOpen(open);
  };

  const connect = async () => {
    if (isLoading) return;
    if (window.Telegram?.WebApp.initData) {
      window.location.assign("/miniapp/telegram?link=1");
      return;
    }
    setIsLoading(true);
    setError("");
    const version = ++requestVersion.current;
    const startedAt = Date.now();
    try {
      const result = await createTelegramLinkCode();
      const image = await QRCode.toDataURL(result.url, {
        margin: 2,
        width: 240,
      });
      if (version !== requestVersion.current) return;
      setLink(result.url);
      setQrCode(image);
      setExpiresAt(startedAt + result.expires_in * 1000);
      setIsExpired(false);
      setIsOpen(true);
    } catch {
      if (version !== requestVersion.current) return;
      setError("Не удалось подготовить привязку Telegram. Попробуйте ещё раз");
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Button
        fullWidth
        isDisabled={disabled}
        isPending={isLoading}
        variant="primary"
        onPress={connect}
      >
        Подключить
      </Button>
      {error && !isOpen && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <Modal.Backdrop isOpen={isOpen} onOpenChange={changeOpen}>
        <Modal.Container placement="center" size="sm">
          <Modal.Dialog>
            <Modal.Header className="items-center">
              <Modal.CloseTrigger />
              <Modal.Heading className="w-full text-center">
                Привязка Telegram
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-sm text-muted">
                  <span className="md:hidden">
                    Откройте ссылку, чтобы подключить Telegram.
                  </span>
                  <span className="hidden md:inline">
                    Отсканируйте QR-код телефоном или откройте ссылку на
                    устройстве с Telegram.
                  </span>
                </p>
                {isExpired && (
                  <p className="text-sm text-muted" role="status">
                    Срок действия ссылки истёк. Обновите её, чтобы подключить
                    Telegram.
                  </p>
                )}
                {qrCode && !isExpired && (
                  <Image
                    unoptimized
                    alt="QR-код для привязки Telegram"
                    className="hidden h-auto max-w-full rounded-xl bg-white md:block"
                    height={240}
                    src={qrCode}
                    width={240}
                  />
                )}
                <Link
                  className="gap-2 text-lg font-semibold text-accent no-underline"
                  href={link}
                  isDisabled={isExpired || isLoading}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span>Подключить по ссылке</span>
                  <Link.Icon className="size-4 opacity-100">
                    <FiExternalLink aria-hidden="true" />
                  </Link.Icon>
                </Link>
                <Button
                  className="w-full max-w-60"
                  isPending={isLoading}
                  variant="secondary"
                  onPress={connect}
                >
                  Обновить
                </Button>
                {error && (
                  <p className="text-sm text-danger" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
};
