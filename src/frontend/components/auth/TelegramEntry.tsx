"use client";

import { Button, Link, LinkIcon, Spinner, Surface } from "@heroui/react";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { BsStars } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";

import {
  TelegramAccountCard,
  TelegramLinkConfirmation,
} from "./TelegramLinkConfirmation";
import { TelegramLinkConflict } from "./TelegramLinkConflict";

import { TelegramScriptContext } from "@/providers/TelegramProvider";
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

const TelegramEntry = observer(function TelegramEntry({
  linkMode,
  returnPath,
  sessionUserId,
}: {
  linkMode: boolean;
  returnPath: string;
  sessionUserId?: number;
}) {
  const [store] = useState(() => new TelegramStore());
  const router = useRouter();
  const scriptStatus = useContext(TelegramScriptContext);
  const isCreatingAccount = store.status === "choice" && store.busy;
  const isOpening = store.status === "loading" || store.status === "done";

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
      router.replace(returnPath);
    }
  }, [returnPath, router, store.status]);

  useEffect(() => {
    if (getLinkPreview()) return;
    if (scriptStatus === "error") store.failIfWaitingForScript();
    if (scriptStatus === "ready") {
      void store.initialize(linkMode, sessionUserId, () =>
        router.replace(returnPath),
      );
    }
  }, [linkMode, returnPath, router, scriptStatus, sessionUserId, store]);

  return (
    <main className="flex min-h-[calc(100dvh-var(--telegram-top-inset))] items-center justify-center p-4 pt-[max(1rem,calc(env(safe-area-inset-top)-var(--telegram-top-inset)))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      {isOpening ? (
        <Spinner aria-label="Вход в приложение" />
      ) : (
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
            {store.status === "outside" && (
              <p>
                Откройте мини-приложение через Telegram, чтобы связать аккаунт.
              </p>
            )}
            {store.status === "choice" && (
              <>
                <p>
                  Войдите в существующий аккаунт или создайте новый, чтобы
                  связать его с Telegram.
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
                  onPress={() => {
                    const params = new URLSearchParams({ link: "1" });
                    if (returnPath !== "/") params.set("ret", returnPath);
                    const returnTo = `/miniapp/telegram?${params}`;
                    router.push(
                      `/auth/login?ret=${encodeURIComponent(returnTo)}`,
                    );
                  }}
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
            <TelegramLinkConflict returnPath={returnPath} store={store} />
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
      )}
    </main>
  );
});

export default TelegramEntry;
