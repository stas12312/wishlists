import { useId, useSyncExternalStore } from "react";

const WISH_DRAWER_CHANGE = "wish-drawer-change";
let closingEntry: string | undefined;

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(WISH_DRAWER_CHANGE, onChange);

  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(WISH_DRAWER_CHANGE, onChange);
  };
}

function getServerSnapshot() {
  return false;
}

export function useWishDrawer(uuid: string | undefined) {
  const id = useId();
  const entry = `${uuid ?? ""}:${id}`;
  const isCurrentEntry = () => window.history.state?.wishDrawer === entry;
  const isOpen = useSyncExternalStore(
    subscribe,
    isCurrentEntry,
    getServerSnapshot,
  );

  function open() {
    if (isCurrentEntry()) return;

    window.history.pushState({ wishDrawer: entry }, "");
    window.dispatchEvent(new Event(WISH_DRAWER_CHANGE));
  }

  function close() {
    if (!isCurrentEntry() || closingEntry === entry) return;

    closingEntry = entry;
    window.addEventListener(
      "popstate",
      () => {
        closingEntry = undefined;
      },
      { once: true },
    );
    window.history.back();
  }

  return { isOpen, open, close };
}
