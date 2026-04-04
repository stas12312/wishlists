import clsx from "clsx";
import { motion } from "framer-motion";

import { IDateInfo } from "./FeedList";
import { UserEvents } from "./FeedUserEvents";

import { IWish } from "@/lib/models/wish";
import { useHeader } from "@/providers/HeaderProviders";

export const DateEvents = ({
  dateEvents,
  onUpdateEvent,
}: {
  dateEvents: IDateInfo;
  onUpdateEvent?: { (wish: IWish): void };
}) => {
  const { isVisible } = useHeader();
  return (
    <motion.div
      key={dateEvents.date}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      initial={{ opacity: 0 }}
    >
      <div
        className={clsx(
          "bg-surface/50 backdrop-blur-xl sticky text-center p-2 z-20 md:float-left rounded-3xl my-4 mx-6 md:mx-0",
          isVisible ? "top-22" : "top-4",
        )}
      >
        <p className="text-bold text-3xl mx-2">{dateEvents.date}</p>
      </div>

      {dateEvents.users.map((userEvents) => {
        return (
          <UserEvents
            key={userEvents.wishes[0].uuid}
            userInfo={userEvents}
            onUpdate={onUpdateEvent}
          />
        );
      })}
    </motion.div>
  );
};
