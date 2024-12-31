"use client";

import { Listbox, ListboxItem, ListboxSection } from "@nextui-org/listbox";

import { logout } from "@/lib/auth";
import countersStore from "@/store/counterStore";
import { Chip } from "@nextui-org/chip";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

const Menu = observer(() => {
  useEffect(() => {
    async function fetchData() {
      countersStore.getCounters();
    }
    fetchData();
  }, []);
  return (
    <Listbox className="text-center" aria-label="main menu">
      <ListboxSection showDivider>
        <ListboxItem key="main" href="/" className="h-[34px]">
          Мои вишлисты
        </ListboxItem>
        <ListboxItem key="wishes" href="/wishes" className="h-[34px]">
          Желания
        </ListboxItem>
        <ListboxItem key="settings" href="/settings" className="h-[34px]">
          Настройки
        </ListboxItem>
        <ListboxItem key="friends" href="/friends" className="h-[34px]">
          <span>
            Друзья{" "}
            {countersStore.friendCounters.incoming_requests ? (
              <Chip radius="sm" size="sm" color="primary" className="my-auto">
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
          onPress={() => logout()}
        >
          Выход
        </ListboxItem>
      </ListboxSection>
    </Listbox>
  );
});

export default Menu;
