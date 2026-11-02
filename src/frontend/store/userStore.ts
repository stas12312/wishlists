import { action, makeAutoObservable, flow } from "mobx";

import { IUser } from "@/lib/models/user";
import { getMe } from "@/lib/client-requests/user";
import { authManager } from "@/lib/clientAuth";

const emptyUser = { id: 0, name: "", email: "", username: "", image: "" };
const reservationResultLifetime = 5 * 60 * 1000;

class UserStore {
  user: IUser = emptyUser;
  isLoading = true;
  private checkedReservations = new Map<
    string,
    { reserved: boolean; expiresAt: number }
  >();

  constructor() {
    makeAutoObservable(this);
  }

  getMe = flow(function* (this: UserStore) {
    if (!this.user.id) {
      this.user = yield getMe();
    }
    this.isLoading = false;
    return this.user;
  });

  getCheckedReservation(wishUUID: string) {
    const result = this.checkedReservations.get(wishUUID);
    return result && result.expiresAt > Date.now()
      ? result.reserved
      : undefined;
  }

  setCheckedReservation(wishUUID: string, reserved: boolean) {
    const expiresAt = Date.now() + reservationResultLifetime;
    this.checkedReservations.set(wishUUID, { reserved, expiresAt });
    setTimeout(
      action(() => {
        if (this.checkedReservations.get(wishUUID)?.expiresAt === expiresAt) {
          this.checkedReservations.delete(wishUUID);
        }
      }),
      reservationResultLifetime,
    );
  }

  logout() {
    this.checkedReservations.clear();
    this.user = emptyUser;
    authManager.logout();
  }

  reloadMe = flow(function* (this: UserStore) {
    this.user = yield getMe();
  });
}

const userStore = new UserStore();

export default userStore;
