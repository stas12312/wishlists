import Link from "next/link";
import { MdArrowBack, MdOutlineError } from "react-icons/md";

import { EmptyState } from "./EmptyState";

export function UnavailablePage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <EmptyState
      action={
        <Link className="button button--secondary w-full sm:w-auto" href="/">
          <MdArrowBack aria-hidden="true" />
          На главную
        </Link>
      }
      className="mx-auto mt-4 max-w-lg border-solid bg-surface px-5 py-10 shadow-sm md:mt-10 md:py-14"
      description={description}
      icon={<MdOutlineError />}
      title={title}
    />
  );
}
