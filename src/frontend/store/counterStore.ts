import { makeAutoObservable, flow } from "mobx";

import { FriendsCounters } from "@/lib/models";
import { getFriendsCounters } from "@/lib/client-requests/friend";
import { IQuestionCounters } from "@/lib/models/question";
import { getQuestionCounters } from "@/lib/client-requests/question";
import { getTicketCounters } from "@/lib/client-requests/ticket";

class CountersStore {
  friendCounters: FriendsCounters = { friends: 0, incoming_requests: 0 };
  questionCounters: IQuestionCounters = { waiting: 0, answered: 0 };
  ticketCounters: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  getCounters = flow(function* (this: CountersStore) {
    this.friendCounters = yield getFriendsCounters();
    this.questionCounters = yield getQuestionCounters();
    this.ticketCounters = yield getTicketCounters();
  });

  get totalQuestions() {
    return (
      (this.questionCounters?.answered ?? 0) +
      (this.questionCounters?.waiting ?? 0)
    );
  }
}

const countersStore = new CountersStore();

export default countersStore;
