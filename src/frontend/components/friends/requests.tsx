import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { PageSpinner } from "../pageSpinner";

import userStore from "@/store/userStore";
import countersStore from "@/store/counterStore";
import {
  applyFriendRequest,
  declineFriendRequest,
  deleteFriendRequest,
  getFriendRequests,
} from "@/lib/requests";
import { IFriendRequest, IUser } from "@/lib/models";
import { getUserLink } from "@/lib/label";

const FriendRequestsItems = observer(() => {
  const [requests, setRequests] = useState<IFriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user_id = userStore.user.id;

  useEffect(() => {
    async function fetchData() {
      setRequests(await getFriendRequests());
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!requests.length) {
    return <h2 className="text-2xl text-center">Заявок нет</h2>;
  }

  const incomingRequests = requests.filter((r) => {
    return r.to_user.id == user_id;
  });
  const outcomingRequests = requests.filter((r) => {
    return r.from_user.id == user_id;
  });

  const inpomingItems = incomingRequests.map((r) => (
    <FriendRequestItem key={r.from_user.id} user={r.from_user}>
      <Button
        color="primary"
        variant="flat"
        onPress={async () => {
          const result = await applyFriendRequest(r.from_user.id);
          if (result && "code" in result) {
            toast.error(result.message);
          } else {
            setRequests(await getFriendRequests());
            countersStore.getCounters();
            toast.success("Завка принята");
          }
        }}
      >
        Принять
      </Button>
      <Button
        color="danger"
        variant="flat"
        onPress={async () => {
          const result = await declineFriendRequest(r.from_user.id);
          if (result && "code" in result) {
            toast.error(result.message);
          } else {
            setRequests(await getFriendRequests());
            countersStore.getCounters();
            toast.success("Заявка отклонена");
          }
        }}
      >
        Отклонить
      </Button>
    </FriendRequestItem>
  ));

  const outcomingItems = outcomingRequests.map((r) => (
    <FriendRequestItem key={r.to_user.id} user={r.to_user}>
      <Button
        color="danger"
        variant="flat"
        onPress={async () => {
          const result = await deleteFriendRequest(r.to_user.id);
          if (result && "code" in result) {
            toast.error(result.message);
          } else {
            setRequests(await getFriendRequests());
            countersStore.getCounters();
            toast.success("Заявка отклонена");
          }
        }}
      >
        Удалить
      </Button>
    </FriendRequestItem>
  ));
  return (
    <div className="flex flex-col gap-4">
      {incomingRequests.length ? (
        <div>
          <p className="text-xl text-center my-2">Входящие</p>
          {inpomingItems}
        </div>
      ) : null}
      {outcomingRequests.length ? (
        <div>
          <p className="text-xl text-center  my-2">Исходящие</p>
          {outcomingItems}
        </div>
      ) : null}

      {}
    </div>
  );
});

export default FriendRequestsItems;

const FriendRequestItem = observer(
  ({ user, children }: { user: IUser; children?: ReactNode }) => {
    const router = useRouter();
    return (
      <Card className="max-w-[1000px] mx-auto w-full">
        <CardBody className="flex flex-row gap-4 justify-between">
          <User
            avatarProps={{
              src: user.image,
              name: user.name[0],
            }}
            className="cursor-pointer"
            description={user.username}
            name={user.name}
            onClick={() => {
              router.push(getUserLink(user.username));
            }}
          />

          <div className="flex gap-1">{children}</div>
        </CardBody>
      </Card>
    );
  },
);
