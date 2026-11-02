import type { OgTheme } from "@/components/OGImage";

export function getLabelForCount(count: number, labels: string[]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return labels[
    count % 100 > 4 && count % 100 < 20
      ? 2
      : cases[count % 10 < 5 ? count % 10 : 5]
  ];
}

export function getUserLink(username: string): string {
  return `${window.location.origin}/users/${username}`;
}

export function getOgImageUrl(
  title: string,
  description?: string,
  footer?: string,
  options: { color?: string; emoji?: string; theme?: OgTheme } = {},
): string {
  const params = new URLSearchParams({
    title,
    description: description || "",
    footer: footer || "",
  });
  if (options.color) {
    params.set("color", options.color);
  }
  if (options.emoji) {
    params.set("emoji", options.emoji);
  }
  if (options.theme) {
    params.set("theme", options.theme);
  }
  return `/image/opengraph?${params.toString()}`;
}
