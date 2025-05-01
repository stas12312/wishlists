import { Tabs, Tab } from "@heroui/tabs";
import { useState } from "react";
import { Key } from "@react-types/shared";

import Filter from "../filter";

import { IWishlistFilter } from "./list";
const WishlistFilter = ({
  filter,
  setFilter,
}: {
  filter: IWishlistFilter;
  setFilter: { (filter: IWishlistFilter): void };
}) => {
  const [activeValue, setActivaValue] = useState<Key>(
    filter.showArchive ? "false" : "true",
  );

  return (
    <Filter
      applyFilter={() => {
        setFilter({ ...filter, showArchive: activeValue === "false" });
      }}
      isShowBadge={activeValue === "false"}
    >
      <Tabs
        key="filter1"
        aria-label="Tabs sizes"
        selectedKey={activeValue}
        size="sm"
        onSelectionChange={setActivaValue}
      >
        <Tab key="true" title="Активные" />
        <Tab key="false" title="Архивные" />
      </Tabs>
    </Filter>
  );
};

export default WishlistFilter;
