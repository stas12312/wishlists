"use client";

import { observer } from "mobx-react-lite";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

import UserCard, { UserCardSkeleton } from "@/components/user/UserCard";
import { IWishlist } from "@/lib/models/wishlist";
import userStore from "@/store/userStore";

type WishlistOwner = { userId: number; username?: string } | null;
type RememberWishlists = (
  wishlists: IWishlist[],
  options?: { username?: string; unavailableUUID?: string },
) => void;

const ProfileContext = createContext<RememberWishlists>(() => {});
const ProfileViewerContext = createContext(0);

function getOwner(wishlist: IWishlist): WishlistOwner {
  return { userId: wishlist.user_id, username: wishlist.user?.username };
}

export const ProfileProvider = observer(function ProfileProvider({
  children,
  initialWishlist,
  initialWishlistUUID,
  initialUserId,
}: {
  children: React.ReactNode;
  initialWishlist: IWishlist | null;
  initialWishlistUUID?: string;
  initialUserId: number;
}) {
  const pathname = usePathname();
  const [owners, setOwners] = useState<Record<string, WishlistOwner>>(() =>
    initialWishlistUUID
      ? {
          [initialWishlistUUID]: initialWishlist
            ? getOwner(initialWishlist)
            : null,
        }
      : {},
  );

  const rememberWishlists = useCallback<RememberWishlists>(
    (wishlists, options) => {
      setOwners((previous) => {
        let next = previous;
        for (const wishlist of wishlists) {
          const existing = previous[wishlist.uuid];
          const owner = {
            userId: wishlist.user_id,
            username:
              wishlist.user?.username ??
              options?.username ??
              existing?.username,
          };
          if (
            existing?.userId === owner?.userId &&
            existing?.username === owner?.username
          ) {
            continue;
          }
          if (next === previous) next = { ...previous };
          next[wishlist.uuid] = owner;
        }
        if (
          options?.unavailableUUID &&
          previous[options.unavailableUUID] !== null
        ) {
          if (next === previous) next = { ...previous };
          next[options.unavailableUUID] = null;
        }
        return next;
      });
    },
    [],
  );

  useLayoutEffect(() => {
    if (initialWishlist) rememberWishlists([initialWishlist]);
  }, [initialWishlist, rememberWishlists]);

  const profileMatch = pathname.match(/^\/users\/([^/]+)(?:\/|$)/);
  const wishlistMatch = pathname.match(/^\/wishlists\/([^/]+)\/?$/);
  const owner = wishlistMatch ? owners[wishlistMatch[1]] : null;
  const viewerId = userStore.isLoading ? initialUserId : userStore.user.id;
  const username = profileMatch
    ? decodeURIComponent(profileMatch[1])
    : owner && owner.userId !== viewerId
      ? owner.username
      : undefined;

  return (
    <ProfileViewerContext.Provider value={viewerId}>
      <ProfileContext.Provider value={rememberWishlists}>
        {username ? (
          <UserCard key={`${viewerId}:${username}`} username={username} />
        ) : wishlistMatch && owner === undefined ? (
          <UserCardSkeleton />
        ) : null}
        {children}
      </ProfileContext.Provider>
    </ProfileViewerContext.Provider>
  );
});

export function useRememberWishlists() {
  return useContext(ProfileContext);
}

export function useProfileViewerId() {
  return useContext(ProfileViewerContext);
}
