import { Label, Slider, Tabs } from "@heroui/react";
import { Key } from "@react-types/shared";
import { useEffect, useState } from "react";

import Filter from "../Filter";

type filterValue = "all" | "true" | "false";

export interface IWishFilter {
  fullfiled: filterValue;
  reserved: filterValue;
  priceFrom: number;
  priceTo: number;
}

export const WishFilter = ({
  hidedFilters = [],
  onChangeFilter,
  initValues,
}: {
  hidedFilters?: string[];
  onChangeFilter: { (filter: IWishFilter): void };
  initValues: IWishFilter & { currency: string };
}) => {
  const [fullfiledValue, setFullfiledValue] = useState<Key>("all");
  const [reservedValue, setReservedValue] = useState<Key>("all");
  const [priceFrom, setPriceFrom] = useState<number | undefined>();
  const [priceTo, setPriceTo] = useState<number | undefined>();

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
          priceFrom: priceFrom ?? -Infinity,
          priceTo: priceTo ?? Infinity,
        });
      }}
      isShowBadge={
        !(
          fullfiledValue === "all" &&
          reservedValue === "all" &&
          priceFrom === undefined &&
          priceTo === undefined
        )
      }
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
        {initValues.priceTo > 0 &&
        initValues.priceTo !== initValues.priceFrom ? (
          <Slider
            defaultValue={[initValues.priceFrom, initValues.priceTo]}
            formatOptions={{ style: "currency", currency: initValues.currency }}
            maxValue={initValues.priceTo}
            minValue={initValues.priceFrom}
            value={[
              priceFrom ?? initValues.priceFrom,
              priceTo ?? initValues.priceTo,
            ]}
            onChange={(values) => {
              if (!Array.isArray(values)) {
                return;
              }
              setPriceFrom(
                values[0] === initValues.priceFrom ? undefined : values[0],
              );
              setPriceTo(
                values[1] === initValues.priceTo ? undefined : values[1],
              );
            }}
          >
            <Label>Цена</Label>
            <Slider.Output />
            <Slider.Track>
              {({ state }) => (
                <>
                  <Slider.Fill />
                  {state.values.map((_, i) => (
                    <Slider.Thumb key={i} index={i} />
                  ))}
                </>
              )}
            </Slider.Track>
          </Slider>
        ) : null}
      </div>
    </Filter>
  );
};
