import { Image } from "@heroui/image";

import { getDomainFromUrl } from "@/lib/url";

const STATIC_URL = `${process.env.NEXT_PUBLIC_STATIC_URL}/static/icons`;

const ICON_BY_DOMAIN = new Map<string, string>([
  ["ozon", getIconUrl(STATIC_URL, "ozon.ico")],
  ["wildberries", getIconUrl(STATIC_URL, "wildberries.ico")],
  ["market.yandex", getIconUrl(STATIC_URL, "yandex-market.png")],
  ["store.steampowered", getIconUrl(STATIC_URL, "steam.ico")],
  ["dns-shop", getIconUrl(STATIC_URL, "dns.png")],
  ["goldapple", getIconUrl(STATIC_URL, "goldapple.png")],
  ["afisha.yandex", getIconUrl(STATIC_URL, "yandex-afisha.ico")],
]);
const MarketIcon = ({
  link,
  className = "",
}: {
  link?: string;
  className?: string;
}) => {
  if (!link) {
    return;
  }

  const domain = getDomainFromUrl(link);

  if (!ICON_BY_DOMAIN.has(domain)) {
    return null;
  }
  return (
    <Image
      removeWrapper
      className={className}
      height={32}
      src={ICON_BY_DOMAIN.get(domain) as string}
    />
  );
};

function getIconUrl(baseUrl: string, icon: string): string {
  return `${baseUrl}/${icon}`;
}

export default MarketIcon;
