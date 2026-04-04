"use client";
import { Button, Chip, Tabs, toast } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { IoMdLink } from "react-icons/io";

import userStore from "@/store/userStore";
import countersStore from "@/store/counterStore";
import { getUserLink } from "@/lib/label";
import FriendsList from "@/components/friend/FriendList";
import PageHeader from "@/components/PageHeader";
import FriendRequestsItems from "@/components/friend/FriendRequests";

const FriendsPage = observer(() => {
  const incomingCounts = countersStore.friendCounters.incoming_requests;
  return (
    <div className="flex flex-col">
      <PageHeader title="Друзья" />
      <Tabs aria-label="friends">
        <Tabs.ListContainer className="mx-auto  w-70">
          <Tabs.List>
            <Tabs.Tab id="my-friends">
              Мои друзья
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="reqeusts">
              <>
                {"Заявки "}
                {incomingCounts ? (
                  <Chip variant="primary">
                    {incomingCounts.toLocaleString()}
                  </Chip>
                ) : null}
              </>
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="my-friends">
          <CopyLinkButton username={userStore.user.username} />
          <FriendsList withMenu={true} />
        </Tabs.Panel>
        <Tabs.Panel id="reqeusts">
          <FriendRequestsItems />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
});

export default FriendsPage;

const CopyLinkButton = ({ username }: { username: string }) => {
  return (
    <div className="flex justify-center mb-4">
      <Button
        className="my-auto"
        variant="primary"
        onPress={() => {
          navigator.clipboard.writeText(getUserLink(username));
          toast("Ссылка скопирована");
        }}
      >
        <IoMdLink />
        Скопировать ссылку для друзей
      </Button>
    </div>
  );
};
