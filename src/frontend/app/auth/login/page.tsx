import { Metadata } from "next";
import { ReactNode } from "react";

import SignInForm from "@/components/auth/signInForm";
import { Yandex } from "@/components/logo/yandex";
import { getOgImageUrl } from "@/lib/label";
import { getOAuthProviders } from "@/lib/server-requests/auth";

export const dynamic = "force-dynamic";
const DESCRIPTION =
  "Вход в бесплатный сервис для составления вишлистов - Mywishlists";

export const metadata: Metadata = {
  title: "Mywishlists - Вход",
  description: DESCRIPTION,
  openGraph: {
    images: [getOgImageUrl("MyWishlists", "Вход")],
    title: "Mywishlists - Вход",
    description: DESCRIPTION,
  },
};

const PROVIDER_TO_ICON = new Map<string, ReactNode>([
  ["YANDEX", <Yandex key="YANDEX" className="rounded-full hover:opacity-80" />],
]);

export default async function Page() {
  const providers = await getOAuthProviders();
  providers.forEach((item) => {
    item.icon = PROVIDER_TO_ICON.get(item.name);
  });

  return <SignInForm providers={providers} />;
}
