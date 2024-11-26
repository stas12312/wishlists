"use client";

import { logout } from "@/lib/auth";
import { Listbox, ListboxItem, ListboxSection } from "@nextui-org/listbox";
import { useRouter } from "next/navigation";

export default function Menu() {
  const router = useRouter();

  return (
    <Listbox className="text-center" disabledKeys={["settings", "friends"]}>
      <ListboxSection showDivider>
        <ListboxItem
          key="main"
          onPress={(e) => {
            router.push("/");
          }}
        >
          Мои вишлисты
        </ListboxItem>
        <ListboxItem key="settings">Настройки</ListboxItem>
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
    // <Navbar className="flex flex-col">
    //   <NavbarContent className="gap-4 fiex flex-col">
    //     <UserItem />
    //     <NavbarItem isActive>
    //       <Link color="foreground" href="/">
    //         Мои желания
    //       </Link>
    //     </NavbarItem>
    //     <NavbarItem>
    //       <Link href="#" color="foreground" aria-current="page">
    //         Настройки
    //       </Link>
    //     </NavbarItem>
    //     <Divider />
    //     <NavbarItem>
    //       <Link color="danger" href="/logout">
    //         Выход
    //       </Link>
    //     </NavbarItem>
    //   </NavbarContent>
    // </Navbar>
  );
}
