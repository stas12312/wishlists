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
