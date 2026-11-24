import Link from "next/link";
import { MdArrowBack, MdOutlineError } from "react-icons/md";

export default function NotFound() {
  return (
    <main className="grid min-h-[calc(100dvh-var(--telegram-top-inset))] place-items-center px-3 py-8">
      <section className="flex w-full max-w-lg flex-col items-center rounded-3xl border border-default bg-surface px-5 py-10 text-center shadow-sm sm:py-14">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent-soft text-4xl sm:size-24 sm:rounded-3xl sm:text-5xl">
          <MdOutlineError aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold sm:text-2xl">
          404 · Страница не найдена
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted sm:text-base">
          Возможно, ссылка устарела или в адресе есть опечатка.
        </p>
        <Link
          className="button button--secondary mt-6 w-full sm:w-auto"
          href="/"
        >
          <MdArrowBack aria-hidden="true" />
          На главную
        </Link>
      </section>
    </main>
  );
}
