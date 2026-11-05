import { isAxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";

import { clearSession, openTelegramAccount, setTokens } from "@/lib/auth";
import { authManager } from "@/lib/clientAuth";
import {
  authenticateTelegram,
  inspectTelegram,
  redeemTelegramLinkCode,
  linkTelegram,
  logoutTelegram,
  registerTelegram,
  unlinkTelegram,
} from "@/lib/client-requests/telegram";
import { getAuthInfo, getMe } from "@/lib/client-requests/user";
import { IUser } from "@/lib/models/user";

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { start_param?: string };
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
  | "linkConflict"
  | "link"
  | "done"
  | "error";

function showLinkScreenUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("link_code");
  url.searchParams.delete("user_id");
  url.searchParams.set("link", "1");
  window.history.replaceState(window.history.state, "", url);
}

export class TelegramStore {
  status: TelegramStatus = "loading";
  error = "";
  busy = false;
  accountId = 0;
  accountName = "";
  accountImage = "";
  accountEmail = "";
  targetHasTelegram = false;

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

  get isLinkConflict() {
    return (
      this.error ===
      "К этому аккаунту уже привязан другой Telegram. Отвяжите другой Telegram в настройках и повторите попытку"
    );
  }

  async initialize(linkMode: boolean, sessionUserId?: number) {
    if (this.busy || this.status !== "loading") return;
    const app = window.Telegram?.WebApp;
    if (!app?.initData) {
      this.status = "outside";
      return;
    }
    app.ready();
    app.expand();
    this.busy = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const startParam =
        params.get("link_code") ||
        (!(linkMode || params.get("link") === "1")
          ? app.initDataUnsafe?.start_param
          : undefined);
      if (startParam?.startsWith("link_")) {
        await this.redeemLink(startParam);
        return;
      }

      const isLinkRequest =
        linkMode || params.get("link") === "1" || startParam === "link";
      if (!isLinkRequest) {
        if (sessionUserId) {
          const inspection = await inspectTelegram(app.initData);
          if (inspection.linked && inspection.user.id === sessionUserId) {
            runInAction(() => {
              this.status = "done";
            });
            return;
          }
        }
        const result = await authenticateTelegram(app.initData);
        if (result.linked) {
          await setTokens(result);
          authManager.accessToken = result.access_token;
          runInAction(() => {
            this.status = "done";
          });
          return;
        }
      }

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
    } finally {
      runInAction(() => {
        this.busy = false;
      });
    }
  }

  async loginLinkedAccount(openSettings: boolean) {
    if (this.busy || this.status !== "linkConflict") return;
    const initData = window.Telegram?.WebApp.initData;
    if (!initData) {
      this.status = "outside";
      return;
    }
    this.busy = true;
    const previousAccessToken = authManager.accessToken;
    try {
      const result = await authenticateTelegram(initData);
      if (!result.linked) {
        throw new Error(
          "Связка Telegram изменилась. Откройте приложение заново",
        );
      }
      authManager.accessToken = result.access_token;
      await openTelegramAccount(result, openSettings);
    } catch (error) {
      authManager.accessToken = previousAccessToken;
      this.fail(this.errorMessage(error));
      runInAction(() => {
        this.busy = false;
      });
    }
  }

  async unlinkAndContinue() {
    if (this.busy || this.status !== "linkConflict") return;
    const initData = window.Telegram?.WebApp.initData;
    if (!initData) {
      this.status = "outside";
      return;
    }
    this.busy = true;
    try {
      await unlinkTelegram(initData, this.accountId);
      await this.prepareLink();
    } catch (error) {
      this.fail(this.errorMessage(error));
    } finally {
      runInAction(() => {
        this.busy = false;
      });
    }
  }

  private showLinkConflict(user: IUser) {
    this.setAccount(user);
    this.status = "linkConflict";
  }

  private setAccount(user: IUser) {
    this.accountId = user.id;
    this.accountName = user.name;
    this.accountImage = user.image;
    this.accountEmail = user.email;
  }

  private clearAccount() {
    this.accountId = 0;
    this.accountName = "";
    this.accountImage = "";
    this.accountEmail = "";
  }

  private async endSession() {
    await logoutTelegram();
    await clearSession();
    authManager.logout();
  }

  private async redeemLink(code: string) {
    const initData = window.Telegram?.WebApp.initData;
    if (!initData) {
      this.status = "outside";
      return;
    }
    const result = await redeemTelegramLinkCode(initData, code);
    await setTokens(result);
    authManager.accessToken = result.access_token;
    showLinkScreenUrl();
    await this.prepareLink();
  }

  private async prepareLink() {
    const initData = window.Telegram?.WebApp.initData;
    if (!initData) {
      this.status = "outside";
      return null;
    }
    const [user, inspection, authInfo] = await Promise.all([
      getMe(),
      inspectTelegram(initData),
      getAuthInfo(),
    ]);
    if (!user?.id) throw new Error("Не удалось загрузить аккаунт");

    const targetHasTelegram = authInfo.links.some(
      (link) => link.provider.toLowerCase() === "telegram",
    );

    if (inspection.linked) {
      if (inspection.user.id === user.id) {
        runInAction(() => {
          this.status = "done";
        });
      } else {
        runInAction(() => {
          this.targetHasTelegram = targetHasTelegram;
          this.showLinkConflict(inspection.user);
        });
      }
      return user.id;
    }

    if (targetHasTelegram) {
      this.setAccount(user);
      throw new Error(
        "К этому аккаунту уже привязан другой Telegram. Отвяжите другой Telegram в настройках и повторите попытку",
      );
    }

    runInAction(() => {
      this.setAccount(user);
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
      try {
        await linkTelegram(initData);
      } catch (error) {
        if (
          this.errorMessage(error) !==
          "Этот Telegram уже связан с другим аккаунтом"
        ) {
          throw error;
        }
        await this.prepareLink();
        return;
      }
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
      await this.endSession();
      runInAction(() => {
        this.clearAccount();
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
