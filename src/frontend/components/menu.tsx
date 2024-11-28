"use client";

import { logout } from "@/lib/auth";
import { Listbox, ListboxItem, ListboxSection } from "@nextui-org/listbox";
import { useRouter } from "next/navigation";

export default function Menu() {
  const router = useRouter();

  return (
    <Listbox className="text-center" disabledKeys={["friends"]}>
      <ListboxSection showDivider>
        <ListboxItem
          key="main"
          onPress={(e) => {
            router.push("/");
          }}
        >
          Мои вишлисты
        </ListboxItem>
        <ListboxItem
          key="settings"
          onPress={(e) => {
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
