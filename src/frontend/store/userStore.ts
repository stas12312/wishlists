import { makeAutoObservable, flow } from "mobx";

import { IUser } from "@/lib/models";
import { getMe } from "@/lib/requests";

class UserStore {
  user: IUser = { id: 0, name: "", email: "", username: "", image: "" };
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

  reloadMe = flow(function* (this: UserStore) {
    this.user = yield getMe();
  });
}

const userStore = new UserStore();

export default userStore;
