"use client";
import { ReservedWishes } from "@/components/reserved/reservedList";
import { observer } from "mobx-react-lite";

const WishesPage = observer(() => {
  return <ReservedWishes />;
});

export default WishesPage;

