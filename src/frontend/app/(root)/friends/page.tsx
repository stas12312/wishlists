"use client";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tab, Tabs } from "@heroui/tabs";
import { observer } from "mobx-react-lite";
import toast from "react-hot-toast";
import { IoMdLink } from "react-icons/io";

import userStore from "@/store/userStore";
import countersStore from "@/store/counterStore";
import { getUserLink } from "@/lib/label";
import FriendRequestsItems from "@/components/friends/requests";
import FriendsList from "@/components/friends/list";
import PageHeader from "@/components/pageHeader";

const FriendsPage = observer(() => {
  const incomingCounts = countersStore.friendCounters.incoming_requests;
  if (incomingCounts == 0) {
    throw new Error("Ошибка");
  }
  return (
    <div className="flex flex-col gap-4">
      <PageHeader>Друзья</PageHeader>
      <Tabs aria-label="friends" className="mx-auto" size="lg">
        <Tab key="my-friends" title="Мои друзья">
          <CopyLinkButton username={userStore.user.username} />
          <FriendsList />
        </Tab>
        <Tab
          key="reqeusts"
          title={
            <>
              {"Заявки "}
              {incomingCounts ? (
                <Chip color="primary" radius="sm">
                  {incomingCounts.toLocaleString()}
                </Chip>
              ) : null}
            </>
          }
        >
          <FriendRequestsItems />
        </Tab>
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
        color="primary"
        startContent={<IoMdLink />}
        variant="flat"
        onPress={() => {
          navigator.clipboard.writeText(getUserLink(username));
          toast.success("Ссылка скопирована");
        }}
      >
        Скопировать ссылку для друзей
      </Button>
    </div>
  );
};
