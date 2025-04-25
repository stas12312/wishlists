import { Tab, Tabs } from "@heroui/tabs";
import { useEffect, useState } from "react";
import { Key } from "@react-types/shared";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Button } from "@heroui/button";
import { MdFilterAlt } from "react-icons/md";
import { useDisclosure } from "@heroui/modal";
import { Badge } from "@heroui/badge";

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
    <>
      <Popover
        showArrow
        isOpen={isOpen}
        offset={20}
        placement="bottom"
        onClose={() => {
          onChangeFilter({
            fullfiled: fullfiledValue as filterValue,
            reserved: reservedValue as filterValue,
          });
        }}
        onOpenChange={onOpenChange}
      >
        <Badge
          color="primary"
          content=""
          isInvisible={fullfiledValue === "all" && reservedValue === "all"}
        >
          <PopoverTrigger>
            <Button isIconOnly variant="flat" onPress={onOpenChange}>
              <MdFilterAlt />
            </Button>
          </PopoverTrigger>
        </Badge>

        <PopoverContent className="p-2">
          <h3>Фильтры</h3>
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
          <Button
            fullWidth
            color="primary"
            size="sm"
            onPress={() => {
              onOpenChange();
              onChangeFilter({
                fullfiled: fullfiledValue as filterValue,
                reserved: reservedValue as filterValue,
              });
            }}
          >
            Применить
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
};
