"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { WishItem } from "../wish/card";
import PageHeader from "../pageHeader";
import { PageSpinner } from "../pageSpinner";
import { CardsList } from "../cardsList/cardsList";

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
      <PageHeader>Забронированные желания</PageHeader>
      {isLoading ? (
        <PageSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {components.length ? (
            <CardsList items={components} />
          ) : (
            <p className="text-2xl text-center col-span-full">Список пуст</p>
          )}
        </div>
      )}
    </>
  );
});
