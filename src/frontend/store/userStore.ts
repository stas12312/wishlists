import { makeAutoObservable, flow } from "mobx";

import { IUser } from "@/lib/models/user";
import { getMe } from "@/lib/client-requests/user";

const emptyUser = { id: 0, name: "", email: "", username: "", image: "" };

class UserStore {
  user: IUser = emptyUser;
  isLoading = true;

  constructor() {
    makeAutoObservable(this);
  }

  fetchMe = flow(function* (this: UserStore) {
    if (!this.user.id) {
      this.user = yield getMe();
    }
    this.isLoading = false;
  });

  logout() {
    this.user = emptyUser;
  }

  reloadMe = flow(function* (this: UserStore) {
    this.user = yield getMe();
  });
}

const userStore = new UserStore();

export default userStore;
