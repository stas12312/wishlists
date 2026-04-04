"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import PageHeader from "../PageHeader";
import { PageSpinner } from "../PageSpinner";
import { AnimatedList } from "../animated-list/AnimatedList";
import { QuestionInfo } from "../question/QuestionCounterCard";

import { WishItem } from "./WishCard";

import { getReservedWishes } from "@/lib/client-requests/wish";
import { IWish } from "@/lib/models/wish";

export const ReservedWishes = observer(() => {
  const [wishes, setWishes] = useState<IWish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getReservedWishes();
      setWishes(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  function onUpdate(wish: IWish) {
    const newWishes = [...wishes];
    const index = newWishes.findIndex((i) => i.uuid == wish.uuid);
    newWishes[index] = wish;
    setWishes(newWishes);
  }

  const components = wishes.map((wish: IWish) => (
    <div key={wish.uuid}>
      <WishItem
        wish={{ ...wish, actions: { ...wish.actions, open_wishlist: true } }}
        withUser={true}
        onDelete={() => {}}
        onUpdate={onUpdate}
      />
    </div>
  ));

  return (
    <>
      <PageHeader title="Желания" />
      {isLoading ? (
        <PageSpinner />
      ) : (
        <>
          <QuestionInfo />
          {components.length ? (
            <span>
              <PageHeader title="Забронированные желания" />
              <AnimatedList items={components} />
            </span>
          ) : null}
        </>
      )}
    </>
  );
});
