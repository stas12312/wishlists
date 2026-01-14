export function getCookie(name: string) {
  let match = document.cookie.match(new RegExp(name + "=([^;]+)"));
  return match ? match[1] : undefined;
}
