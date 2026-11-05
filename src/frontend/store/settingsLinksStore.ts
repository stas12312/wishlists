import { makeAutoObservable, runInAction } from "mobx";

import { deleteOAuthLink, getAuthInfo } from "@/lib/client-requests/user";
import { AuthInfo } from "@/lib/models/user";

export class SettingsLinksStore {
  info: AuthInfo | null = null;
  loading = true;
  deleting = false;
  error = "";
  pendingProvider: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  selectProvider(provider: string | null) {
    if (!this.deleting) this.pendingProvider = provider;
  }

  setInfo = (info: AuthInfo) => {
    this.info = info;
  };

  async load() {
    this.loading = true;
    this.error = "";
    try {
      const info = await getAuthInfo();
      if (
        !Array.isArray(info.links) ||
        !Array.isArray(info.providers) ||
        typeof info.has_email !== "boolean"
      ) {
        throw new Error("API не вернул данные привязок");
      }
      runInAction(() => {
        this.info = info;
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось загрузить привязки. Попробуйте ещё раз.";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async remove() {
    const provider = this.pendingProvider;
    if (!provider || !this.info?.has_email || this.deleting) return;
    this.deleting = true;
    this.error = "";
    try {
      await deleteOAuthLink(provider);
      runInAction(() => {
        if (this.info)
          this.info.links = this.info.links.filter(
            (link) => link.provider !== provider,
          );
        this.pendingProvider = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : "Не удалось удалить привязку";
        this.pendingProvider = null;
      });
    } finally {
      runInAction(() => {
        this.deleting = false;
      });
    }
  }
}
