import { IFriendRequest, IUser } from "@/lib/models";
import {
  applyFriendRequest,
  declineFriendRequest,
  deleteFriendRequest,
  getFriendRequests,
} from "@/lib/requests";
import userStore from "@/store/userStore";
import { Card, CardBody } from "@nextui-org/card";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect, useState } from "react";
import { PageSpinner } from "../pageSpinner";
import { Button } from "@nextui-org/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getUserLink } from "@/lib/label";
import { getUser } from "@/app/auth/login/auth";
import countersStore from "@/store/counterStore";

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
        variant="flat"
        color="primary"
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
        variant="flat"
        color="danger"
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
        variant="flat"
        color="danger"
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
            className="cursor-pointer"
            onClick={() => {
              router.push(getUserLink(user));
            }}
            name={user.name}
            description={user.username}
            avatarProps={{
              src: user.image,
              name: user.name[0],
            }}
          />

          <div className="flex gap-1">{children}</div>
        </CardBody>
      </Card>
    );
  }
);

