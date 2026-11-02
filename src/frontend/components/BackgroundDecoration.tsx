export function BackgroundDecoration() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 isolate overflow-hidden"
    >
      <div className="absolute -top-32 -left-24 size-80 rounded-full bg-blue-500/10 blur-3xl transform-gpu md:-top-56 md:-left-56 md:size-120 dark:bg-blue-500/25" />
      <div className="absolute top-60 -right-32 size-88 rounded-full bg-violet-500/10 blur-3xl transform-gpu md:top-72 md:-right-40 md:size-140 dark:bg-violet-500/20" />
    </div>
  );
}
