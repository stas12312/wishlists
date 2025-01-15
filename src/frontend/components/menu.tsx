"use client";

import { Listbox, ListboxItem, ListboxSection } from "@nextui-org/listbox";
import { Chip } from "@nextui-org/chip";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import countersStore from "@/store/counterStore";
import { logout } from "@/lib/auth";
import userStore from "@/store/userStore";

const Menu = observer(() => {
  useEffect(() => {
    async function fetchData() {
      countersStore.getCounters();
    }
    fetchData();
  }, []);
  return (
    <Listbox aria-label="main menu" className="text-center">
      <ListboxSection showDivider>
        <ListboxItem key="main" className="h-[34px]" href="/">
          Мои вишлисты
        </ListboxItem>
        <ListboxItem key="wishes" className="h-[34px]" href="/wishes">
          Желания
        </ListboxItem>
        <ListboxItem key="settings" className="h-[34px]" href="/settings">
          Настройки
        </ListboxItem>
        <ListboxItem key="friends" className="h-[34px]" href="/friends">
          <span>
            Друзья{" "}
            {countersStore.friendCounters.incoming_requests ? (
              <Chip className="my-auto" color="primary" radius="sm" size="sm">
                {countersStore.friendCounters.incoming_requests.toLocaleString()}
              </Chip>
            ) : (
              ""
            )}
          </span>
        </ListboxItem>
      </ListboxSection>
      <ListboxSection>
        <ListboxItem
          key="logout"
          className="text-danger"
          onPress={() => {
            userStore.logout();
            logout();
          }}
        >
          Выход
        </ListboxItem>
      </ListboxSection>
    </Listbox>
  );
});

export default Menu;
