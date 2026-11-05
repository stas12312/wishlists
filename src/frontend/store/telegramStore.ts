import { isAxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";

import { clearSession, setTokens } from "@/lib/auth";
import { authManager } from "@/lib/clientAuth";
import {
  authenticateTelegram,
  redeemTelegramLinkCode,
  linkTelegram,
  logoutTelegram,
  registerTelegram,
} from "@/lib/client-requests/telegram";
import { getAuthInfo, getMe } from "@/lib/client-requests/user";

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { start_param?: string; user?: { id: number } };
  ready(): void;
  expand(): void;
  close(): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

type TelegramStatus =
  | "loading"
  | "outside"
  | "choice"
  | "link"
  | "done"
  | "error";

const redeemedLinkKey = "telegram-redeemed-link";

function rememberRedeemedLink(code: string, userId: number) {
  try {
    sessionStorage.setItem(redeemedLinkKey, JSON.stringify({ code, userId }));
  } catch {
    // В некоторых WebView хранилище недоступно; вход от него не зависит.
  }
}

function redeemedLinkUser(code: string): number | undefined {
  try {
    const saved = JSON.parse(sessionStorage.getItem(redeemedLinkKey) || "null");
    return saved?.code === code && typeof saved.userId === "number"
      ? saved.userId
      : undefined;
  } catch {
    return undefined;
  }
}

function showLinkScreenUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("link_code");
  url.searchParams.set("link", "1");
  window.history.replaceState(window.history.state, "", url);
}

export class TelegramStore {
  status: TelegramStatus = "loading";
  error = "";
  busy = false;
  accountName = "";
  accountImage = "";
  accountEmail = "";

  constructor() {
    makeAutoObservable(this);
  }

  fail(message: string) {
    this.error = message;
    this.status = "error";
  }

  get isLinkExpired() {
    return (
      this.error ===
      "Ссылка для подключения устарела. Получите новую в настройках"
    );
  }

  async initialize(linkMode: boolean) {
    if (this.busy || this.status !== "loading") return;
    const app = window.Telegram?.WebApp;
    if (!app?.initData) {
      this.status = "outside";
      return;
    }
    app.ready();
    app.expand();
    const params = new URLSearchParams(window.location.search);
    const startParam =
      params.get("link_code") ||
      (!(linkMode || params.get("link") === "1")
        ? app.initDataUnsafe?.start_param
        : undefined);
    if (startParam?.startsWith("link_")) {
      this.busy = true;
      try {
        const previousUser = redeemedLinkUser(startParam);
        if (
          previousUser !== undefined &&
          (await authManager.getAccessToken()) &&
          (await this.prepareLink(previousUser))
        ) {
          showLinkScreenUrl();
          return;
        }
        const result = await redeemTelegramLinkCode(app.initData, startParam);
        await setTokens(result);
        authManager.accessToken = result.access_token;
        showLinkScreenUrl();
        const userId = await this.prepareLink();
        if (userId) rememberRedeemedLink(startParam, userId);
      } catch (error) {
        this.fail(this.errorMessage(error));
      } finally {
        runInAction(() => {
          this.busy = false;
        });
      }
      return;
    }
    if (linkMode || params.get("link") === "1" || startParam === "link") {
      try {
        const token = await authManager.getAccessToken();
        if (token) {
          await this.prepareLink();
        } else {
          runInAction(() => {
            this.status = "choice";
          });
        }
      } catch (error) {
        this.fail(this.errorMessage(error));
      }
      return;
    }
    this.busy = true;
    try {
      const result = await authenticateTelegram(app.initData);
      if (result.linked) {
        await setTokens(result);
        authManager.accessToken = result.access_token;
        runInAction(() => {
          this.status = "done";
        });
      } else if (await authManager.getAccessToken()) {
        await this.prepareLink();
      } else {
        runInAction(() => {
          this.status = "choice";
        });
      }
    } catch (error) {
      this.fail(this.errorMessage(error));
    } finally {
      runInAction(() => {
        this.busy = false;
      });
    }
  }

  private async prepareLink(expectedUserId?: number) {
    const user = await getMe();
    if (!user?.id) throw new Error("Не удалось загрузить аккаунт");
    if (expectedUserId !== undefined && user.id !== expectedUserId) return null;
    const authInfo = await getAuthInfo();
    const telegramLink = authInfo.links.find(
      (link) => link.provider.toLowerCase() === "telegram",
    );
    const telegramId = window.Telegram?.WebApp.initDataUnsafe?.user?.id;
    if (telegramLink && telegramLink.oauth_user_id !== String(telegramId)) {
      throw new Error(
        "К этому аккаунту уже привязан другой Telegram. Сначала отвяжите его в настройках",
      );
    }
    runInAction(() => {
      this.accountName = user.name;
      this.accountImage = user.image;
      this.accountEmail = user.email;
      this.status = "link";
    });
    return user.id;
  }

  async register() {
    if (this.busy || this.status !== "choice") return;
    const initData = window.Telegram?.WebApp.initData;
    if (!initData) {
      this.status = "outside";
      return;
    }
    this.busy = true;
    try {
      const result = await registerTelegram(initData);
      await setTokens(result);
      authManager.accessToken = result.access_token;
      runInAction(() => {
        this.status = "done";
      });
    } catch (error) {
      this.fail(this.errorMessage(error));
    } finally {
      runInAction(() => {
        this.busy = false;
      });
    }
  }

  async link() {
    if (this.busy) return;
    const initData = window.Telegram?.WebApp.initData;
    if (!initData) {
      this.status = "outside";
      return;
    }
    this.busy = true;
    try {
      await linkTelegram(initData);
      runInAction(() => {
        this.status = "done";
      });
    } catch (error) {
      this.fail(this.errorMessage(error));
    } finally {
      runInAction(() => {
        this.busy = false;
      });
    }
  }

  async cancelLink() {
    if (this.busy) return;
    this.busy = true;
    try {
      await logoutTelegram();
      await clearSession();
      authManager.logout();
      runInAction(() => {
        this.accountName = "";
        this.accountImage = "";
        this.accountEmail = "";
        this.status = "choice";
      });
      window.Telegram?.WebApp.close();
    } catch (error) {
      this.fail(this.errorMessage(error));
    } finally {
      runInAction(() => {
        this.busy = false;
      });
    }
  }

  private errorMessage(error: unknown) {
    if (isAxiosError<{ message?: string }>(error)) {
      return (
        error.response?.data?.message ||
        "Не удалось связаться с сервером. Попробуйте ещё раз"
      );
    }
    return error instanceof Error
      ? error.message
      : "Не удалось войти через Telegram";
  }
}
