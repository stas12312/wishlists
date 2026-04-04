"use client";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export const ActiveIcon = ({
  icon,
  className,
  activeClassName,
  path,
}: {
  icon: ReactNode;
  className: string;
  activeClassName: string;
  path: string;
}) => {
  const pathname = usePathname();

  return (
    <span className={pathname == path ? activeClassName : className}>
      {icon}
    </span>
  );
};
