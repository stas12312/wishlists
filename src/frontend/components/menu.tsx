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
  console.log("Счетсики", countersStore.friendCounters.incoming_requests);
  return (
    <Listbox className="text-center" aria-label="main menu">
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
        <ListboxItem key="friends" href="/friends">
          <span>
            Друзья{" "}
            {countersStore.friendCounters.incoming_requests ? (
              <Chip
                color="primary"
                size="sm"
                className="my-auto"
                variant="flat"
              >
                {countersStore.friendCounters.incoming_requests}
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
