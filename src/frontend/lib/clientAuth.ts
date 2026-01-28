import { jwtDecode } from "jwt-decode";

import { refreshTokens } from "./client-requests/auth";

export class AuthManager {
  accessToken: string | undefined;

  private refreshPromise: Promise<void> | null = null;
  private isAuthorized: undefined | boolean;

  async refreshTokenIfNeed() {
    if (this.isAuthorized !== undefined && !this.isAuthorized) {
      return;
    }
    if (this.accessToken) {
      const tokenData = jwtDecode(this.accessToken);
      const expiredTime = tokenData.exp;
      if (expiredTime && expiredTime * 1000 < Date.now()) {
        await this.refreshToken();
      }
      return;
    }
    await this.refreshToken();
  }

  async getAccessToken() {
    await this.refreshTokenIfNeed();
    return this.accessToken;
  }

  logout() {
    this.accessToken = undefined;
  }

  async refreshToken() {
    if (this.refreshPromise) {
      await this.refreshPromise;
      return;
    }

    this.refreshPromise = this._performRefresh()
      .finally(() => {
        this.refreshPromise = null;
      })
      .catch(() => {
        this.isAuthorized = false;
      });
    await this.refreshPromise;
  }

  async _performRefresh() {
    const response = await refreshTokens();
    if ("message" in response) {
      this.accessToken = undefined;
      throw new Error(response.message || "Не удалось обновить токен");
    }
    this.isAuthorized = true;
    this.accessToken = response.access_token;
  }
}

export const authManager = new AuthManager();
