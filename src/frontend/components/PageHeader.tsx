import { Separator } from "@heroui/react";
import { ReactNode } from "react";

const PageHeader = ({
  title,
  actions,
  children,
  dividerClassName = "mt-2 mb-4",
}: {
  title?: string;
  actions?: ReactNode;
  children?: ReactNode;
  dividerClassName?: string;
}) => {
  return (
    <div className="flex flex-col">
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">
          {title ? <h1 className="text-2xl">{title}</h1> : null}
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        </div>
      ) : title ? (
        <h1 className="text-2xl text-center md:text-left">{title}</h1>
      ) : null}
      {children}
      <Separator className={dividerClassName} />
    </div>
  );
};

export default PageHeader;
