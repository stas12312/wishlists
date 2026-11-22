"use client";
import { Button, Chip, Tabs, toast } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { use } from "react";
import { IoMdLink } from "react-icons/io";

import userStore from "@/store/userStore";
import countersStore from "@/store/counterStore";
import { getUserLink } from "@/lib/label";
import FriendsList from "@/components/friend/FriendList";
import PageHeader from "@/components/PageHeader";
import FriendRequestsItems from "@/components/friend/FriendRequests";

const FriendsPage = observer(function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const initialTab =
    use(searchParams).tab === "requests" ? "requests" : "my-friends";
  const incomingCounts = countersStore.friendCounters.incoming_requests;
  return (
    <div className="flex flex-col">
      <PageHeader
        actions={<CopyLinkButton username={userStore.user.username} />}
        title="Друзья"
      />
      <Tabs
        key={initialTab}
        aria-label="friends"
        defaultSelectedKey={initialTab}
      >
        <Tabs.ListContainer className="mx-auto  w-70">
          <Tabs.List>
            <Tabs.Tab id="my-friends">
              Мои друзья
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab className="flex gap-1" id="requests">
              <>
                {"Заявки "}
                {incomingCounts ? (
                  <Chip className="font-mono" color="accent" variant="primary">
                    {incomingCounts.toLocaleString()}
                  </Chip>
                ) : null}
              </>
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="my-friends">
          <FriendsList withMenu={true} />
        </Tabs.Panel>
        <Tabs.Panel id="requests">
          <FriendRequestsItems />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
});

export default FriendsPage;

const CopyLinkButton = ({ username }: { username: string }) => {
  return (
    <Button
      variant="primary"
      onPress={() => {
        navigator.clipboard.writeText(getUserLink(username));
        toast("Ссылка скопирована");
      }}
    >
      <IoMdLink />
      Скопировать ссылку для друзей
    </Button>
  );
};
