import { Tabs, Tab } from "@heroui/react";
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
  const [activeValue, setActiveValue] = useState<Key>(
    filter.showArchive ? "false" : "true",
  );

  return (
    <Filter
      applyFilter={() => {
        if (filter.showArchive != (activeValue === "false")) {
          setFilter({ ...filter, showArchive: activeValue === "false" });
        }
      }}
      isShowBadge={activeValue === "false"}
    >
      <Tabs
        key="filter1"
        selectedKey={activeValue}
        onSelectionChange={setActiveValue}
      >
        <Tabs.ListContainer>
          <Tabs.List className="*:h-6">
            <Tab id="true">
              Активные
              <Tabs.Indicator />
            </Tab>
            <Tab id="false">
              Архивные
              <Tabs.Indicator />
            </Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </Filter>
  );
};

export default WishlistFilter;
