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
      <PageHeader title="Друзья" />
      <Tabs
        key={initialTab}
        aria-label="friends"
        defaultSelectedKey={initialTab}
      >
        <div className="grid items-center justify-items-center gap-2 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <Tabs.ListContainer className="w-full max-w-70 xl:col-start-2 xl:w-70">
            <Tabs.List>
              <Tabs.Tab id="my-friends">
                Мои друзья
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab className="flex gap-1" id="requests">
                <>
                  {"Заявки "}
                  {incomingCounts ? (
                    <Chip
                      className="font-mono"
                      color="accent"
                      variant="primary"
                    >
                      {incomingCounts.toLocaleString()}
                    </Chip>
                  ) : null}
                </>
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <CopyLinkButton username={userStore.user.username} />
        </div>
        <Tabs.Panel className="px-0" id="my-friends">
          <FriendsList withMenu={true} />
        </Tabs.Panel>
        <Tabs.Panel className="px-0" id="requests">
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
      className="max-w-full whitespace-normal md:justify-self-end xl:col-start-3"
      variant="primary"
      onPress={() => {
        navigator.clipboard.writeText(getUserLink(username));
        toast("Ссылка скопирована");
      }}
    >
      <IoMdLink className="shrink-0" />
      Скопировать ссылку для друзей
    </Button>
  );
};
