import { jwtDecode } from "jwt-decode";

import { logout, refreshTokens } from "./client-requests/auth";

export class AuthManager {
  accessToken: string | undefined;

  async refreshTokenIfNeed() {
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

  async refreshToken() {
    const response = await refreshTokens();
    if ("message" in response) {
      this.accessToken = undefined;
      logout();
      location.href = "/";
      return;
    }
    this.accessToken = response.access_token;
  }
}

export const authManager = new AuthManager();
