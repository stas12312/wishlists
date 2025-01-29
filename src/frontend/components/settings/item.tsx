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
      <div className="flex flex-col gap-1 rounded-xl bg-content1 box-border shadow-medium p-4 m-1">
        {children}
      </div>
    </>
  );
};

export default SettingItem;
