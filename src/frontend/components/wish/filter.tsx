import { Tabs } from "@heroui/react";
import { useEffect, useState } from "react";
import { Key } from "@react-types/shared";

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
      <div className="flex flex-wrap flex-col gap-2">
        <Tabs
          key="filter1"
          aria-label="Переключатель фильтра исполненных"
          disabledKeys={
            reservedValue === "false" || reservedValue === "true"
              ? ["all", "true"]
              : undefined
          }
          selectedKey={fullfiledValue}
          onSelectionChange={setFullfiledValue}
        >
          <Tabs.ListContainer>
            <Tabs.List className="*:h-6 *:text-xs *:md:text-sm">
              <Tabs.Tab id="all">
                Все
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="true">
                Исполненные
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="false">
                Неисполненные
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
        {!hidedFilters.includes("reserved") ? (
          <Tabs
            key="filter2"
            aria-label="Переключатель фильтра заброинрованных"
            disabledKeys={
              fullfiledValue === "true" ? ["true", "false"] : undefined
            }
            selectedKey={reservedValue}
            onSelectionChange={setReservedValue}
          >
            <Tabs.ListContainer>
              <Tabs.List className="*:h-6 *:text-xs *:md:text-sm">
                <Tabs.Tab id="all">
                  Все
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="true">
                  Забронированные
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="false">
                  Незабронированные
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        ) : null}
      </div>
    </Filter>
  );
};
