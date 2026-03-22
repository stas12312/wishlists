import { Surface } from "@heroui/react";
import { ReactNode } from "react";

const SettingItem = ({
  header,
  children,
}: {
  header: string;
  children: ReactNode;
}) => {
  return (
    <>
      <p className="text-xl">{header}</p>
      <Surface className="flex flex-col gap-1 rounded-xl p-4 m-1">
        {children}
      </Surface>
    </>
  );
};

export default SettingItem;
