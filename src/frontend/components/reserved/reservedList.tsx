"use client";
import { IWish } from "@/lib/models";
import { getReservedWishes } from "@/lib/requests";
import { Divider } from "@nextui-org/divider";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { WishItem } from "../wish/card";

export const ReservedWishes = observer(() => {
  const [wishes, setWishes] = useState<IWish[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getReservedWishes();
      console.log(data);
      setWishes(data);
    }
    fetchData();
  }, []);

  const components = wishes.map((wish: IWish) => (
    <div key={wish.uuid}>
      <WishItem wish={wish} onDelete={() => {}} />
    </div>
  ));

  return (
    <>
      <h1 className="text-2xl">Забронированные желания</h1>
      <Divider className="my-4 col-span-full"></Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {components}
      </div>
    </>
  );
});
