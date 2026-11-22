export function getArticleButtonUrl(value: string): string | undefined {
  const url = value.trim();
  const isInternal = url.startsWith("/");
  const origin = "https://article.invalid";

  let parsed: URL;
  try {
    parsed = new URL(url, isInternal ? origin : undefined);
  } catch {
    return;
  }

  if (isInternal) {
    if (
      parsed.origin === origin &&
      !url.startsWith("//") &&
      !parsed.pathname.startsWith("//")
    ) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return;
  }

  if (parsed.protocol === "https:" || parsed.protocol === "http:") {
    return parsed.href;
  }
}
