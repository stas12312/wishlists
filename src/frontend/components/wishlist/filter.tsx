import { Select, SelectItem } from "@heroui/select";

import { IWishlistFilter } from "./list";
const WishlistFilter = ({
  filter,
  setFilter,
}: {
  filter: IWishlistFilter;
  setFilter: { (filter: IWishlistFilter): void };
}) => {
  return (
    <>
      <Select
        disallowEmptySelection
        className="max-w-xs"
        data-qa="status-filter"
        defaultSelectedKeys={["active"]}
        label="Статус"
        size="sm"
        onSelectionChange={(key) => {
          setFilter({ ...filter, showArchive: key.currentKey == "deleted" });
        }}
      >
        <SelectItem key="active" data-qa="filter-active">
          Активные
        </SelectItem>
        <SelectItem key="deleted" data-qa="filter-deleted">
          Архивированные
        </SelectItem>
        {/* <SelectItem key="past">Прошедшие</SelectItem> */}
      </Select>
    </>
  );
};

export default WishlistFilter;
