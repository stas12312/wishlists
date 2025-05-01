import { Tab, Tabs } from "@heroui/tabs";
import { useEffect, useState } from "react";
import { Key } from "@react-types/shared";
import { useDisclosure } from "@heroui/modal";

import Filter from "../filter";

type filterValue = "all" | "true" | "false";

export interface IWishFilter {
  fullfiled: filterValue;
  reserved: filterValue;
}

export const WishFilter = ({
  hidedFilters = [],
  onChangeFilter,
}: {
  hidedFilters?: string[];
  onChangeFilter: { (filter: IWishFilter): void };
}) => {
  const [fullfiledValue, setFullfiledValue] = useState<Key>("all");
  const [reservedValue, setReservedValue] = useState<Key>("all");
  const { isOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (fullfiledValue === "true") {
      setReservedValue("all");
    } else if (reservedValue === "true" || reservedValue === "false") {
      setFullfiledValue("false");
    }
  }, [fullfiledValue, reservedValue]);

  return (
    <Filter
      applyFilter={() => {
        onChangeFilter({
          fullfiled: fullfiledValue as filterValue,
          reserved: reservedValue as filterValue,
        });
      }}
      isShowBadge={!(fullfiledValue === "all" && reservedValue === "all")}
    >
      <div className="flex flex-wrap flex-col gap-4 p-4">
        <Tabs
          key="filter1"
          aria-label="Tabs sizes"
          disabledKeys={
            reservedValue === "false" || reservedValue === "true"
              ? ["all", "true"]
              : undefined
          }
          selectedKey={fullfiledValue}
          size="sm"
          onSelectionChange={setFullfiledValue}
        >
          <Tab key="all" title="Все" />
          <Tab key="true" title="Исполненные" />
          <Tab key="false" title="Неисполненные" />
        </Tabs>
        {!hidedFilters.includes("reserved") ? (
          <Tabs
            key="filter2"
            aria-label="Tabs sizes"
            disabledKeys={
              fullfiledValue === "true" ? ["true", "false"] : undefined
            }
            selectedKey={reservedValue}
            size="sm"
            onSelectionChange={setReservedValue}
          >
            <Tab key="all" title="Все" />
            <Tab key="true" title="Забронированные" />
            <Tab key="false" title="Незабронированные" />
          </Tabs>
        ) : null}
      </div>
    </Filter>
  );
};
