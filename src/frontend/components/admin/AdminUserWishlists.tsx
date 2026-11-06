import { Button } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  AdminUserWishlist,
  getAdminUserWishlists,
  setAdminWishlistType,
} from "@/lib/client-requests/admin/user";
import { WishlistTypeChip } from "@/components/wishlist/WishlistChips";

export function AdminUserWishlists({ id }: { id: number }) {
  const [items, setItems] = useState<AdminUserWishlist[]>([]);
  const [pageRequest, setPageRequest] = useState({ offset: 0 });
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const { offset } = pageRequest;
    getAdminUserWishlists(id, offset)
      .then((page) => {
        if (!active) return;
        setItems((current) => (offset === 0 ? page : [...current, ...page]));
        setHasMore(page.length === 30);
      })
      .catch(() => {
        if (active) setError("Не удалось загрузить вишлисты");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, pageRequest]);

  async function changeType(wishlist: AdminUserWishlist) {
    setSaving(wishlist.uuid);
    setError("");
    try {
      await setAdminWishlistType(id, wishlist);
      setItems((current) =>
        current.map((item) =>
          item.uuid === wishlist.uuid
            ? { ...item, for_other: !wishlist.for_other }
            : item,
        ),
      );
    } catch {
      setError("Не удалось изменить тип вишлиста");
    } finally {
      setSaving(undefined);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p className="text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? <p className="text-muted">Загрузка…</p> : null}
      {!loading && !error && !items.length ? (
        <p className="text-muted">Вишлистов нет</p>
      ) : null}
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.uuid}
            className="flex flex-wrap items-center gap-3 rounded-xl bg-surface p-3"
          >
            <p className="min-w-0 flex-1 break-words font-medium">
              <Link
                className="underline underline-offset-2"
                href={`/wishlists/${item.uuid}`}
                prefetch={false}
              >
                {item.name}
              </Link>
              {!item.is_active ? (
                <span className="ml-2 text-sm text-muted">В архиве</span>
              ) : null}
            </p>
            <WishlistTypeChip forOther={item.for_other} />
            <Button
              isDisabled={!!saving}
              isPending={saving === item.uuid}
              size="sm"
              variant="secondary"
              onPress={() => void changeType(item)}
            >
              {item.for_other
                ? "Сменить на «Для себя»"
                : "Сменить на «Для другого»"}
            </Button>
          </li>
        ))}
      </ul>
      {hasMore || (!items.length && error) ? (
        <Button
          isDisabled={loading}
          variant="secondary"
          onPress={() => {
            setLoading(true);
            setError("");
            setPageRequest({ offset: items.length });
          }}
        >
          {error ? "Повторить загрузку" : "Показать ещё"}
        </Button>
      ) : null}
    </div>
  );
}
