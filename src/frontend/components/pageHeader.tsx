import { Divider } from "@heroui/divider";
import { ReactNode } from "react";

const PageHeader = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mt-4 md:mt-0">
      <h1 className="text-2xl col-span-full text-center lg:text-left">
        {children}
      </h1>
      <Divider className="col-span-full my-4" />
    </div>
  );
};

export default PageHeader;
