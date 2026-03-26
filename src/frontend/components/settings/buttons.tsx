import { Button, Separator, toast } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { MdDelete, MdOutlineExitToApp } from "react-icons/md";
import { useState } from "react";

import ConfirmationModal from "../confirmation";

import userStore from "@/store/userStore";
import { logout } from "@/lib/auth";
import { deleteAccount } from "@/lib/client-requests/user";

export const DeleteAccountButton = observer(() => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        fullWidth
        variant="danger-soft"
        onPress={async () => {
          setIsOpen(true);
        }}
      >
        <MdDelete />
        Удалить аккаунт
      </Button>
      <ConfirmationModal
        confirmByText={true}
        confirmName="Удалить"
        confirmText={userStore.user.email}
        declineName="Отменить"
        isOpen={isOpen}
        message={
          <>
            <span className="text-center">
              Данное действие необратимо, все ваши желания и список друзей будут
              удалены безвозвратно
            </span>
            <Separator className="my-2" />
            <div className="flex flex-col justify-center">
              <span className="text-center">
                Для подтверждения введите ваш e-mail:
              </span>

              <span className="text-default-500 mx-auto">
                {" "}
                {userStore.user.email}
              </span>
            </div>
          </>
        }
        title="Подтвердите удаление аккаунта"
        onConfirm={async () => {
          const result = await deleteAccount();
          if ("message" in result) {
            toast.danger(result.message);
          } else {
            userStore.logout();
            toast("Аккаунт удален");
            await logout();
          }
        }}
        onDecline={() => {
          setIsOpen(false);
        }}
      />
    </>
  );
});

export const ExitButton = observer(() => {
  return (
    <Button
      fullWidth
      variant="danger"
      onPress={async () => {
        userStore.logout();
        await logout();
      }}
    >
      <MdOutlineExitToApp />
      Выйти
    </Button>
  );
});
