import { motion } from "framer-motion";

import { UserEvents } from "./userEvent";
import { IDateInfo } from "./list";

import { IWish } from "@/lib/models/wish";

export const DateEvents = ({
  dateEvents,
  onUpdateEvent,
}: {
  dateEvents: IDateInfo;
  onUpdateEvent?: { (wish: IWish): void };
}) => {
  return (
    <motion.div
      key={dateEvents.date}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      initial={{ opacity: 0 }}
    >
      <div className="bg-content1 bg-opacity-50 backdrop-blur-xl sticky text-center top-1 z-20 md:float-left rounded-md p-2 mb-2 mx-6 md:mx-0">
        <p className="text-bold text-3xl ">{dateEvents.date}</p>
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
