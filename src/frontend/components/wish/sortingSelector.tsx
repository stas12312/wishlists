import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { useEffect, useState } from "react";
import { MdArrowDownward, MdArrowUpward, MdCheck } from "react-icons/md";

export interface ISorting {
  field: string;
  desc: boolean;
}

const items = [
  {
    name: "Дате добавления",
    key: "created_at",
  },
  {
    name: "Цене",
    key: "cost",
  },
  {
    name: "Желанности",
    key: "desirability",
  },
  {
    name: "Возрастанию",
    key: "abs",
    desk: false,
  },
  {
    name: "Убыванию",
    key: "desc",
    desk: true,
  },
];

export const SortingSelector = ({
  defaultField,
  onChangeSorting,
}: {
  onChangeSorting: { (sorting: ISorting): void };
  defaultField: string;
}) => {
  const [field, setField] = useState(defaultField);
  const [desc, setDesc] = useState(true);

  useEffect(() => {
    onChangeSorting({ field: field, desc: desc });
  }, [field, desc]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          startContent={desc ? <MdArrowDownward /> : <MdArrowUpward />}
          variant="flat"
        >
          {
            (
              items.find((value) => {
                return value.key === field;
              }) || items[0]
            ).name
          }
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Сортировка"
        items={items}
        onAction={(action) => {
          if (action === "desc") {
            setDesc(true);
            return;
          }
          if (action === "abs") {
            setDesc(false);
            return;
          }
          setField(action.toString());
        }}
      >
        {(item) => (
          <DropdownItem
            key={item.key}
            showDivider={item.name === "Желанности"}
            startContent={
              item.key == field || item.desk === desc ? (
                <MdCheck />
              ) : (
                <span className="w-4" />
              )
            }
          >
            {item.name}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};
