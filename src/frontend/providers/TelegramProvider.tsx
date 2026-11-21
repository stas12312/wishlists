"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { createContext, useState, useSyncExternalStore } from "react";

const sessionKey = "mywishlists:telegram";

function hasTelegramSession() {
  try {
    return sessionStorage.getItem(sessionKey) === "1";
  } catch {
    return false;
  }
}

const subscribe = () => () => {};
const getServerSnapshot = () => false;

type ScriptStatus = "loading" | "ready" | "error";

export const TelegramScriptContext = createContext<ScriptStatus>("loading");

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const restoreSession = useSyncExternalStore(
    subscribe,
    hasTelegramSession,
    getServerSnapshot,
  );
  const [status, setStatus] = useState<ScriptStatus>("loading");
  const loadScript =
    pathname === "/miniapp/telegram" || restoreSession || status === "ready";

  return (
    <TelegramScriptContext.Provider value={status}>
      {loadScript && (
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          onError={() => setStatus("error")}
          onReady={() => {
            const app = window.Telegram?.WebApp;
            if (app?.initData) {
              try {
                sessionStorage.setItem(sessionKey, "1");
              } catch {
                // Хранилище нужно только для повторной загрузки страницы.
              }
              const updateFullscreen = () => {
                document.documentElement.toggleAttribute(
                  "data-telegram-fullscreen",
                  app.isFullscreen === true,
                );
              };
              app.onEvent?.("fullscreenChanged", updateFullscreen);
              updateFullscreen();
              app.ready();
              if (app.isVersionAtLeast?.("7.7")) {
                app.disableVerticalSwipes?.();
              }
              app.expand();
              const isDesktop =
                app.platform === "tdesktop" || app.platform === "macos";
              if (
                !isDesktop &&
                !app.isFullscreen &&
                app.isVersionAtLeast?.("8.0")
              ) {
                app.requestFullscreen?.();
              }
            }
            setStatus("ready");
          }}
        />
      )}
      {children}
    </TelegramScriptContext.Provider>
  );
}
