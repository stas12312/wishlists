import { Divider } from "@heroui/divider";
import { ReactNode } from "react";

const PageHeader = ({
  title,
  children,
  dividerClassName = "mt-2 mb-4",
}: {
  title?: string;
  children?: ReactNode;
  dividerClassName?: string;
}) => {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl text-center md:text-left">{title}</h1>
      {children}
      <Divider className={dividerClassName} />
    </div>
  );
};

export default PageHeader;
