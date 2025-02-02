import { Button } from "@nextui-org/button";
import { observer } from "mobx-react-lite";
import { MdDelete, MdOutlineExitToApp } from "react-icons/md";
import { useState } from "react";
import toast from "react-hot-toast";
import { Divider } from "@nextui-org/divider";

import ConfirmationModal from "../confirmation";

import userStore from "@/store/userStore";
import { logout } from "@/lib/auth";
import { deleteAccount } from "@/lib/requests/user";

export const DeleteAccountButton = observer(() => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        fullWidth
        color="danger"
        startContent={<MdDelete />}
        variant="light"
        onPress={async () => {
          setIsOpen(true);
        }}
      >
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
              удалены беззвозвратно
            </span>
            <Divider className="my-2" />
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
            toast.error(result.message);
          } else {
            userStore.logout();
            toast.success("Аккаунт удален");
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
      color="danger"
      startContent={<MdOutlineExitToApp />}
      variant="light"
      onPress={async () => {
        userStore.logout();
        await logout();
      }}
    >
      Выйти
    </Button>
  );
});
