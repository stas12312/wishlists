export function isURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getDomainFromUrl(url: string): string {
  const match = url.match(
    /^ *(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)\./im,
  );
  return match ? match[1] : "";
}

export function extractLink(rawUrl: string): string {
  const match = rawUrl.match(
    /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=\/]*)/im,
  );
  return match ? match[1] : "";
}
