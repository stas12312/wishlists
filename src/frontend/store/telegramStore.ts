import { isAxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";

import { setTokens } from "@/lib/auth";
import { authManager } from "@/lib/clientAuth";
import {
  authenticateTelegram,
  linkTelegram,
  registerTelegram,
} from "@/lib/client-requests/telegram";

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { start_param?: string };
  ready(): void;
  expand(): void;
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

export class TelegramStore {
  status: TelegramStatus = "loading";
  error = "";
  busy = false;

  constructor() {
    makeAutoObservable(this);
  }

  fail(message: string) {
    this.error = message;
    this.status = "error";
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
    if (linkMode || app.initDataUnsafe?.start_param === "link") {
      const token = await authManager.getAccessToken();
      runInAction(() => {
        this.status = token ? "link" : "choice";
      });
      return;
    }
    this.busy = true;
    try {
      const result = await authenticateTelegram(app.initData);
      if (result.linked) {
        await setTokens(result);
        authManager.accessToken = result.access_token;
      }
      runInAction(() => {
        this.status = result.linked ? "done" : "choice";
      });
    } catch (error) {
      this.fail(this.errorMessage(error));
    } finally {
      runInAction(() => {
        this.busy = false;
      });
    }
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
