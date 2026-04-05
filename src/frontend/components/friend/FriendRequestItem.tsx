import { Card } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { usePress } from "react-aria";

import { UserAvatar } from "../user/UserAvatar";

import { getUserLink } from "@/lib/label";
import { IUser } from "@/lib/models/user";

export const FriendRequestItem = observer(
  ({ user, children }: { user: IUser; children?: ReactNode }) => {
    const router = useRouter();
    const { pressProps } = usePress({
      onPress: () => router.push(getUserLink(user.username)),
    });
    return (
      <Card className="max-w-250 mx-auto w-full">
        <Card.Content className="flex flex-row gap-4 justify-between">
          <div {...pressProps} className="cursor-pointer">
            <UserAvatar description={user.username} name={user.name} />
          </div>

          <div className="flex gap-1">{children}</div>
        </Card.Content>
      </Card>
    );
  },
);
