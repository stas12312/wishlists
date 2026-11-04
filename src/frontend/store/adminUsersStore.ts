import { makeAutoObservable, runInAction } from "mobx";
import { isAxiosError } from "axios";

import {
  IAdminUser,
  IAdminUserDetail,
  IUserLink,
} from "@/lib/models/admin-user";
import {
  deleteAdminUserLink,
  getAdminUser,
  getAdminUsers,
} from "@/lib/client-requests/admin/user";

function errorMessage(error: unknown, fallback: string) {
  return isAxiosError(error) &&
    typeof error.response?.data?.message === "string"
    ? error.response.data.message
    : fallback;
}

export class AdminUsersStore {
  search = "";
  users: IAdminUser[] = [];
  user: IAdminUserDetail | null = null;
  pendingLink: IUserLink | null = null;
  loading = false;
  deleting = false;
  error = "";
  hasMore = false;
  private appliedSearch = "";
  private request = 0;
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    makeAutoObservable<this, "searchTimer">(this, { searchTimer: false });
  }

  setSearch(value: string) {
    this.search = value;
    this.cancelSearch();
    const search = value.trim();
    if (!search) {
      if (this.appliedSearch) void this.loadUsers();
    } else if (search.length >= 3) {
      this.searchTimer = setTimeout(() => void this.loadUsers(), 400);
    }
  }

  cancelSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = undefined;
  }
  selectLink(link: IUserLink | null) {
    if (!this.deleting) this.pendingLink = link;
  }

  async loadUsers(append = false) {
    if (append && (this.loading || !this.hasMore)) return;
    if (!append) this.cancelSearch();
    const request = ++this.request;
    if (!append) {
      this.appliedSearch = this.search.trim();
      this.users = [];
      this.hasMore = false;
    }
    this.loading = true;
    this.error = "";
    try {
      const users = await getAdminUsers(
        this.appliedSearch,
        append ? this.users.at(-1)?.id : 0,
      );
      runInAction(() => {
        if (request !== this.request) return;
        this.users = append ? [...this.users, ...users] : users;
        this.hasMore = users.length === 50;
      });
    } catch (error) {
      runInAction(() => {
        if (request === this.request)
          this.error = errorMessage(
            error,
            "Не удалось загрузить пользователей",
          );
      });
    } finally {
      runInAction(() => {
        if (request === this.request) this.loading = false;
      });
    }
  }

  async loadUser(id: number) {
    this.loading = true;
    this.error = "";
    this.user = null;
    try {
      const user = await getAdminUser(id);
      runInAction(() => {
        this.user = user;
      });
    } catch (error) {
      runInAction(() => {
        this.error = errorMessage(error, "Не удалось загрузить пользователя");
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async deleteLink() {
    if (!this.user || !this.pendingLink || this.deleting) return;
    const link = this.pendingLink;
    this.deleting = true;
    this.error = "";
    try {
      await deleteAdminUserLink(this.user.id, link);
      runInAction(() => {
        if (this.user)
          this.user.links = this.user.links.filter(
            (item) =>
              item.provider !== link.provider ||
              item.oauth_user_id !== link.oauth_user_id,
          );
        this.pendingLink = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = errorMessage(error, "Не удалось удалить привязку");
        this.pendingLink = null;
      });
    } finally {
      runInAction(() => {
        this.deleting = false;
      });
    }
  }
}
