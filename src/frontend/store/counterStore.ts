import { makeAutoObservable, flow } from "mobx";

import { FriendsCounters, IUser } from "@/lib/models";
import { getFriendsCounters } from "@/lib/requests";

class CountersStore {
  friendCounters: FriendsCounters = {friends: 0, incoming_requests: 0}

  constructor() {
    makeAutoObservable(this);
  }

  getCounters = flow(function* (this: CountersStore) {
    this.friendCounters = yield getFriendsCounters();
  });

}

const countersStore = new CountersStore();

export default countersStore;
