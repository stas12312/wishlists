"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";

import { InfinityLoader } from "../InfinityLoader";
import { PageSpinner } from "../PageSpinner";

import { DateEvents } from "./FeedDateEvents";

import PageHeader from "@/components/PageHeader";
import { getFeed } from "@/lib/client-requests/feed";
import { Cursor } from "@/lib/models";
import { IWish } from "@/lib/models/wish";
import { IUser } from "@/lib/models/user";

export interface IUserInfo {
  user: IUser;
  wishes: IWish[];
}

export interface IDateInfo {
  date: string;
  users: IUserInfo[];
}

const COUNT = 25;

const FeedList = observer(() => {
  const [items, setItems] = useState<IWish[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const cursorRef = useRef<Cursor>(["", ""]);
  const groupedData = useMemo(() => makeAgregateData(items), [items]);

  useEffect(() => {
    async function fetch() {
      await fetchFeed(true);
      setIsLoading(false);
    }
    fetch();
  }, []);

  function onUpdate(wish: IWish) {
    setItems((prev) => prev.map((i) => (i.uuid == wish.uuid ? wish : i)));
  }

  async function fetchFeed(firstRequest: boolean) {
    if (firstRequest) {
      cursorRef.current = ["", ""];
    }
    const result = await getFeed({
      cursor: cursorRef.current,
      count: COUNT,
    });
    cursorRef.current = result.navigation.cursor;
    setItems((prev) => (firstRequest ? result.data : prev.concat(result.data)));
    setHasMore(result.data.length === COUNT);
  }

  return (
    <>
      <PageHeader dividerClassName="mt-2" title="Лента" />
      {items.length ? (
        <div>
          <InfinityLoader
            hasMore={hasMore && !isLoading}
            onLoad={() => fetchFeed(false)}
          >
            {groupedData.map((dateEvents) => {
              return (
                <DateEvents
                  key={dateEvents.date}
                  dateEvents={dateEvents}
                  onUpdateEvent={onUpdate}
                />
              );
            })}
          </InfinityLoader>
        </div>
      ) : (
        <>
          {isLoading ? (
            <PageSpinner />
          ) : (
            <div className="flex align-middle justify-center items-center flex-col mt-4">
              <h3 className="text-2xl">Ваша лента пуста</h3>
              <span className="text-default-500">
                Добавляйте друзей, чтобы быть в курсе их желаний
              </span>
            </div>
          )}
        </>
      )}
    </>
  );
});

export default FeedList;

function makeAgregateData(items: IWish[]): IDateInfo[] {
  const newData = [] as IDateInfo[];
  let currentDate = "";
  let currenDateUsers = new Map<number, IWish[]>();
  let currentUserId = 0;
  let userCounter = 0;
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let itemDate = new Date(item.created_at ?? 0).toLocaleDateString();
    if (currentUserId != item.user.id) {
      currentUserId = item.user.id;
      userCounter += 1;
    }
    if (itemDate != currentDate) {
      if (currenDateUsers.size) {
        let users = [] as IUserInfo[];
        currenDateUsers.forEach((wishes) => {
          users.push({ user: wishes[0].user, wishes: wishes });
        });

        newData.push({ date: currentDate, users: users });
      }
      currenDateUsers.clear();
      currentDate = itemDate;
    }
    if (!currenDateUsers.has(userCounter)) {
      currenDateUsers.set(userCounter, [] as IWish[]);
    }
    currenDateUsers.get(userCounter)?.push(item);
  }
  let users = [] as IUserInfo[];
  currenDateUsers.forEach((wishes) => {
    users.push({ user: wishes[0].user, wishes: wishes });
  });

  newData.push({ date: currentDate, users: users });
  return newData;
}
