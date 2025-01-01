"use client";
import FriendsList from "@/components/friends/list";
import FriendRequestsItems from "@/components/friends/requests";
import { getUserLink } from "@/lib/label";
import countersStore from "@/store/counterStore";
import userStore from "@/store/userStore";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Divider } from "@nextui-org/divider";
import { Tab, Tabs } from "@nextui-org/tabs";
import { observer } from "mobx-react-lite";
import toast from "react-hot-toast";
import { IoMdLink } from "react-icons/io";

const FriendsPage = observer(() => {
  const incomingCounts = countersStore.friendCounters.incoming_requests;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-2xl w-full">Друзья</p>
      <Divider />
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
        startContent={<IoMdLink />}
        className="my-auto"
        color="primary"
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
