"use client";
import { observer } from "mobx-react-lite";

import { ReservedWishes } from "@/components/wish/WishReservedList";

const WishesPage = observer(() => {
  return <ReservedWishes />;
});

export default WishesPage;
