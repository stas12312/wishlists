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
      <Surface className="flex flex-col gap-1 rounded-3xl p-4 m-1 shadow-xl">
        {children}
      </Surface>
    </>
  );
};

export default SettingItem;
