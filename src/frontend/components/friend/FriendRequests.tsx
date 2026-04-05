import { Button, toast } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

import { PageSpinner } from "../PageSpinner";

import { FriendRequestItem } from "./FriendRequestItem";

import {
  applyFriendRequest,
  declineFriendRequest,
  deleteFriendRequest,
  getFriendRequests,
} from "@/lib/client-requests/friend";
import { IFriendRequest } from "@/lib/models";
import { getWebsocketUrl, isEvent, WSEvent } from "@/lib/socket";
import countersStore from "@/store/counterStore";
import userStore from "@/store/userStore";

const FriendRequestsItems = observer(() => {
  const [requests, setRequests] = useState<IFriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user_id = userStore.user.id;

  const { lastJsonMessage } = useWebSocket(getWebsocketUrl, {
    share: true,
    filter: (message) => {
      return isEvent(message, WSEvent.ChangeIncomingFriendsRequests);
    },
  });

  useEffect(() => {
    async function fetchData() {
      setRequests(await getFriendRequests());
      setIsLoading(false);
    }
    fetchData();
  }, [lastJsonMessage]);

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
        variant="primary"
        onPress={async () => {
          const result = await applyFriendRequest(r.from_user.id);
          if (result && "code" in result) {
            toast.danger(result.message);
          } else {
            setRequests(await getFriendRequests());
            countersStore.getCounters();
            toast.success("Заявка принята");
          }
        }}
      >
        Принять
      </Button>
      <Button
        variant="danger-soft"
        onPress={async () => {
          const result = await declineFriendRequest(r.from_user.id);
          if (result && "code" in result) {
            toast.danger(result.message);
          } else {
            setRequests(await getFriendRequests());
            countersStore.getCounters();
            toast("Заявка отклонена");
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
        variant="danger-soft"
        onPress={async () => {
          const result = await deleteFriendRequest(r.to_user.id);
          if (result && "code" in result) {
            toast.danger(result.message);
          } else {
            setRequests(await getFriendRequests());
            countersStore.getCounters();
            toast.danger("Заявка отменена");
          }
        }}
      >
        Отменить
      </Button>
    </FriendRequestItem>
  ));
  return (
    <div className="flex flex-col gap-2">
      {incomingRequests.length ? (
        <>
          <p className="text-xl text-center my-2">Входящие</p>
          {inpomingItems}
        </>
      ) : null}
      {outcomingRequests.length ? (
        <>
          <p className="text-xl text-center my-2">Исходящие</p>
          {outcomingItems}
        </>
      ) : null}

      {}
    </div>
  );
});

export default FriendRequestsItems;
