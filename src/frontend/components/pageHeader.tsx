import { Divider } from "@heroui/divider";
import { ReactNode } from "react";

const PageHeader = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl text-center md:text-left">{children}</h1>
      <Divider className="my-4" />
    </div>
  );
};

export default PageHeader;
