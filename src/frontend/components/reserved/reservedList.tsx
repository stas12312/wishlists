"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { WishItem } from "../wish/card";
import PageHeader from "../pageHeader";

import { getReservedWishes } from "@/lib/requests";
import { IWish } from "@/lib/models/wish";

export const ReservedWishes = observer(() => {
  const [wishes, setWishes] = useState<IWish[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getReservedWishes();
      setWishes(data);
    }
    fetchData();
  }, []);

  const components = wishes.map((wish: IWish) => (
    <div key={wish.uuid}>
      <WishItem
        wish={{ ...wish, actions: { ...wish.actions, open_wishlist: true } }}
        withUser={true}
        onDelete={() => {}}
      />
    </div>
  ));

  return (
    <>
      <PageHeader>Забронированные желания</PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {components.length ? (
          components
        ) : (
          <p className="text-2xl text-center col-span-full">Список пуст</p>
        )}
      </div>
    </>
  );
});
