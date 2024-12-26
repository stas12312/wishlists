"use client";

import { Listbox, ListboxItem, ListboxSection } from "@nextui-org/listbox";
import { useRouter } from "next/navigation";

import { logout } from "@/lib/auth";

export default function Menu() {
  const router = useRouter();

  return (
    <Listbox
      className="text-center"
      disabledKeys={["friends"]}
      aria-label="main menu"
    >
      <ListboxSection showDivider>
        <ListboxItem key="main" href="/">
          Мои вишлисты
        </ListboxItem>
        <ListboxItem key="wishes" href="/wishes">
          Желания
        </ListboxItem>
        <ListboxItem key="settings" href="/settings">
          Настройки
        </ListboxItem>
        <ListboxItem key="friends">Друзья</ListboxItem>
      </ListboxSection>
      <ListboxSection>
        <ListboxItem
          key="logout"
          className="text-danger"
          onPress={() => logout()}
        >
          Выход
        </ListboxItem>
      </ListboxSection>
    </Listbox>
  );
}
