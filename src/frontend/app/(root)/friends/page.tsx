"use client";
import FriendsList from "@/components/friends/list";
import FriendRequestsItems from "@/components/friends/requests";
import countersStore from "@/store/counterStore";
import { Chip } from "@nextui-org/chip";
import { Divider } from "@nextui-org/divider";
import { Tab, Tabs } from "@nextui-org/tabs";
import { observer } from "mobx-react-lite";

const FriendsPage = observer(() => {
  const incomingCounts = countersStore.friendCounters.incoming_requests;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-2xl w-full">Друзья</p>
      <Divider />
      <Tabs aria-label="friends" className="mx-auto">
        <Tab key="my-friends" title="Мои друзья">
          <FriendsList />
        </Tab>
        <Tab
          key="reqeusts"
          title={
            <span>
              Заявки{" "}
              {incomingCounts ? <Chip size="sm">{incomingCounts}</Chip> : null}
            </span>
          }
        >
          <FriendRequestsItems />
        </Tab>
      </Tabs>
    </div>
  );
});

export default FriendsPage;

