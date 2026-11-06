"use client";

import { Button, Link, LinkIcon, Spinner, Surface } from "@heroui/react";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { BsStars } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";

import {
  TelegramAccountCard,
  TelegramLinkConfirmation,
} from "./TelegramLinkConfirmation";
import { TelegramLinkConflict } from "./TelegramLinkConflict";

import { TelegramStore } from "@/store/telegramStore";

function getLinkPreview() {
  if (process.env.NODE_ENV !== "development") return null;
  const preview = new URLSearchParams(window.location.search).get("preview");
  if (
    preview === "link-loading" ||
    preview === "link-linked" ||
    preview === "link-conflict"
  )
    return preview;
  return null;
}

const returnTo = encodeURIComponent("/miniapp/telegram?link=1");

const TelegramEntry = observer(function TelegramEntry({
  linkMode,
  sessionUserId,
}: {
  linkMode: boolean;
  sessionUserId?: number;
}) {
  const [store] = useState(() => new TelegramStore());
  const router = useRouter();
  const isCreatingAccount = store.status === "choice" && store.busy;

  useEffect(() => {
    const preview = getLinkPreview();
    if (preview) {
      const timer = window.setTimeout(
        () =>
          runInAction(() => {
            if (preview === "link-conflict") {
              store.fail("Этот Telegram уже связан с другим аккаунтом");
              return;
            }
            store.accountName = "Тестовый профиль";
            store.accountEmail = "preview@example.test";
            store.status = preview === "link-linked" ? "done" : "link";
          }),
        2500,
      );
      return () => window.clearTimeout(timer);
    }
    const timeout = window.setTimeout(
      () => store.failIfWaitingForScript(),
      15000,
    );

    return () => window.clearTimeout(timeout);
  }, [store]);

  useEffect(() => {
    if (store.status === "done") {
      router.replace("/");
    }
  }, [router, store.status]);

  return (
    <main className="flex min-h-dvh items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        onError={() => {
          if (!getLinkPreview()) store.failIfWaitingForScript();
        }}
        onReady={() => {
          if (!getLinkPreview())
            void store.initialize(linkMode, sessionUserId, () =>
              router.replace("/"),
            );
        }}
      />
      <Surface className="relative flex w-full max-w-md flex-col gap-5 rounded-3xl p-6 text-center shadow-md">
        {isCreatingAccount && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-surface"
            role="status"
          >
            <Spinner aria-label="Создаём ваш аккаунт…" />
            <p>Создаём ваш аккаунт…</p>
          </div>
        )}
        <div
          aria-hidden={isCreatingAccount}
          className="contents"
          inert={isCreatingAccount}
        >
          <div>
            <p className="mb-2 flex flex-wrap items-center justify-center gap-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <BsStars
                  aria-hidden="true"
                  className="size-4 text-yellow-400"
                />
                MyWishlists
              </span>
              <span>в</span>
              <span className="inline-flex items-center gap-1.5">
                <FaTelegramPlane
                  aria-hidden="true"
                  className="size-4 text-[#229ED9]"
                />
                Telegram
              </span>
            </p>
            <h1 className="text-2xl font-semibold">
              Ваши желания всегда рядом
            </h1>
          </div>
          {(store.status === "loading" || store.status === "done") && (
            <div className="flex flex-col items-center gap-3" role="status">
              <Spinner aria-label="Вход в приложение" />
              <p>Открываем ваши вишлисты…</p>
            </div>
          )}
          {store.status === "outside" && (
            <p>
              Откройте мини-приложение через Telegram, чтобы связать аккаунт.
            </p>
          )}
          {store.status === "choice" && (
            <>
              <p>
                Войдите в существующий аккаунт или создайте новый, чтобы связать
                его с Telegram.
              </p>
              <p>
                Создавая аккаунт, вы соглашаетесь с{" "}
                <Link
                  className="text-accent no-underline"
                  href={`${process.env.NEXT_PUBLIC_STATIC_URL}/docs/terms-of-service.pdf`}
                >
                  пользовательским соглашением
                  <LinkIcon />
                </Link>
              </p>
              <Button
                fullWidth
                isDisabled={store.busy}
                onPress={() => router.push(`/auth/login?ret=${returnTo}`)}
              >
                Войти в существующий аккаунт
              </Button>
              <Button
                fullWidth
                isDisabled={store.busy}
                variant="secondary"
                onPress={() => void store.register()}
              >
                Создать аккаунт
              </Button>
            </>
          )}
          <TelegramLinkConflict store={store} />
          <TelegramLinkConfirmation store={store} />
          {store.status === "error" && (
            <>
              {store.isLinkConflict && store.accountName && (
                <TelegramAccountCard store={store} />
              )}
              <p className="text-danger" role="alert">
                {store.error}
              </p>
              <Button
                fullWidth
                variant="secondary"
                onPress={() => {
                  if (store.isLinkConflict) {
                    router.push("/settings");
                  } else if (store.isLinkExpired) {
                    if (window.Telegram?.WebApp) {
                      window.Telegram.WebApp.close();
                    } else {
                      router.replace("/");
                    }
                  } else {
                    window.location.reload();
                  }
                }}
              >
                {store.isLinkConflict
                  ? "Перейти в настройки"
                  : store.isLinkExpired
                    ? "Закрыть"
                    : "Попробовать ещё раз"}
              </Button>
            </>
          )}
        </div>
      </Surface>
    </main>
  );
});

export default TelegramEntry;
