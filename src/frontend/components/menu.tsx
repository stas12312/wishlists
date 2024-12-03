"use client";

import { Listbox, ListboxItem, ListboxSection } from "@nextui-org/listbox";
import { useRouter } from "next/navigation";

import { logout } from "@/lib/auth";

export default function Menu() {
  const router = useRouter();

  return (
    <Listbox className="text-center" disabledKeys={["friends", "settings"]}>
      <ListboxSection showDivider>
        <ListboxItem
          key="main"
          onPress={() => {
            router.push("/");
          }}
        >
          Мои вишлисты
        </ListboxItem>
        <ListboxItem
          key="settings"
          onPress={() => {
            router.push("/settings");
          }}
        >
          Настройки
        </ListboxItem>
        <ListboxItem key="friends">Друзья</ListboxItem>
      </ListboxSection>
      <ListboxSection>
        <ListboxItem
          key="logout"
          className="text-danger"
          onClick={() => logout()}
        >
          Выход
        </ListboxItem>
      </ListboxSection>
    </Listbox>
  );
}
