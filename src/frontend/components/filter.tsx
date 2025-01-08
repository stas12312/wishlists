import { Select, SelectItem } from "@nextui-org/select";

import { IWishlistFilter } from "./wishlist/list";
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
        className="max-w-xs"
        defaultSelectedKeys={["active"]}
        label="Статус"
        size="sm"
        onSelectionChange={(key) => {
          setFilter({ ...filter, showArchive: key.currentKey == "deleted" });
        }}
      >
        <SelectItem key="active">Активные</SelectItem>
        <SelectItem key="deleted">Архивированные</SelectItem>
        {/* <SelectItem key="past">Прошедшие</SelectItem> */}
      </Select>
    </>
  );
};

export default WishlistFilter;
