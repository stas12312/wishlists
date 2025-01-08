"use client";
import { observer } from "mobx-react-lite";

import { ReservedWishes } from "@/components/reserved/reservedList";

const WishesPage = observer(() => {
  return <ReservedWishes />;
});

export default WishesPage;
