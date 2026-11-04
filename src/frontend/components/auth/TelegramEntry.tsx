"use client";

import { Button, Link, LinkIcon, Spinner, Surface } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { BsStars } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";

import { TelegramStore } from "@/store/telegramStore";

const returnTo = encodeURIComponent("/miniapp/telegram?link=1");

const TelegramEntry = observer(function TelegramEntry({
  linkMode,
  previewCreating = false,
}: {
  linkMode: boolean;
  previewCreating?: boolean;
}) {
  const [store] = useState(() => {
    const telegramStore = new TelegramStore();
    if (previewCreating) telegramStore.status = "choice";
    return telegramStore;
  });
  const router = useRouter();
  const isCreatingAccount =
    previewCreating || (store.status === "choice" && store.busy);

  useEffect(() => {
    if (store.status === "done") {
      window.location.replace("/");
    }
  }, [store.status, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      {!previewCreating && (
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          onError={() =>
            store.fail(
              "Не удалось загрузить Telegram. Откройте приложение заново",
            )
          }
          onReady={() => void store.initialize(linkMode)}
        />
      )}
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
                isPending={store.busy}
                variant="secondary"
                onPress={() => void store.register()}
              >
                Создать аккаунт
              </Button>
            </>
          )}
          {store.status === "link" && (
            <>
              <p>
                Свяжите Telegram с аккаунтом, в который вы вошли. В следующий
                раз вход будет автоматическим.
              </p>
              <Button
                fullWidth
                isPending={store.busy}
                onPress={() => void store.link()}
              >
                Связать с Telegram
              </Button>
            </>
          )}
          {store.status === "error" && (
            <>
              <p className="text-danger" role="alert">
                {store.error}
              </p>
              <Button
                fullWidth
                variant="secondary"
                onPress={() => window.location.reload()}
              >
                Попробовать ещё раз
              </Button>
            </>
          )}
        </div>
      </Surface>
    </main>
  );
});

export default TelegramEntry;
