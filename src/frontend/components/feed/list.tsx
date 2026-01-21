"use client";
import { observer } from "mobx-react-lite";
import { createRef, useEffect, useRef, useState } from "react";

import PageHeader from "@/components/pageHeader";
import { getFeed } from "@/lib/client-requests/feed";
import { Cursor } from "@/lib/models";
import { IWish } from "@/lib/models/wish";
import { IUser } from "@/lib/models/user";
import { UserEvents } from "@/components/feed/userEvent";

export interface IUserInfo {
  user: IUser;
  wishes: IWish[];
}

interface IDateInfo {
  date: string;
  users: IUserInfo[];
}

const COUNT = 25;

const FeedList = observer(() => {
  const [items, setItems] = useState([] as IWish[]);
  const lastItem = createRef<HTMLDivElement>();
  const [groupedData, setGroupedData] = useState([] as IDateInfo[]);
  const [cursor, setCursor] = useState(["", ""]);
  const [hasMore, setHasMore] = useState(true);
  const observerLoader = useRef<IntersectionObserver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setItems(items);
    setGroupedData(makeAgregateData(items));
  }, [items]);

  useEffect(() => {
    async function fetch() {
      await fetchFeed(true, cursor);
      setIsLoading(false);
    }
    fetch();
  }, []);

  function onUpdate(wish: IWish) {
    const newWishes = [...items];
    const index = newWishes.findIndex((i) => i.uuid == wish.uuid);
    newWishes[index] = wish;
    setItems(newWishes);
  }

  async function fetchFeed(firstRequest: boolean = false, cursor: Cursor) {
    const result = await getFeed({
      cursor: cursor,
      count: COUNT,
    });
    let newItems = result.data;
    if (!firstRequest) {
      newItems = items.concat(newItems);
    }
    setItems(newItems);
    setGroupedData(makeAgregateData(newItems));
    setCursor(result.navigation.cursor);
    setHasMore(result.data.length === COUNT);
  }

  const actionInSight = (entries: any[]) => {
    if (entries[0].isIntersecting && hasMore) {
      fetchFeed(false, cursor);
    }
  };

  useEffect(() => {
    if (observerLoader.current) {
      observerLoader.current.disconnect();
    }

    observerLoader.current = new IntersectionObserver(actionInSight);
    if (lastItem.current) {
      observerLoader.current.observe(lastItem.current);
    }
  }, [lastItem]);

  return (
    <>
      <PageHeader>Лента</PageHeader>
      {items.length ? (
        <div className="p-4">
          {groupedData.map((dateInfo) => {
            return (
              <div key={dateInfo.date}>
                <div className="bg-content1 bg-opacity-50 backdrop-blur-xl sticky text-center top-1 z-50 md:float-left rounded-md p-2 mb-2">
                  <p className="text-bold text-3xl ">{dateInfo.date}</p>
                </div>

                {dateInfo.users.map((userInfo) => {
                  return (
                    <UserEvents
                      key={userInfo.wishes[0].wishlist_uuid}
                      userInfo={userInfo}
                      onUpdate={onUpdate}
                    />
                  );
                })}
              </div>
            );
          })}

          <div ref={lastItem} />
        </div>
      ) : (
        <>
          {isLoading ? null : (
            <div className="flex align-middle justify-center items-center flex-col">
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
