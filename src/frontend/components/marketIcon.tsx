import { Image } from "@heroui/image";

import { getDomainFromUrl } from "@/lib/url";

const STATIC_URL = `${process.env.NEXT_PUBLIC_STATIC_URL}/static/icons`;

export const ICON_BY_DOMAIN = new Map<string, string>([
  ["ozon", getIconUrl(STATIC_URL, "ozon.ico")],
  ["wildberries", getIconUrl(STATIC_URL, "wildberries.ico")],
  ["global.wildberries", getIconUrl(STATIC_URL, "wildberries.ico")],
  ["market.yandex", getIconUrl(STATIC_URL, "yandex-market.png")],
  ["store.steampowered", getIconUrl(STATIC_URL, "steam.ico")],
  ["dns-shop", getIconUrl(STATIC_URL, "dns.png")],
  ["goldapple", getIconUrl(STATIC_URL, "goldapple.png")],
  ["afisha.yandex", getIconUrl(STATIC_URL, "yandex-afisha.ico")],
  ["aliexpress", getIconUrl(STATIC_URL, "aliexpress.png")],
  ["vk", getIconUrl(STATIC_URL, "vk.png")],
  ["chitai-gorod", getIconUrl(STATIC_URL, "chitai-gorod.png")],
  ["instagram", getIconUrl(STATIC_URL, "instagram.png")],
  ["randewoo", getIconUrl(STATIC_URL, "randewoo.png")],
]);
const MarketIcon = ({
  link,
  className = "",
  height = 32,
}: {
  link?: string;
  className?: string;
  height?: number;
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
      height={height}
      src={ICON_BY_DOMAIN.get(domain) as string}
    />
  );
};

function getIconUrl(baseUrl: string, icon: string): string {
  return `${baseUrl}/${icon}`;
}

export default MarketIcon;
