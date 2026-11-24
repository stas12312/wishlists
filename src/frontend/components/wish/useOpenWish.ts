import { useRouter } from "next/navigation";

export function useOpenWish(uuid: string | undefined, openDrawer: () => void) {
  const router = useRouter();

  return () => {
    if (uuid && window.matchMedia("(width < 48rem)").matches) {
      router.push(`/wishes/${encodeURIComponent(uuid)}`);
      return;
    }

    openDrawer();
  };
}
